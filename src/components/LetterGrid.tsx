import React, { useRef, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { Coordinate, PlacedWord } from '../types';
import { soundManager } from '../services/sound';

interface Props {
  grid: string[][];
  words: PlacedWord[];
  onWordFound: (word: PlacedWord) => void;
  hintStartCell: Coordinate | null;
  highContrast?: boolean;
  isCompleting?: boolean;
}

interface LetterCellProps {
  cellKey: string;
  rowIndex: number;
  colIndex: number;
  letter: string;
  gridSize: number;
  isSelected: boolean;
  isFound: boolean;
  primaryFoundColor?: string;
  isHinted: boolean;
  isJustFound: boolean;
  isCompleting: boolean;
  dropDelay: string;
  victoryDelay: string;
}

/** LetterCell — fully memoized, only re-renders when props differ */
const LetterCell = React.memo<LetterCellProps>(
  ({
    cellKey, rowIndex: _r, colIndex: _c,
    letter, gridSize,
    isSelected, isFound, primaryFoundColor,
    isHinted, isJustFound, isCompleting,
    dropDelay, victoryDelay,
  }) => {
    // Track whether the initial drop animation has already played.
    // After mount, we freeze the animation class so re-renders don't re-trigger it.
    const droppedRef = useRef(false);
    const [hasDrop] = useState(() => true); // always true on first render
    React.useEffect(() => { droppedRef.current = true; }, []);

    // Decide which animation class to apply
    const animClass = isCompleting
      ? 'anim-victory-wave z-20'
      : isJustFound
      ? 'anim-word-pop z-30'
      : isSelected
      ? 'anim-cell-select z-20'
      : !droppedRef.current && hasDrop
      ? 'anim-tile-drop z-10'
      : 'z-10'; // already dropped — no class, no lag

    const animDelay = isCompleting
      ? victoryDelay
      : (!droppedRef.current && hasDrop)
      ? dropDelay
      : '0s';

    return (
      <div
        id={`lc-${cellKey}`}
        className={`relative flex items-center justify-center font-black select-none border-0 bg-transparent shadow-none transform-gpu ${animClass}`}
        style={{
          touchAction: 'none',
          contain: 'layout paint style',
          animationDelay: animDelay,
        }}
      >
        {/* Letter */}
        <span
          className={`leading-none select-none tracking-wide pointer-events-none ${
            isSelected
              ? 'text-blue-600 font-black drop-shadow-[0_0_8px_rgba(37,99,235,0.7)]'
              : isHinted
              ? 'text-amber-500 font-black animate-pulse drop-shadow-[0_0_10px_rgba(245,158,11,0.9)]'
              : isJustFound
              ? `font-black anim-letter-shimmer`
              : isFound
              ? 'font-black'
              : 'text-slate-800 font-extrabold'
          } ${
            gridSize <= 5
              ? 'text-2xl sm:text-3xl'
              : gridSize <= 7
              ? 'text-xl sm:text-2xl'
              : gridSize <= 8
              ? 'text-lg sm:text-xl'
              : 'text-base sm:text-lg'
          }`}
          style={
            !isSelected && isFound && primaryFoundColor
              ? { color: primaryFoundColor }
              : undefined
          }
        >
          {letter}
        </span>

        {/* Subtle radial glow behind selected letter */}
        {isSelected && (
          <span
            aria-hidden
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 68%)' }}
          />
        )}
      </div>
    );
  },
  (p, n) =>
    p.letter === n.letter &&
    p.isSelected === n.isSelected &&
    p.isFound === n.isFound &&
    p.primaryFoundColor === n.primaryFoundColor &&
    p.isHinted === n.isHinted &&
    p.isJustFound === n.isJustFound &&
    p.isCompleting === n.isCompleting &&
    p.gridSize === n.gridSize
);
LetterCell.displayName = 'LetterCell';

/* ── Sparkle particle ── */
interface Sparkle { id: string; x: number; y: number; color: string; tx: number; ty: number; rot: number; size: number; }
/* ── Score float ── */
interface ScoreFloat { id: string; word: string; x: number; y: number; color: string; }

export const LetterGrid: React.FC<Props> = ({
  grid, words, onWordFound,
  hintStartCell, highContrast = false, isCompleting = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const boardRef     = useRef<HTMLDivElement>(null);
  const cachedRectRef      = useRef<DOMRect | null>(null);
  const lastPointerCellRef = useRef<Coordinate | null>(null);
  const isSelectingRef     = useRef(false);   // ← ref instead of state (no re-render on move)
  const startCoordRef      = useRef<Coordinate | null>(null);

  const [currentSelection, setCurrentSelection] = useState<Coordinate[]>([]);
  const [isWrongSelection,  setIsWrongSelection]  = useState(false);
  const [justFoundCells,    setJustFoundCells]    = useState<Coordinate[] | null>(null);
  const [sparkles,          setSparkles]           = useState<Sparkle[]>([]);
  const [scoreFloats,       setScoreFloats]        = useState<ScoreFloat[]>([]);

  const prevFoundCountRef      = useRef(words.filter(w => w.found).length);
  const justFoundTimeoutRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrongSelectionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sparkleIdRef           = useRef(0);

  // Cleanup timers
  React.useEffect(() => () => {
    if (justFoundTimeoutRef.current)    clearTimeout(justFoundTimeoutRef.current);
    if (wrongSelectionTimerRef.current) clearTimeout(wrongSelectionTimerRef.current);
  }, []);

  /* ── Watch for newly-found words to spawn sparkles ── */
  React.useEffect(() => {
    const foundWords = words.filter(w => w.found);
    const prevCount  = prevFoundCountRef.current;
    if (foundWords.length <= prevCount) {
      prevFoundCountRef.current = foundWords.length;
      return;
    }
    prevFoundCountRef.current = foundWords.length;

    const latest = foundWords[foundWords.length - 1];
    if (!latest || !boardRef.current) return;

    // Flash justFoundCells
    setJustFoundCells(latest.cells);
    if (justFoundTimeoutRef.current) clearTimeout(justFoundTimeoutRef.current);
    justFoundTimeoutRef.current = setTimeout(() => setJustFoundCells(null), 480);

    // Sparkle burst at word midpoint
    const rect   = boardRef.current.getBoundingClientRect();
    const midRow = (latest.start.row + latest.end.row) / 2 + 0.5;
    const midCol = (latest.start.col + latest.end.col) / 2 + 0.5;
    const pxX    = (midCol / grid.length) * rect.width;
    const pxY    = (midRow / grid.length) * rect.height;
    const color  = latest.color || '#6366F1';
    const COUNT  = 9;

    const newSparkles: Sparkle[] = Array.from({ length: COUNT }, (_, i) => {
      const angle = (i / COUNT) * Math.PI * 2;
      const dist  = 20 + (i % 3) * 14;
      return {
        id:   `sp-${sparkleIdRef.current++}`,
        x: pxX, y: pxY, color,
        tx:   Math.cos(angle) * dist,
        ty:   Math.sin(angle) * dist,
        rot:  (Math.random() - 0.5) * 160,
        size: 4 + Math.random() * 4.5,
      };
    });
    setSparkles(prev => [...prev, ...newSparkles]);
    setTimeout(() => {
      setSparkles(prev => prev.filter(s => !newSparkles.some(ns => ns.id === s.id)));
    }, 580);

    // Score float
    const floatId = `sf-${sparkleIdRef.current++}`;
    setScoreFloats(prev => [...prev, { id: floatId, word: latest.word, x: pxX, y: pxY, color }]);
    setTimeout(() => setScoreFloats(prev => prev.filter(f => f.id !== floatId)), 1150);
  }, [words, grid.length]);

  /* ── Memos ── */
  const justFoundSet = React.useMemo(() => {
    if (!justFoundCells?.length) return null;
    const s = new Set<string>();
    justFoundCells.forEach(c => s.add(`${c.row}-${c.col}`));
    return s;
  }, [justFoundCells]);

  const foundCellsMap = React.useMemo(() => {
    const map = new Map<string, string[]>();
    words.forEach(w => {
      if (!w.found) return;
      w.cells.forEach(c => {
        const k = `${c.row}-${c.col}`;
        const arr = map.get(k) ?? [];
        arr.push(w.color);
        map.set(k, arr);
      });
    });
    return map;
  }, [words]);

  const selectedSet = React.useMemo(() => {
    const s = new Set<string>();
    currentSelection.forEach(c => s.add(`${c.row}-${c.col}`));
    return s;
  }, [currentSelection]);

  const gridSize = grid.length;

  const selectionCapsule = React.useMemo(() => {
    if (!currentSelection.length) return null;
    const step = 1000 / gridSize;
    const first = currentSelection[0];
    const last  = currentSelection[currentSelection.length - 1];
    return {
      x1: (first.col + 0.5) * step,
      y1: (first.row + 0.5) * step,
      x2: (last.col  + 0.5) * step,
      y2: (last.row  + 0.5) * step,
      sw: step * 0.78,
    };
  }, [currentSelection, gridSize]);

  const foundCapsules = React.useMemo(() => {
    const step = 1000 / gridSize;
    const sw   = step * 0.72;
    return words.filter(w => w.found).map(w => ({
      id:    w.id || w.word,
      x1:   (w.start.col + 0.5) * step,
      y1:   (w.start.row + 0.5) * step,
      x2:   (w.end.col   + 0.5) * step,
      y2:   (w.end.row   + 0.5) * step,
      sw,
      color: w.color || '#6366F1',
    }));
  }, [words, gridSize]);

  /* ── Pointer hit-testing (cached rect, no layout thrashing) ── */
  const getCell = useCallback((cx: number, cy: number): Coordinate | null => {
    const rect = cachedRectRef.current;
    if (!rect) return null;
    if (cx < rect.left - 20 || cx > rect.right  + 20 ||
        cy < rect.top  - 20 || cy > rect.bottom + 20) return null;
    const col = Math.floor((Math.min(Math.max(cx, rect.left), rect.right  - 1) - rect.left) / (rect.width  / gridSize));
    const row = Math.floor((Math.min(Math.max(cy, rect.top),  rect.bottom - 1) - rect.top)  / (rect.height / gridSize));
    return row >= 0 && row < gridSize && col >= 0 && col < gridSize ? { row, col } : null;
  }, [gridSize]);

  /* ── 8-direction line builder ── */
  const buildLine = useCallback((start: Coordinate, end: Coordinate): Coordinate[] => {
    const dr = end.row - start.row;
    const dc = end.col - start.col;
    if (!dr && !dc) return [start];
    const ar = Math.abs(dr), ac = Math.abs(dc);
    const sr = ar <= 0.4142 * ac ? 0 : Math.sign(dr);
    const sc = ar >= 2.4142 * ac ? 0 : Math.sign(dc);
    const len = sr === 0 ? ac + 1 : sc === 0 ? ar + 1 : Math.min(ar, ac) + 1;
    const line: Coordinate[] = [];
    for (let i = 0; i < len; i++) {
      const r = start.row + sr * i;
      const c = start.col + sc * i;
      if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) line.push({ row: r, col: c });
      else break;
    }
    return line.length ? line : [start];
  }, [gridSize]);

  /* ── Pointer handlers ── */
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (isCompleting) return;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
    cachedRectRef.current = containerRef.current?.getBoundingClientRect() ?? null;
    const cell = getCell(e.clientX, e.clientY);
    if (!cell) return;
    lastPointerCellRef.current = cell;
    startCoordRef.current      = cell;
    isSelectingRef.current     = true;
    setCurrentSelection([cell]);
    soundManager.playLetterSnap(0);
  }, [isCompleting, getCell]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isSelectingRef.current || !startCoordRef.current) return;
    const cell = getCell(e.clientX, e.clientY);
    if (!cell) return;
    const last = lastPointerCellRef.current;
    if (last && last.row === cell.row && last.col === cell.col) return;
    lastPointerCellRef.current = cell;
    const line = buildLine(startCoordRef.current, cell);
    setCurrentSelection(prev => {
      if (prev.length === line.length &&
          prev[prev.length-1]?.row === line[line.length-1]?.row &&
          prev[prev.length-1]?.col === line[line.length-1]?.col) return prev;
      if (line.length !== prev.length) soundManager.playLetterSnap(line.length - 1);
      return line;
    });
  }, [getCell, buildLine]);

  const finishSelection = useCallback(() => {
    cachedRectRef.current      = null;
    lastPointerCellRef.current = null;
    if (!isSelectingRef.current) return;
    isSelectingRef.current  = false;
    startCoordRef.current   = null;

    setCurrentSelection(sel => {
      if (!sel.length) return [];
      const letters  = sel.map(c => grid[c.row]?.[c.col] ?? '').join('');
      const reversed = letters.split('').reverse().join('');
      const start    = sel[0];
      const end      = sel[sel.length - 1];

      const matched = words.find(w => {
        if (w.found) return false;
        const target = w.word.toUpperCase();
        if (letters !== target && reversed !== target) return false;
        return (
          (w.start.row === start.row && w.start.col === start.col && w.end.row === end.row && w.end.col === end.col) ||
          (w.start.row === end.row   && w.start.col === end.col   && w.end.row === start.row && w.end.col === start.col) ||
          (w.cells.length === sel.length && w.cells.every((c, i) => c.row === sel[i].row && c.col === sel[i].col)) ||
          (w.cells.length === sel.length && w.cells.every((c, i) => c.row === sel[sel.length-1-i].row && c.col === sel[sel.length-1-i].col))
        );
      });

      if (matched) {
        soundManager.playWordSuccess();
        onWordFound(matched);
      } else if (sel.length >= 2) {
        soundManager.playWordFail();
        setIsWrongSelection(true);
        if (wrongSelectionTimerRef.current) clearTimeout(wrongSelectionTimerRef.current);
        wrongSelectionTimerRef.current = setTimeout(() => setIsWrongSelection(false), 240);
      }
      return [];
    });
  }, [grid, words, onWordFound]);

  const onPointerUp     = useCallback((e: React.PointerEvent) => {
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
    finishSelection();
  }, [finishSelection]);

  const onPointerCancel = useCallback(() => {
    isSelectingRef.current     = false;
    startCoordRef.current      = null;
    lastPointerCellRef.current = null;
    setCurrentSelection([]);
  }, []);

  /* ── Precomputed drop delays (stable ref, never re-computed mid-game) ── */
  const dropDelaysRef = useRef<string[][]>([]);
  const victoryDelaysRef = useRef<string[][]>([]);
  if (!dropDelaysRef.current.length && grid.length) {
    dropDelaysRef.current    = grid.map((_, r) => grid[0].map((__, c) => `${(r + c) * 0.022}s`));
    victoryDelaysRef.current = grid.map((_, r) => grid[0].map((__, c) => `${(r + c) * 0.042}s`));
  }

  /* ── Render ── */
  return (
    <div className="relative w-full max-w-[400px] aspect-square mx-auto p-1 sm:p-2 select-none touch-none">
      <motion.div
        ref={boardRef}
        animate={
          isCompleting
            ? { scale: [1, 0.97, 1.02, 1], transition: { duration: 0.48, ease: 'easeInOut' } }
            : isWrongSelection
            ? { x: [-5, 5, -4, 4, -1, 1, 0], transition: { duration: 0.28, ease: 'easeOut' } }
            : { x: 0, scale: 1 }
        }
        className="w-full h-full rounded-3xl p-3 sm:p-4 relative bg-white border-0 shadow-lg"
        style={{ transform: 'translateZ(0)', willChange: 'transform' }}
      >
        {/* Grid + SVG overlay layer */}
        <div
          ref={containerRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          onTouchMove={e => e.preventDefault()}
          className="w-full h-full grid relative select-none touch-none"
          style={{
            touchAction: 'none',
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            gridTemplateRows:    `repeat(${gridSize}, minmax(0, 1fr))`,
            cursor: isCompleting ? 'default' : 'pointer',
          }}
        >
          {/* SVG highlighter trails */}
          <svg
            viewBox="0 0 1000 1000"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
            style={{ transform: 'translateZ(0)' }}
          >
            <defs>
              <linearGradient id="selGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#6366F1" stopOpacity="0.5" />
                <stop offset="50%"  stopColor="#818CF8" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#6366F1" stopOpacity="0.5" />
              </linearGradient>
            </defs>

            {/* Found word capsules */}
            {foundCapsules.map(cap => (
              <g key={`fc-${cap.id}`}>
                <line x1={cap.x1} y1={cap.y1} x2={cap.x2} y2={cap.y2}
                  stroke={cap.color} strokeWidth={cap.sw * 1.4} strokeLinecap="round" opacity="0.07" />
                <line x1={cap.x1} y1={cap.y1} x2={cap.x2} y2={cap.y2}
                  stroke={cap.color} strokeWidth={cap.sw} strokeLinecap="round" opacity="0.26" />
              </g>
            ))}

            {/* Active selection capsule (3-layer) */}
            {selectionCapsule && (
              <g>
                <line x1={selectionCapsule.x1} y1={selectionCapsule.y1}
                      x2={selectionCapsule.x2} y2={selectionCapsule.y2}
                  stroke="#6366F1" strokeWidth={selectionCapsule.sw * 1.6}
                  strokeLinecap="round" opacity="0.1" className="anim-trail-glow" />
                <line x1={selectionCapsule.x1} y1={selectionCapsule.y1}
                      x2={selectionCapsule.x2} y2={selectionCapsule.y2}
                  stroke="url(#selGrad)" strokeWidth={selectionCapsule.sw}
                  strokeLinecap="round" opacity="0.44" className="anim-trail-glow" />
                <line x1={selectionCapsule.x1} y1={selectionCapsule.y1}
                      x2={selectionCapsule.x2} y2={selectionCapsule.y2}
                  stroke="white" strokeWidth={selectionCapsule.sw * 0.28}
                  strokeLinecap="round" opacity="0.5" />
              </g>
            )}
          </svg>

          {/* Letter cells */}
          {grid.map((row, r) =>
            row.map((letter, c) => {
              const key     = `${r}-${c}`;
              const selKey  = selectedSet.has(key);
              const fColors = foundCellsMap.get(key);
              const found   = !!(fColors?.length);
              const hinted  = !!(hintStartCell && hintStartCell.row === r && hintStartCell.col === c);
              const jFound  = !!(justFoundSet?.has(key));
              return (
                <LetterCell
                  key={`cell-${key}`}
                  cellKey={key}
                  rowIndex={r}
                  colIndex={c}
                  letter={letter}
                  gridSize={gridSize}
                  isSelected={selKey}
                  isFound={found}
                  primaryFoundColor={found ? fColors![fColors!.length - 1] : undefined}
                  isHinted={hinted}
                  isJustFound={jFound}
                  isCompleting={isCompleting}
                  dropDelay={dropDelaysRef.current[r]?.[c] ?? '0s'}
                  victoryDelay={victoryDelaysRef.current[r]?.[c] ?? '0s'}
                />
              );
            })
          )}
        </div>

        {/* Sparkle particles */}
        {sparkles.map(sp => (
          <div
            key={sp.id}
            aria-hidden
            className="absolute pointer-events-none anim-sparkle"
            style={{
              left: sp.x, top: sp.y,
              width: sp.size, height: sp.size,
              marginLeft: -sp.size / 2, marginTop: -sp.size / 2,
              zIndex: 50,
              ['--spx' as string]: `${sp.tx}px`,
              ['--spy' as string]: `${sp.ty}px`,
              ['--spr' as string]: `${sp.rot}deg`,
            } as React.CSSProperties}
          >
            <svg viewBox="0 0 10 10" width={sp.size} height={sp.size}>
              <polygon
                points="5,0 6.2,3.8 10,3.8 7,6.2 8.1,10 5,7.6 1.9,10 3,6.2 0,3.8 3.8,3.8"
                fill={sp.color}
              />
            </svg>
          </div>
        ))}

        {/* Score float-up text */}
        {scoreFloats.map(sf => (
          <div
            key={sf.id}
            aria-hidden
            className="absolute pointer-events-none anim-score-float"
            style={{
              left: sf.x, top: sf.y - 8,
              color: sf.color,
              fontWeight: 900,
              fontSize: 12,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              textShadow: `0 0 8px ${sf.color}80`,
              zIndex: 50,
            }}
          >
            {sf.word}
          </div>
        ))}
      </motion.div>
    </div>
  );
};
