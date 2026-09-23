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
        className={`relative flex items-center justify-center rounded-xl font-black select-none ${
          isCompleting
            ? 'anim-victory-wave z-20 transform-gpu'
            : isJustFound
            ? 'anim-word-pop z-30 transform-gpu'
            : isSelected
            ? 'anim-cell-select z-20 transform-gpu'
            : 'scale-100 z-10 anim-tile-drop'
        } ${
          isSelected
            ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/50 ring-2 ring-blue-300'
            : isHinted
            ? 'bg-amber-100 text-amber-900 border-2 border-amber-500 ring-2 ring-amber-400/60 shadow-md shadow-amber-500/30 animate-pulse'
            : isFound
            ? 'shadow-xs font-black'
            : 'bg-slate-50/90 text-slate-800 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]'
        }`}
        style={{
          touchAction: 'none',
          contain: 'layout paint',
          animationDelay: isCompleting ? victoryDelay : isJustFound ? '0s' : dropDelay,
          ...(!isSelected && isFound && primaryFoundColor
            ? {
                backgroundColor: `${primaryFoundColor}20`,
                borderColor: primaryFoundColor,
                borderWidth: '2.5px',
                borderStyle: 'solid',
                color: primaryFoundColor
              }
            : {})
        }}
      >
        {/* Glowing Hint Indicator */}
        {isHinted && (
          <div className="absolute inset-0 rounded-xl bg-amber-400/40 animate-ping pointer-events-none" />
        )}

        {/* Navy / Colored Letter Typography */}
        <span
          className={`leading-none select-none tracking-wide pointer-events-none ${
            isSelected
              ? 'text-white font-black'
              : isFound
              ? 'font-black'
              : 'font-extrabold'
          } ${
            gridSize <= 5
              ? 'text-2xl sm:text-3xl'
              : gridSize <= 7
              ? 'text-xl sm:text-2xl'
              : gridSize <= 8
              ? 'text-lg sm:text-xl'
              : 'text-base sm:text-lg'
          }`}
        >
          {letter}
        </span>
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
  const lastPointerCellRef = useRef<Coordinate | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [startCoord, setStartCoord] = useState<Coordinate | null>(null);
  const [currentSelection, setCurrentSelection] = useState<Coordinate[]>([]);
  const [isWrongSelection, setIsWrongSelection] = useState(false);
  const [justFoundCells, setJustFoundCells] = useState<Coordinate[] | null>(null);
  const prevFoundCountRef = useRef(words.filter(w => w.found).length);
  const justFoundTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrongSelectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up all pending animation timers on unmount
  React.useEffect(() => {
    return () => {
      if (justFoundTimeoutRef.current) clearTimeout(justFoundTimeoutRef.current);
      if (wrongSelectionTimeoutRef.current) clearTimeout(wrongSelectionTimeoutRef.current);
    };
  }, []);

  // Trigger subtle pop when a word is marked found
  React.useEffect(() => {
    const currentFoundWords = words.filter(w => w.found);
    if (currentFoundWords.length > prevFoundCountRef.current) {
      const latestFound = currentFoundWords[currentFoundWords.length - 1];
      if (latestFound) {
        setJustFoundCells(latestFound.cells);
        if (justFoundTimeoutRef.current) clearTimeout(justFoundTimeoutRef.current);
        justFoundTimeoutRef.current = setTimeout(() => setJustFoundCells(null), 500);
      }
      prevFoundCountRef.current = currentFoundWords.length;
    }
    prevFoundCountRef.current = currentFoundWords.length;
  }, [words]);

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

    // High refresh rate (90-120Hz) optimization: skip if still inside the same cell
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
    const strokeW = step * 0.76;
    return { x1, y1, x2, y2, strokeW };
  }, [isSelecting, currentSelection, gridSize]);

  // Found words persistent highlighter capsules
  const foundCapsules = React.useMemo(() => {
    const step = 1000 / gridSize;
    const strokeW = step * 0.70;
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
        animate={
          isCompleting 
            ? { scale: [1, 0.98, 1.02, 1], transition: { duration: 0.5, ease: 'easeInOut' } }
            : isWrongSelection 
            ? { x: [-3, 3, -2, 2, 0], transition: { duration: 0.25 } }
            : { x: 0, y: 0 }
        }
        className={`w-full h-full rounded-3xl p-3 sm:p-4 relative flex flex-col justify-between transition-colors duration-300 ${
          highContrast 
            ? 'bg-white border-4 border-slate-900 shadow-xl' 
            : 'bg-white border border-slate-200/90 shadow-lg'
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
          {/* Real-time SVG Pill Highlighter Trails (Isolated GPU Composition) */}
          <svg
            viewBox="0 0 1000 1000"
            className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
            preserveAspectRatio="none"
            style={{ transform: 'translateZ(0)' }}
          >
            {/* Found Words Connecting Capsules */}
            {foundCapsules.map((cap) => (
              <line
                key={`found-cap-${cap.id}`}
                x1={cap.x1}
                y1={cap.y1}
                x2={cap.x2}
                y2={cap.y2}
                stroke={cap.color}
                strokeWidth={cap.strokeW}
                strokeLinecap="round"
                opacity="0.22"
              />
            ))}

            {/* Active Finger Drag Capsule */}
            {selectionCapsule && (
              <line
                x1={selectionCapsule.x1}
                y1={selectionCapsule.y1}
                x2={selectionCapsule.x2}
                y2={selectionCapsule.y2}
                stroke="#2563EB"
                strokeWidth={selectionCapsule.strokeW}
                strokeLinecap="round"
                opacity="0.28"
              />
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
      </motion.div>
    </div>
  );
};
