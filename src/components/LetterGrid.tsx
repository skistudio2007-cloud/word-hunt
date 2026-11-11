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
}

const LetterCell = React.memo<LetterCellProps>(
  ({
    cellKey,
    rowIndex,
    colIndex,
    letter,
    gridSize,
    isSelected,
    isFound,
    primaryFoundColor,
    isHinted,
    isJustFound,
    isCompleting,
  }) => {
    // Ultra-smooth diagonal wave drop delay (max ~0.33s for 8x8)
    const dropDelay = `${(rowIndex + colIndex) * 0.024}s`;
    const victoryDelay = `${(rowIndex + colIndex) * 0.045}s`;

    return (
      <div
        id={`letter-cell-${cellKey}`}
        className={`relative flex items-center justify-center font-black select-none border-0 bg-transparent shadow-none ${
          isCompleting
            ? 'anim-victory-wave z-20 transform-gpu'
            : isJustFound
            ? 'anim-word-pop z-30 transform-gpu'
            : isSelected
            ? 'anim-cell-select z-20 transform-gpu'
            : 'scale-100 z-10 anim-tile-drop'
        }`}
        style={{
          touchAction: 'none',
          contain: 'layout paint',
          animationDelay: isCompleting ? victoryDelay : isJustFound ? '0s' : dropDelay
        }}
      >
        {/* Letter Typography */}
        <span
          className={`leading-none select-none tracking-wide pointer-events-none transition-all duration-100 ${
            isSelected
              ? 'text-blue-600 font-black scale-125 drop-shadow-[0_0_8px_rgba(37,99,235,0.7)]'
              : isHinted
              ? 'text-amber-500 font-black animate-pulse drop-shadow-[0_0_10px_rgba(245,158,11,0.9)]'
              : isJustFound
              ? 'font-black anim-letter-shimmer'
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
          style={{
            ...(!isSelected && isFound && primaryFoundColor
              ? { color: primaryFoundColor }
              : {})
          }}
        >
          {letter}
        </span>

        {/* Blue selection ring glow behind selected letter */}
        {isSelected && (
          <span
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)',
            }}
          />
        )}
      </div>
    );
  },
  (prev, next) => {
    return (
      prev.letter === next.letter &&
      prev.isSelected === next.isSelected &&
      prev.isFound === next.isFound &&
      prev.primaryFoundColor === next.primaryFoundColor &&
      prev.isHinted === next.isHinted &&
      prev.isJustFound === next.isJustFound &&
      prev.isCompleting === next.isCompleting &&
      prev.gridSize === next.gridSize
    );
  }
);
LetterCell.displayName = 'LetterCell';

// Sparkle particle configuration
interface SparkleParticle {
  id: string;
  x: number;
  y: number;
  color: string;
  tx: number;
  ty: number;
  rot: number;
  size: number;
}

// Score float text state
interface ScoreFloat {
  id: string;
  word: string;
  x: number;
  y: number;
  color: string;
}

export const LetterGrid: React.FC<Props> = ({
  grid,
  words,
  onWordFound,
  hintStartCell,
  highContrast = false,
  isCompleting = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const cachedRectRef = useRef<DOMRect | null>(null);
  const lastPointerCellRef = useRef<Coordinate | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [startCoord, setStartCoord] = useState<Coordinate | null>(null);
  const [currentSelection, setCurrentSelection] = useState<Coordinate[]>([]);
  const [isWrongSelection, setIsWrongSelection] = useState(false);
  const [justFoundCells, setJustFoundCells] = useState<Coordinate[] | null>(null);
  const [sparkles, setSparkles] = useState<SparkleParticle[]>([]);
  const [scoreFloats, setScoreFloats] = useState<ScoreFloat[]>([]);
  const prevFoundCountRef = useRef(words.filter(w => w.found).length);
  const justFoundTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrongSelectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sparkleIdRef = useRef(0);

  // Clean up all pending animation timers on unmount
  React.useEffect(() => {
    return () => {
      if (justFoundTimeoutRef.current) clearTimeout(justFoundTimeoutRef.current);
      if (wrongSelectionTimeoutRef.current) clearTimeout(wrongSelectionTimeoutRef.current);
    };
  }, []);

  // Trigger sparkle burst when a word is marked found
  React.useEffect(() => {
    const currentFoundWords = words.filter(w => w.found);
    if (currentFoundWords.length > prevFoundCountRef.current) {
      const latestFound = currentFoundWords[currentFoundWords.length - 1];
      if (latestFound) {
        setJustFoundCells(latestFound.cells);
        if (justFoundTimeoutRef.current) clearTimeout(justFoundTimeoutRef.current);
        justFoundTimeoutRef.current = setTimeout(() => setJustFoundCells(null), 500);

        // Spawn sparkle particles at the midpoint of found word's start/end
        if (boardRef.current) {
          const rect = boardRef.current.getBoundingClientRect();
          const step = 100 / (grid.length || 1);
          const midRow = (latestFound.start.row + latestFound.end.row) / 2 + 0.5;
          const midCol = (latestFound.start.col + latestFound.end.col) / 2 + 0.5;
          const pxX = (midCol / grid.length) * rect.width;
          const pxY = (midRow / grid.length) * rect.height;

          const wordColor = latestFound.color || '#2563EB';
          const SPARKLE_COUNT = 10;
          const newSparkles: SparkleParticle[] = [];
          for (let i = 0; i < SPARKLE_COUNT; i++) {
            const angle = (i / SPARKLE_COUNT) * Math.PI * 2;
            const dist = 22 + Math.random() * 28;
            const tx = Math.cos(angle) * dist;
            const ty = Math.sin(angle) * dist;
            newSparkles.push({
              id: `sp-${sparkleIdRef.current++}`,
              x: pxX,
              y: pxY,
              color: wordColor,
              tx,
              ty,
              rot: (Math.random() - 0.5) * 180,
              size: 4 + Math.random() * 5
            });
          }
          setSparkles(prev => [...prev, ...newSparkles]);
          // Remove sparkles after animation completes
          setTimeout(() => {
            setSparkles(prev => prev.filter(s => !newSparkles.some(ns => ns.id === s.id)));
          }, 650);

          // Score float text
          const wordText = latestFound.word;
          const floatId = `sf-${sparkleIdRef.current++}`;
          setScoreFloats(prev => [...prev, {
            id: floatId,
            word: wordText,
            x: pxX,
            y: pxY,
            color: wordColor
          }]);
          setTimeout(() => {
            setScoreFloats(prev => prev.filter(sf => sf.id !== floatId));
          }, 1200);
        }
      }
      prevFoundCountRef.current = currentFoundWords.length;
    }
    prevFoundCountRef.current = currentFoundWords.length;
  }, [words, grid.length]);

  // O(1) hash lookup set for just found cells
  const justFoundSet = React.useMemo(() => {
    if (!justFoundCells || justFoundCells.length === 0) return null;
    const s = new Set<string>();
    for (let i = 0; i < justFoundCells.length; i++) {
      s.add(`${justFoundCells[i].row}-${justFoundCells[i].col}`);
    }
    return s;
  }, [justFoundCells]);

  const gridSize = grid.length;

  // Helper to determine cell at client coordinate (Zero layout thrashing - uses cached rect & bounds clamping)
  const getCellFromPointer = useCallback(
    (clientX: number, clientY: number): Coordinate | null => {
      const rect = cachedRectRef.current || (containerRef.current ? containerRef.current.getBoundingClientRect() : null);
      if (!rect) return null;

      // Allow 24px padding tolerance around the board edge so fast edge swipes don't break
      if (
        clientX < rect.left - 24 ||
        clientX > rect.right + 24 ||
        clientY < rect.top - 24 ||
        clientY > rect.bottom + 24
      ) {
        return null;
      }

      const clampedX = Math.max(rect.left, Math.min(rect.right - 1, clientX));
      const clampedY = Math.max(rect.top, Math.min(rect.bottom - 1, clientY));

      const colWidth = rect.width / gridSize;
      const rowHeight = rect.height / gridSize;

      const col = Math.floor((clampedX - rect.left) / colWidth);
      const row = Math.floor((clampedY - rect.top) / rowHeight);

      if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
        return { row, col };
      }
      return null;
    },
    [gridSize]
  );

  // Compute straight line in 8 discrete directions from start to target
  const calculateLineSelection = useCallback(
    (start: Coordinate, target: Coordinate): Coordinate[] => {
      const dRow = target.row - start.row;
      const dCol = target.col - start.col;

      if (dRow === 0 && dCol === 0) {
        return [start];
      }

      const absRow = Math.abs(dRow);
      const absCol = Math.abs(dCol);

      let stepRow = 0;
      let stepCol = 0;
      let length = 0;

      if (absRow <= 0.4142 * absCol) {
        stepRow = 0;
        stepCol = Math.sign(dCol);
        length = absCol + 1;
      } else if (absRow >= 2.4142 * absCol) {
        stepRow = Math.sign(dRow);
        stepCol = 0;
        length = absRow + 1;
      } else {
        stepRow = Math.sign(dRow);
        stepCol = Math.sign(dCol);
        length = Math.min(absRow, absCol) + 1;
      }

      const line: Coordinate[] = [];
      for (let i = 0; i < length; i++) {
        const r = start.row + stepRow * i;
        const c = start.col + stepCol * i;
        if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
          line.push({ row: r, col: c });
        } else {
          break;
        }
      }

      return line.length > 0 ? line : [start];
    },
    [gridSize]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isCompleting) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    if (containerRef.current) {
      cachedRectRef.current = containerRef.current.getBoundingClientRect();
    }
    const cell = getCellFromPointer(e.clientX, e.clientY);
    if (!cell) return;

    lastPointerCellRef.current = cell;
    setIsSelecting(true);
    setStartCoord(cell);
    setCurrentSelection([cell]);
    soundManager.playLetterSnap(0);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isCompleting || !isSelecting || !startCoord) return;
    const cell = getCellFromPointer(e.clientX, e.clientY);
    if (!cell) return;

    if (
      lastPointerCellRef.current &&
      lastPointerCellRef.current.row === cell.row &&
      lastPointerCellRef.current.col === cell.col
    ) {
      return;
    }
    lastPointerCellRef.current = cell;

    const newLine = calculateLineSelection(startCoord, cell);

    const lastNew = newLine[newLine.length - 1];
    const lastCurrent = currentSelection[currentSelection.length - 1];
    if (
      newLine.length !== currentSelection.length ||
      lastNew?.row !== lastCurrent?.row ||
      lastNew?.col !== lastCurrent?.col
    ) {
      if (newLine.length !== currentSelection.length) {
        soundManager.playLetterSnap(newLine.length - 1);
      }
      setCurrentSelection(newLine);
    }
  };

  const finishSelection = useCallback(() => {
    cachedRectRef.current = null;
    lastPointerCellRef.current = null;
    if (!isSelecting || currentSelection.length === 0) {
      setIsSelecting(false);
      setStartCoord(null);
      setCurrentSelection([]);
      return;
    }

    const selectedLetters = currentSelection
      .map(c => grid[c.row]?.[c.col] || '')
      .join('');
    const reversedLetters = selectedLetters.split('').reverse().join('');

    const startCell = currentSelection[0];
    const endCell = currentSelection[currentSelection.length - 1];

    const matched = words.find(w => {
      if (w.found) return false;
      const target = w.word.toUpperCase();

      if (selectedLetters === target || reversedLetters === target) {
        const matchForward = (
          w.start.row === startCell.row && w.start.col === startCell.col &&
          w.end.row === endCell.row && w.end.col === endCell.col
        );
        const matchBackward = (
          w.start.row === endCell.row && w.start.col === endCell.col &&
          w.end.row === startCell.row && w.end.col === startCell.col
        );
        const matchCellsForward = w.cells.length === currentSelection.length &&
          w.cells.every((cell, idx) => cell.row === currentSelection[idx].row && cell.col === currentSelection[idx].col);
        const matchCellsReverse = w.cells.length === currentSelection.length &&
          w.cells.every((cell, idx) => cell.row === currentSelection[currentSelection.length - 1 - idx].row && cell.col === currentSelection[currentSelection.length - 1 - idx].col);

        return matchForward || matchBackward || matchCellsForward || matchCellsReverse;
      }
      return false;
    });

    if (matched) {
      soundManager.playWordSuccess();
      setJustFoundCells(matched.cells);
      if (justFoundTimeoutRef.current) clearTimeout(justFoundTimeoutRef.current);
      justFoundTimeoutRef.current = setTimeout(() => setJustFoundCells(null), 500);
      onWordFound(matched);
    } else {
      if (currentSelection.length >= 2) {
        soundManager.playWordFail();
        setIsWrongSelection(true);
        if (wrongSelectionTimeoutRef.current) clearTimeout(wrongSelectionTimeoutRef.current);
        wrongSelectionTimeoutRef.current = setTimeout(() => setIsWrongSelection(false), 250);
      }
    }

    setIsSelecting(false);
    setStartCoord(null);
    setCurrentSelection([]);
  }, [isSelecting, currentSelection, grid, words, onWordFound]);

  const handlePointerUp = (e: React.PointerEvent) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    finishSelection();
  };

  const handlePointerCancel = () => {
    lastPointerCellRef.current = null;
    setIsSelecting(false);
    setStartCoord(null);
    setCurrentSelection([]);
  };

  // Helper map for found cells coloring
  const foundCellsMap = React.useMemo(() => {
    const map = new Map<string, string[]>();
    words.forEach(w => {
      if (w.found) {
        w.cells.forEach(c => {
          const key = `${c.row}-${c.col}`;
          const existing = map.get(key) || [];
          existing.push(w.color);
          map.set(key, existing);
        });
      }
    });
    return map;
  }, [words]);

  // O(1) lookup set for current dragging selection
  const selectedSet = React.useMemo(() => {
    const s = new Set<string>();
    for (let i = 0; i < currentSelection.length; i++) {
      s.add(`${currentSelection[i].row}-${currentSelection[i].col}`);
    }
    return s;
  }, [currentSelection]);

  // Active dragging highlighter capsule coordinates
  const selectionCapsule = React.useMemo(() => {
    if (!isSelecting || currentSelection.length === 0) return null;
    const first = currentSelection[0];
    const last = currentSelection[currentSelection.length - 1];
    const step = 1000 / gridSize;
    const x1 = (first.col + 0.5) * step;
    const y1 = (first.row + 0.5) * step;
    const x2 = (last.col + 0.5) * step;
    const y2 = (last.row + 0.5) * step;
    const strokeW = step * 0.78;
    return { x1, y1, x2, y2, strokeW };
  }, [isSelecting, currentSelection, gridSize]);

  // Found words persistent highlighter capsules
  const foundCapsules = React.useMemo(() => {
    const step = 1000 / gridSize;
    const strokeW = step * 0.72;
    return words
      .filter(w => w.found)
      .map(w => {
        const x1 = (w.start.col + 0.5) * step;
        const y1 = (w.start.row + 0.5) * step;
        const x2 = (w.end.col + 0.5) * step;
        const y2 = (w.end.row + 0.5) * step;
        return {
          id: w.id || w.word,
          x1,
          y1,
          x2,
          y2,
          strokeW,
          color: w.color || '#2563EB'
        };
      });
  }, [words, gridSize]);

  return (
    <div className="relative w-full max-w-[400px] aspect-square mx-auto p-1 sm:p-2 select-none touch-none">
      {/* Large White Rounded Puzzle Board with subtle bounce on victory */}
      <motion.div
        ref={boardRef}
        animate={
          isCompleting
            ? { scale: [1, 0.98, 1.02, 1], transition: { duration: 0.5, ease: 'easeInOut' } }
            : isWrongSelection
            ? { x: [-4, 4, -3, 3, -1, 1, 0], transition: { duration: 0.3, ease: 'easeOut' } }
            : { x: 0, y: 0 }
        }
        className={`w-full h-full rounded-3xl p-3 sm:p-4 relative flex flex-col justify-between transition-colors duration-300 border-0 ${
          highContrast
            ? 'bg-white shadow-xl'
            : 'bg-white shadow-lg'
        }`}
      >
        {/* Interactive Letter Grid Container */}
        <div
          ref={containerRef}
          id="letter-grid-canvas-container"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onTouchMove={(e) => e.preventDefault()}
          className={`w-full h-full grid gap-1.5 relative select-none touch-none ${isCompleting ? 'cursor-default pointer-events-none' : 'cursor-pointer'}`}
          style={{
            touchAction: 'none',
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`
          }}
        >
          {/* Real-time SVG Pill Highlighter Trails */}
          <svg
            viewBox="0 0 1000 1000"
            className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
            preserveAspectRatio="none"
            style={{ transform: 'translateZ(0)' }}
          >
            <defs>
              {/* Animated gradient for active selection */}
              <linearGradient id="selectionGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.5" />
                <stop offset="50%" stopColor="#818CF8" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#2563EB" stopOpacity="0.5" />
              </linearGradient>
              {/* Soft blur filter for found capsules glow */}
              <filter id="capsuleGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Found Words Connecting Capsules — with subtle glow */}
            {foundCapsules.map((cap) => (
              <g key={`found-cap-${cap.id}`}>
                {/* Soft glow layer */}
                <line
                  x1={cap.x1}
                  y1={cap.y1}
                  x2={cap.x2}
                  y2={cap.y2}
                  stroke={cap.color}
                  strokeWidth={cap.strokeW * 1.3}
                  strokeLinecap="round"
                  opacity="0.08"
                />
                {/* Main capsule */}
                <line
                  x1={cap.x1}
                  y1={cap.y1}
                  x2={cap.x2}
                  y2={cap.y2}
                  stroke={cap.color}
                  strokeWidth={cap.strokeW}
                  strokeLinecap="round"
                  opacity="0.24"
                />
              </g>
            ))}

            {/* Active Finger Drag Capsule — gradient + glow */}
            {selectionCapsule && (
              <g>
                {/* Outer glow */}
                <line
                  x1={selectionCapsule.x1}
                  y1={selectionCapsule.y1}
                  x2={selectionCapsule.x2}
                  y2={selectionCapsule.y2}
                  stroke="#2563EB"
                  strokeWidth={selectionCapsule.strokeW * 1.5}
                  strokeLinecap="round"
                  opacity="0.12"
                  className="anim-trail-glow"
                />
                {/* Core gradient capsule */}
                <line
                  x1={selectionCapsule.x1}
                  y1={selectionCapsule.y1}
                  x2={selectionCapsule.x2}
                  y2={selectionCapsule.y2}
                  stroke="url(#selectionGrad)"
                  strokeWidth={selectionCapsule.strokeW}
                  strokeLinecap="round"
                  opacity="0.42"
                  className="anim-trail-glow"
                />
                {/* Bright core line */}
                <line
                  x1={selectionCapsule.x1}
                  y1={selectionCapsule.y1}
                  x2={selectionCapsule.x2}
                  y2={selectionCapsule.y2}
                  stroke="white"
                  strokeWidth={selectionCapsule.strokeW * 0.3}
                  strokeLinecap="round"
                  opacity="0.5"
                />
              </g>
            )}
          </svg>

          {grid.map((rowArr, r) =>
            rowArr.map((letter, c) => {
              const cellKey = `${r}-${c}`;
              const selected = selectedSet.has(cellKey);
              const foundColors = foundCellsMap.get(cellKey);
              const isFound = !!(foundColors && foundColors.length > 0);
              const primaryFoundColor = isFound ? foundColors![foundColors!.length - 1] : undefined;
              const isHinted = !!(hintStartCell && hintStartCell.row === r && hintStartCell.col === c);
              const isJustFound = !!(justFoundSet && justFoundSet.has(cellKey));

              return (
                <LetterCell
                  key={`cell-${cellKey}`}
                  cellKey={cellKey}
                  rowIndex={r}
                  colIndex={c}
                  letter={letter}
                  gridSize={gridSize}
                  isSelected={selected}
                  isFound={isFound}
                  primaryFoundColor={primaryFoundColor}
                  isHinted={isHinted}
                  isJustFound={isJustFound}
                  isCompleting={isCompleting}
                />
              );
            })
          )}
        </div>

        {/* Sparkle Particles overlay — rendered inside board, absolutely positioned */}
        {sparkles.map(sp => (
          <div
            key={sp.id}
            className="absolute pointer-events-none anim-sparkle z-50"
            style={{
              left: sp.x,
              top: sp.y,
              width: sp.size,
              height: sp.size,
              marginLeft: -sp.size / 2,
              marginTop: -sp.size / 2,
              '--spx': `${sp.tx}px`,
              '--spy': `${sp.ty}px`,
              '--spr': `${sp.rot}deg`,
            } as React.CSSProperties}
          >
            {/* Star shape */}
            <svg viewBox="0 0 10 10" width={sp.size} height={sp.size}>
              <polygon
                points="5,0 6,4 10,4 7,6.5 8,10 5,7.5 2,10 3,6.5 0,4 4,4"
                fill={sp.color}
                opacity="0.95"
              />
            </svg>
          </div>
        ))}

        {/* Score float-up text overlay */}
        {scoreFloats.map(sf => (
          <div
            key={sf.id}
            className="absolute pointer-events-none anim-score-float z-50"
            style={{
              left: sf.x,
              top: sf.y - 10,
              color: sf.color,
              fontWeight: 900,
              fontSize: 13,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              textShadow: `0 0 10px ${sf.color}80`,
            }}
          >
            {sf.word}
          </div>
        ))}
      </motion.div>
    </div>
  );
};
