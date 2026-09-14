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

export const LetterGrid: React.FC<Props> = ({
  grid,
  words,
  onWordFound,
  hintStartCell,
  highContrast = false,
  isCompleting = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cachedRectRef = useRef<DOMRect | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [startCoord, setStartCoord] = useState<Coordinate | null>(null);
  const [currentSelection, setCurrentSelection] = useState<Coordinate[]>([]);
  const [isWrongSelection, setIsWrongSelection] = useState(false);
  const [isWordFoundShake, setIsWordFoundShake] = useState(false);
  const [justFoundCells, setJustFoundCells] = useState<Coordinate[] | null>(null);
  const prevFoundCountRef = useRef(words.filter(w => w.found).length);

  // Trigger subtle shake when a word is marked found
  React.useEffect(() => {
    const currentFoundWords = words.filter(w => w.found);
    if (currentFoundWords.length > prevFoundCountRef.current) {
      const latestFound = currentFoundWords[currentFoundWords.length - 1];
      if (latestFound) {
        setJustFoundCells(latestFound.cells);
        setTimeout(() => setJustFoundCells(null), 400);
      }
      setIsWordFoundShake(true);
      const timer = setTimeout(() => setIsWordFoundShake(false), 350);
      prevFoundCountRef.current = currentFoundWords.length;
      return () => clearTimeout(timer);
    }
    prevFoundCountRef.current = currentFoundWords.length;
  }, [words]);

  const gridSize = grid.length;

  // Helper to determine cell at client coordinate (Zero layout thrashing - uses cached rect)
  const getCellFromPointer = useCallback(
    (clientX: number, clientY: number): Coordinate | null => {
      const rect = cachedRectRef.current || (containerRef.current ? containerRef.current.getBoundingClientRect() : null);
      if (!rect) return null;
      if (
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
      ) {
        return null;
      }

      const colWidth = rect.width / gridSize;
      const rowHeight = rect.height / gridSize;

      const col = Math.floor((clientX - rect.left) / colWidth);
      const row = Math.floor((clientY - rect.top) / rowHeight);

      if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
        return { row, col };
      }
      return null;
    },
    [gridSize]
  );

  // Compute straight line in 8 discrete directions from start to target
  // Directions: (-1,-1), (-1,0), (-1,1), (0,-1), (0,1), (1,-1), (1,0), (1,1)
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

      // Classify into exact 8 directions using angular threshold (tan 22.5° ≈ 0.4142)
      if (absRow <= 0.4142 * absCol) {
        // Horizontal: (0, 1) or (0, -1)
        stepRow = 0;
        stepCol = Math.sign(dCol);
        length = absCol + 1;
      } else if (absRow >= 2.4142 * absCol) {
        // Vertical: (1, 0) or (-1, 0)
        stepRow = Math.sign(dRow);
        stepCol = 0;
        length = absRow + 1;
      } else {
        // Diagonal: (1,1), (-1,-1), (1,-1), or (-1,1)
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
    e.currentTarget.setPointerCapture(e.pointerId);
    if (containerRef.current) {
      cachedRectRef.current = containerRef.current.getBoundingClientRect();
    }
    const cell = getCellFromPointer(e.clientX, e.clientY);
    if (!cell) return;

    setIsSelecting(true);
    setStartCoord(cell);
    setCurrentSelection([cell]);
    soundManager.playLetterSnap(0);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isCompleting || !isSelecting || !startCoord) return;
    const cell = getCellFromPointer(e.clientX, e.clientY);
    if (!cell) return;

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
        // Forward coordinate match
        const matchForward = (
          w.start.row === startCell.row && w.start.col === startCell.col &&
          w.end.row === endCell.row && w.end.col === endCell.col
        );
        // Reverse coordinate match
        const matchBackward = (
          w.start.row === endCell.row && w.start.col === endCell.col &&
          w.end.row === startCell.row && w.end.col === startCell.col
        );
        // Discrete cells sequence match (forward or reverse)
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
      setIsWordFoundShake(true);
      setJustFoundCells(matched.cells);
      setTimeout(() => setJustFoundCells(null), 400);
      setTimeout(() => setIsWordFoundShake(false), 350);
      onWordFound(matched);
    } else {
      if (currentSelection.length >= 2) {
        soundManager.playWordFail();
        setIsWrongSelection(true);
        setTimeout(() => setIsWrongSelection(false), 250);
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

  return (
    <div className="relative w-full max-w-[400px] aspect-square mx-auto p-1 sm:p-2 select-none touch-none">
      {/* Large White Rounded Puzzle Board with subtle bounce on victory */}
      <motion.div 
        animate={
          isCompleting 
            ? { scale: [1, 0.97, 1.03, 1], transition: { duration: 0.6, ease: 'easeInOut' } }
            : isWordFoundShake
            ? { 
                x: [0, -3.5, 3.5, -2.5, 2.5, -1, 1, 0],
                y: [0, 1.5, -1.5, 1, -1, 0],
                transition: { duration: 0.35, ease: 'easeInOut' }
              }
            : isWrongSelection 
            ? { x: [-3, 3, -2, 2, 0], transition: { duration: 0.25 } }
            : { x: 0, y: 0 }
        }
        className={`w-full h-full rounded-3xl p-3 sm:p-4 shadow-xl relative flex flex-col justify-between transition-all duration-300 ${
          highContrast 
            ? 'bg-white border-4 border-slate-900 shadow-xl' 
            : 'bg-white border border-slate-200/80 shadow-[0_10px_35px_rgba(0,0,0,0.08)]'
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
          className={`w-full h-full grid gap-1 relative ${isCompleting ? 'cursor-default pointer-events-none' : 'cursor-pointer'}`}
          style={{
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`
          }}
        >
          {/* Layer 1: Tile Surface Backgrounds */}
          <div
            className="absolute inset-0 grid gap-1 pointer-events-none"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`
            }}
          >
            {grid.map((rowArr, r) =>
              rowArr.map((_, c) => {
                const cellKey = `${r}-${c}`;
                const isHinted = hintStartCell && hintStartCell.row === r && hintStartCell.col === c;
                return (
                  <div
                    key={`tile-bg-${cellKey}`}
                    className={`relative rounded-xl transition-all duration-150 ${
                      isHinted
                        ? 'bg-amber-100/90 border-2 border-amber-500 shadow-md shadow-amber-500/20'
                        : 'bg-slate-50/80 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]'
                    }`}
                  />
                );
              })
            )}
          </div>

          {/* Layer 2: SVG Vector Highlighter Capsules (Zero Clutter, Silky Smooth) */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
            viewBox={`0 0 ${gridSize * 100} ${gridSize * 100}`}
          >
            {/* Render completed word highlight lines */}
            {words.filter(w => w.found).map((w, idx) => {
              if (w.cells.length < 2) return null;
              const x1 = w.start.col * 100 + 50;
              const y1 = w.start.row * 100 + 50;
              const x2 = w.end.col * 100 + 50;
              const y2 = w.end.row * 100 + 50;

              return (
                <line
                  key={`found-line-${w.id || idx}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={w.color || '#2563EB'}
                  strokeWidth="74"
                  strokeLinecap="round"
                  strokeOpacity={isCompleting ? 0.7 : 0.42}
                  className="transition-all duration-300"
                />
              );
            })}

            {/* Active single cell touch dot */}
            {isSelecting && currentSelection.length === 1 && (
              <circle
                cx={currentSelection[0].col * 100 + 50}
                cy={currentSelection[0].row * 100 + 50}
                r="37"
                fill="#2563EB"
                fillOpacity="0.45"
              />
            )}

            {/* Active multi-cell drag line */}
            {isSelecting && currentSelection.length >= 2 && (
              <line
                x1={currentSelection[0].col * 100 + 50}
                y1={currentSelection[0].row * 100 + 50}
                x2={currentSelection[currentSelection.length - 1].col * 100 + 50}
                y2={currentSelection[currentSelection.length - 1].row * 100 + 50}
                stroke="#2563EB"
                strokeWidth="74"
                strokeLinecap="round"
                strokeOpacity="0.48"
              />
            )}
          </svg>

          {/* Layer 3: Letters Typography and Hint Overlays */}
          <div
            className="absolute inset-0 grid gap-1 pointer-events-none z-20"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`
            }}
          >
            {grid.map((rowArr, r) =>
              rowArr.map((letter, c) => {
                const cellKey = `${r}-${c}`;
                const selected = selectedSet.has(cellKey);
                const foundColors = foundCellsMap.get(cellKey);
                const isFound = foundColors && foundColors.length > 0;
                const isHinted = hintStartCell && hintStartCell.row === r && hintStartCell.col === c;
                const isJustFound = justFoundCells?.some(coord => coord.row === r && coord.col === c);

                return (
                  <div
                    key={`cell-${cellKey}`}
                    id={`letter-cell-${cellKey}`}
                    className={`relative flex items-center justify-center font-black select-none transition-transform duration-100 ease-out will-change-transform ${
                      isJustFound
                        ? 'scale-125 -rotate-2 z-30'
                        : selected
                        ? 'scale-115 z-20'
                        : 'scale-100 z-10'
                    }`}
                  >
                    {/* Glowing Hint Indicator */}
                    {isHinted && (
                      <div className="absolute inset-0 rounded-xl bg-amber-400/40 animate-ping pointer-events-none" />
                    )}

                    {/* Navy Letter Typography */}
                    <span
                      className={`relative z-20 leading-none select-none tracking-wide transition-colors ${
                        selected
                          ? 'text-blue-950 font-black'
                          : isFound
                          ? 'text-slate-900 font-black'
                          : 'text-slate-800 font-bold'
                      } ${
                        gridSize <= 5
                          ? 'text-2xl sm:text-3xl font-black'
                          : gridSize <= 7
                          ? 'text-xl sm:text-2xl font-black'
                          : gridSize <= 8
                          ? 'text-lg sm:text-xl font-bold'
                          : 'text-base sm:text-lg font-bold'
                      } ${isHinted ? 'text-amber-800 font-black scale-110' : ''}`}
                    >
                      {letter}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
