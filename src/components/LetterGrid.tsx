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

  // Helper to determine cell at client coordinate
  const getCellFromPointer = useCallback(
    (clientX: number, clientY: number): Coordinate | null => {
      if (!containerRef.current) return null;
      const rect = containerRef.current.getBoundingClientRect();
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
        length = Math.max(absRow, absCol) + 1;
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

    if (newLine.length !== currentSelection.length) {
      soundManager.playLetterSnap(newLine.length - 1);
      setCurrentSelection(newLine);
    }
  };

  const finishSelection = useCallback(() => {
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

  const isCellSelected = useCallback(
    (row: number, col: number) => {
      return currentSelection.some(c => c.row === row && c.col === col);
    },
    [currentSelection]
  );

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
        className={`w-full h-full rounded-3xl p-3 sm:p-4 shadow-2xl relative flex flex-col justify-between transition-all duration-300 ${
          highContrast 
            ? 'bg-white border-4 border-slate-900 shadow-xl' 
            : 'bg-white/95 backdrop-blur-md border border-white/80 shadow-[0_12px_40px_rgba(0,0,0,0.12)]'
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
          {/* SVG Overlay for Vector Highlights and Active Drag Line */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
            {/* Render completed word highlight lines */}
            {words.filter(w => w.found).map((w, idx) => {
              if (w.cells.length < 2) return null;
              const startCenter = {
                x: ((w.start.col + 0.5) / gridSize) * 100,
                y: ((w.start.row + 0.5) / gridSize) * 100
              };
              const endCenter = {
                x: ((w.end.col + 0.5) / gridSize) * 100,
                y: ((w.end.row + 0.5) / gridSize) * 100
              };

              return (
                <line
                  key={`found-line-${w.id || idx}`}
                  x1={`${startCenter.x}%`}
                  y1={`${startCenter.y}%`}
                  x2={`${endCenter.x}%`}
                  y2={`${endCenter.y}%`}
                  stroke={w.color || '#2563EB'}
                  strokeWidth="28"
                  strokeLinecap="round"
                  strokeOpacity={isCompleting ? "0.6" : "0.4"}
                  className="transition-all duration-300"
                />
              );
            })}

            {/* Render active dragging selection line */}
            {isSelecting && currentSelection.length >= 2 && (
              <line
                x1={`${((currentSelection[0].col + 0.5) / gridSize) * 100}%`}
                y1={`${((currentSelection[0].row + 0.5) / gridSize) * 100}%`}
                x2={`${((currentSelection[currentSelection.length - 1].col + 0.5) / gridSize) * 100}%`}
                y2={`${((currentSelection[currentSelection.length - 1].row + 0.5) / gridSize) * 100}%`}
                stroke="#2563EB"
                strokeWidth="28"
                strokeLinecap="round"
                strokeOpacity="0.45"
              />
            )}
          </svg>

          {/* Grid Cells with Navy Letters */}
          {grid.map((rowArr, r) =>
            rowArr.map((letter, c) => {
              const selected = isCellSelected(r, c);
              const foundColors = foundCellsMap.get(`${r}-${c}`);
              const isFound = foundColors && foundColors.length > 0;
              const isHinted = hintStartCell && hintStartCell.row === r && hintStartCell.col === c;
              const isJustFound = justFoundCells?.some(coord => coord.row === r && coord.col === c);

              return (
                <motion.div
                  key={`cell-${r}-${c}`}
                  id={`letter-cell-${r}-${c}`}
                  initial={{
                    y: -110 - r * 30,
                    opacity: 0,
                    scale: 0.5,
                    rotate: (r + c) % 2 === 0 ? -10 : 10
                  }}
                  animate={
                    isJustFound
                      ? {
                          scale: [1, 1.15, 0.96, 1],
                          rotate: [0, -2, 2, -1, 0],
                          transition: { duration: 0.35, ease: 'easeOut' }
                        }
                      : {
                          y: 0,
                          opacity: 1,
                          scale: selected ? 1.05 : 1,
                          rotate: 0,
                          transition: {
                            type: 'spring',
                            damping: 14,
                            stiffness: 250,
                            mass: 0.75,
                            delay: r * 0.045 + c * 0.02
                          }
                        }
                  }
                  className={`relative flex items-center justify-center rounded-xl font-black transition-all duration-150 ease-out select-none ${
                    selected
                      ? 'scale-105 z-20'
                      : isFound
                      ? 'scale-100 z-15'
                      : 'scale-100 z-10 hover:scale-105'
                  }`}
                >
                  {/* Glowing Hint Indicator */}
                  {isHinted && (
                    <>
                      <div className="absolute inset-0 rounded-xl bg-amber-400/50 animate-ping pointer-events-none" />
                      <div className="absolute -inset-1 rounded-2xl bg-amber-400/40 animate-pulse blur-xs pointer-events-none" />
                    </>
                  )}

                  {/* Tile Surface */}
                  <div
                    className={`absolute inset-0.5 rounded-xl transition-all duration-200 ${
                      selected
                        ? 'bg-blue-600 shadow-md shadow-blue-500/30'
                        : isHinted
                        ? 'bg-amber-100 border-2 border-amber-500 shadow-md shadow-amber-500/30 ring-2 ring-amber-400/50 animate-pulse'
                        : isFound
                        ? 'bg-slate-100/80 shadow-xs'
                        : 'bg-slate-50/70 hover:bg-slate-100 border border-slate-100'
                    }`}
                  />

                  {/* Navy Letter Typography */}
                  <span
                    className={`relative z-20 pointer-events-none leading-none select-none tracking-wide ${
                      selected
                        ? 'text-white font-black'
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
                    } ${isHinted ? 'text-amber-700 font-black scale-110' : ''}`}
                  >
                    {letter}
                  </span>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
};
