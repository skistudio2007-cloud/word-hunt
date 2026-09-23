/**
 * Word Hunter 10,000+ Pre-Generated Levels Registry
 * Chunk-based dynamic loading for minimal memory footprint and zero startup latency.
 */

import { CompactLevel } from './types';

export * from './types';

export const TOTAL_PREGENERATED_LEVELS = 10000;
export const CHUNK_SIZE = 500;
export const TOTAL_CHUNKS = 20;

export function getChunkNumberForLevel(levelNumber: number): number {
  if (levelNumber < 1) return 1;
  return Math.min(TOTAL_CHUNKS, Math.floor((levelNumber - 1) / CHUNK_SIZE) + 1);
}

// Vite code-split dynamic chunk loaders for all 20 chunks
export const CHUNK_LOADERS: Record<number, () => Promise<{ default: CompactLevel[] }>> = {
  1: () => import('./chunks/chunk_1.json'),
  2: () => import('./chunks/chunk_2.json'),
  3: () => import('./chunks/chunk_3.json'),
  4: () => import('./chunks/chunk_4.json'),
  5: () => import('./chunks/chunk_5.json'),
  6: () => import('./chunks/chunk_6.json'),
  7: () => import('./chunks/chunk_7.json'),
  8: () => import('./chunks/chunk_8.json'),
  9: () => import('./chunks/chunk_9.json'),
  10: () => import('./chunks/chunk_10.json'),
  11: () => import('./chunks/chunk_11.json'),
  12: () => import('./chunks/chunk_12.json'),
  13: () => import('./chunks/chunk_13.json'),
  14: () => import('./chunks/chunk_14.json'),
  15: () => import('./chunks/chunk_15.json'),
  16: () => import('./chunks/chunk_16.json'),
  17: () => import('./chunks/chunk_17.json'),
  18: () => import('./chunks/chunk_18.json'),
  19: () => import('./chunks/chunk_19.json'),
  20: () => import('./chunks/chunk_20.json'),
};
