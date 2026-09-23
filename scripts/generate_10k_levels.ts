import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generatePuzzle, getDifficultyConfig } from '../src/services/puzzleGenerator';
import { getWorldForLevel } from '../src/data/worlds';
import { Direction, Coordinate, PuzzleData } from '../src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface CompactWord {
  w: string;
  c: string;
  d?: string;
  e?: string;
  s: [number, number];
  ec: [number, number];
  dir: Direction;
}

export interface CompactLevel {
  l: number;
  s: number;
  t: string;
  sz: number;
  g: string[];
  w: CompactWord[];
}

const DIRECTION_OFFSETS: Record<Direction, [number, number]> = {
  RIGHT: [0, 1],
  LEFT: [0, -1],
  DOWN: [1, 0],
  UP: [-1, 0],
  DOWN_RIGHT: [1, 1],
  DOWN_LEFT: [1, -1],
  UP_RIGHT: [-1, 1],
  UP_LEFT: [-1, -1]
};

/**
 * Validates a generated puzzle for complete solvability, bounds, and integrity
 */
function validatePuzzle(puzzle: PuzzleData, expectedLevel: number): { valid: boolean; reason?: string } {
  if (puzzle.levelNumber !== expectedLevel) {
    return { valid: false, reason: `Level number mismatch: expected ${expectedLevel}, got ${puzzle.levelNumber}` };
  }

  const size = puzzle.gridSize;
  if (!puzzle.grid || puzzle.grid.length !== size) {
    return { valid: false, reason: `Grid height mismatch: expected ${size}, got ${puzzle.grid?.length}` };
  }

  for (let r = 0; r < size; r++) {
    if (!puzzle.grid[r] || puzzle.grid[r].length !== size) {
      return { valid: false, reason: `Grid row ${r} width mismatch: expected ${size}` };
    }
    for (let c = 0; c < size; c++) {
      const char = puzzle.grid[r][c];
      if (!char || typeof char !== 'string' || char.length !== 1 || !/[A-Z]/.test(char)) {
        return { valid: false, reason: `Invalid character at (${r},${c}): "${char}"` };
      }
    }
  }

  if (!puzzle.words || puzzle.words.length === 0) {
    return { valid: false, reason: 'Puzzle has no words' };
  }

  // Verify every word is correctly placed and 100% solvable in the grid
  for (const w of puzzle.words) {
    const wordLen = w.word.length;
    if (wordLen < 3) {
      return { valid: false, reason: `Word too short: ${w.word}` };
    }

    const [dRow, dCol] = DIRECTION_OFFSETS[w.direction];
    if (dRow === undefined || dCol === undefined) {
      return { valid: false, reason: `Invalid direction: ${w.direction}` };
    }

    const expectedEndRow = w.start.row + dRow * (wordLen - 1);
    const expectedEndCol = w.start.col + dCol * (wordLen - 1);

    if (w.end.row !== expectedEndRow || w.end.col !== expectedEndCol) {
      return { valid: false, reason: `Word endpoint mismatch for ${w.word}` };
    }

    if (
      w.start.row < 0 || w.start.row >= size ||
      w.start.col < 0 || w.start.col >= size ||
      w.end.row < 0 || w.end.row >= size ||
      w.end.col < 0 || w.end.col >= size
    ) {
      return { valid: false, reason: `Word coordinates out of bounds: ${w.word}` };
    }

    // Verify each character matches grid
    for (let i = 0; i < wordLen; i++) {
      const currR = w.start.row + dRow * i;
      const currC = w.start.col + dCol * i;
      const gridChar = puzzle.grid[currR][currC];
      if (gridChar !== w.word[i]) {
        return { valid: false, reason: `Letter mismatch for ${w.word} at index ${i}: expected ${w.word[i]}, found ${gridChar}` };
      }
    }
  }

  return { valid: true };
}

/**
 * Computes deterministic fingerprint to guarantee uniqueness across all 10,000 levels
 */
function computeFingerprint(puzzle: PuzzleData): string {
  const sortedWords = puzzle.words.map(w => w.word).sort().join(',');
  const flatGrid = puzzle.grid.map(row => row.join('')).join('');
  return `${puzzle.theme}:${puzzle.gridSize}:${sortedWords}:${flatGrid}`;
}

/**
 * Converts PuzzleData to CompactLevel
 */
function toCompactLevel(puzzle: PuzzleData): CompactLevel {
  return {
    l: puzzle.levelNumber,
    s: puzzle.seed,
    t: puzzle.theme,
    sz: puzzle.gridSize,
    g: puzzle.grid.map(row => row.join('')),
    w: puzzle.words.map(w => ({
      w: w.word,
      c: w.category,
      d: w.definition,
      e: w.example,
      s: [w.start.row, w.start.col],
      ec: [w.end.row, w.end.col],
      dir: w.direction
    }))
  };
}

async function generateAllLevels() {
  const TOTAL_LEVELS = 10000;
  const CHUNK_SIZE = 500;
  const TOTAL_CHUNKS = TOTAL_LEVELS / CHUNK_SIZE; // 20 chunks

  const outputDir = path.resolve(__dirname, '../src/data/levels/chunks');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`🚀 Starting generation of ${TOTAL_LEVELS} validated, unique levels...`);
  const startTime = Date.now();

  const seenFingerprints = new Set<string>();
  let currentChunkIndex = 1;
  let currentChunkLevels: CompactLevel[] = [];
  let duplicateCount = 0;
  let retryCount = 0;

  for (let levelNum = 1; levelNum <= TOTAL_LEVELS; levelNum++) {
    let accepted = false;
    let attempt = 0;
    const maxAttempts = 50;

    while (!accepted && attempt < maxAttempts) {
      const seedOffset = attempt === 0 ? 0 : attempt * 7919;
      const seed = 100000 + levelNum + seedOffset;

      const puzzle = levelNum === 1 ? generatePuzzle(1) : generatePuzzle(levelNum, seed);
      // Ensure levelNumber is explicitly set to current levelNum
      puzzle.levelNumber = levelNum;

      const validation = validatePuzzle(puzzle, levelNum);
      if (!validation.valid) {
        attempt++;
        retryCount++;
        continue;
      }

      const fp = computeFingerprint(puzzle);
      if (seenFingerprints.has(fp)) {
        attempt++;
        duplicateCount++;
        continue;
      }

      // Valid and unique level accepted
      seenFingerprints.add(fp);
      currentChunkLevels.push(toCompactLevel(puzzle));
      accepted = true;
    }

    if (!accepted) {
      throw new Error(`Failed to generate a valid, unique puzzle for Level ${levelNum} after ${maxAttempts} attempts`);
    }

    // Save chunk when CHUNK_SIZE reached
    if (currentChunkLevels.length === CHUNK_SIZE) {
      const chunkFile = path.join(outputDir, `chunk_${currentChunkIndex}.json`);
      fs.writeFileSync(chunkFile, JSON.stringify(currentChunkLevels), 'utf-8');
      console.log(`📦 Saved chunk ${currentChunkIndex}/${TOTAL_CHUNKS} (Levels ${levelNum - CHUNK_SIZE + 1} to ${levelNum})`);
      currentChunkIndex++;
      currentChunkLevels = [];
    }
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`🎉 SUCCESS: Generated ${TOTAL_LEVELS} levels in ${durationSec}s!`);
  console.log(`   - Total Chunks: ${TOTAL_CHUNKS} (500 levels each)`);
  console.log(`   - Unique Fingerprints: ${seenFingerprints.size}`);
  console.log(`   - Duplicates Avoided: ${duplicateCount}`);
  console.log(`   - Retries Resolved: ${retryCount}`);

  // Create TypeScript loader index in src/data/levels/index.ts
  const indexTsContent = `/**
 * Word Hunter 10,000+ Pre-Generated Levels Registry
 * Chunk-based dynamic loading for minimal memory footprint and zero startup latency.
 */

import { CompactLevel } from './types';

export * from './types';

export const TOTAL_PREGENERATED_LEVELS = ${TOTAL_LEVELS};
export const CHUNK_SIZE = ${CHUNK_SIZE};
export const TOTAL_CHUNKS = ${TOTAL_CHUNKS};

export function getChunkNumberForLevel(levelNumber: number): number {
  if (levelNumber < 1) return 1;
  return Math.min(TOTAL_CHUNKS, Math.floor((levelNumber - 1) / CHUNK_SIZE) + 1);
}

// Vite code-split dynamic chunk loaders for all 20 chunks
export const CHUNK_LOADERS: Record<number, () => Promise<{ default: CompactLevel[] }>> = {
${Array.from({ length: TOTAL_CHUNKS }, (_, i) => `  ${i + 1}: () => import('./chunks/chunk_${i + 1}.json'),`).join('\n')}
};
`;

  fs.writeFileSync(path.resolve(__dirname, '../src/data/levels/index.ts'), indexTsContent, 'utf-8');

  // Create type definition file in src/data/levels/types.ts
  const typesTsContent = `import { Direction } from '../../types';

export interface CompactWord {
  w: string;
  c: string;
  d?: string;
  e?: string;
  s: number[];
  ec: number[];
  dir: string;
}

export interface CompactLevel {
  l: number;
  s: number;
  t: string;
  sz: number;
  g: string[];
  w: CompactWord[];
}
`;

  fs.writeFileSync(path.resolve(__dirname, '../src/data/levels/types.ts'), typesTsContent, 'utf-8');
  console.log(`📝 Generated src/data/levels/index.ts and src/data/levels/types.ts`);
}

generateAllLevels().catch(err => {
  console.error('Fatal error during level generation:', err);
  process.exit(1);
});
