import { 
  PuzzleData, 
  PlacedWord, 
  Coordinate, 
  Direction, 
  LanguageCode 
} from '../types';
import { 
  CompactLevel, 
  CHUNK_LOADERS, 
  TOTAL_PREGENERATED_LEVELS, 
  getChunkNumberForLevel 
} from '../data/levels';
import { getWorldForLevel } from '../data/worlds';
import { 
  generatePuzzle, 
  getDifficultyConfig, 
  WORD_HIGHLIGHT_COLORS 
} from './puzzleGenerator';

// Direction vector offsets [dRow, dCol]
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

class LevelService {
  private chunkCache = new Map<number, CompactLevel[]>();
  private activeChunkPromises = new Map<number, Promise<CompactLevel[]>>();
  private inflatedLevelCache = new Map<number, PuzzleData>();

  constructor() {
    // Eagerly preload chunk 1 (levels 1-500) for zero-latency launch
    this.preloadChunk(1).catch(() => {});
  }

  /**
   * Preloads a specific chunk number into memory
   */
  public async preloadChunk(chunkNum: number): Promise<CompactLevel[]> {
    if (this.chunkCache.has(chunkNum)) {
      return this.chunkCache.get(chunkNum)!;
    }

    if (this.activeChunkPromises.has(chunkNum)) {
      return this.activeChunkPromises.get(chunkNum)!;
    }

    const loader = CHUNK_LOADERS[chunkNum];
    if (!loader) {
      return [];
    }

    const promise = (async () => {
      try {
        const mod = await loader();
        const levels = mod.default || (mod as unknown as CompactLevel[]);
        this.chunkCache.set(chunkNum, levels);
        return levels;
      } catch (err) {
        console.warn(`⚠️ Failed to load level chunk ${chunkNum}:`, err);
        return [];
      } finally {
        this.activeChunkPromises.delete(chunkNum);
      }
    })();

    this.activeChunkPromises.set(chunkNum, promise);
    return promise;
  }

  /**
   * Preloads chunk for a given level number, and preloads the next chunk if near boundary
   */
  public async preloadLevel(levelNumber: number): Promise<void> {
    if (levelNumber < 1 || levelNumber > TOTAL_PREGENERATED_LEVELS) return;

    const chunkNum = getChunkNumberForLevel(levelNumber);
    await this.preloadChunk(chunkNum);

    // If within 25 levels of chunk end, preload next chunk in background
    const indexInChunk = (levelNumber - 1) % 500;
    if (indexInChunk >= 475 && chunkNum < 20) {
      this.preloadChunk(chunkNum + 1).catch(() => {});
    }
  }

  /**
   * Inflates a stored CompactLevel into a full PuzzleData object
   */
  private inflateLevel(compact: CompactLevel): PuzzleData {
    if (this.inflatedLevelCache.has(compact.l)) {
      return this.inflatedLevelCache.get(compact.l)!;
    }

    const world = getWorldForLevel(compact.l);
    const difficultyConfig = getDifficultyConfig(compact.l);

    const placedWords: PlacedWord[] = compact.w.map((w, idx) => {
      const dir = w.dir as Direction;
      const [dRow, dCol] = DIRECTION_OFFSETS[dir];
      const startCoord: Coordinate = { row: w.s[0], col: w.s[1] };
      const endCoord: Coordinate = { row: w.ec[0], col: w.ec[1] };

      const cells: Coordinate[] = [];
      for (let i = 0; i < w.w.length; i++) {
        cells.push({
          row: startCoord.row + dRow * i,
          col: startCoord.col + dCol * i
        });
      }

      return {
        id: `${w.w}-${idx}`,
        word: w.w,
        displayWord: w.w,
        category: w.c,
        definition: w.d || `A key word in the ${compact.t.toLowerCase()} theme.`,
        example: w.e || `Discover ${w.w} as you master this level.`,
        start: startCoord,
        end: endCoord,
        direction: dir,
        cells,
        color: WORD_HIGHLIGHT_COLORS[idx % WORD_HIGHLIGHT_COLORS.length],
        found: false
      };
    });

    const puzzle: PuzzleData = {
      levelNumber: compact.l,
      seed: compact.s,
      worldId: world.id,
      worldName: world.name,
      theme: compact.t,
      gridSize: compact.sz,
      grid: compact.g.map(row => row.split('')),
      words: placedWords,
      allowedDirections: difficultyConfig.allowedDirections
    };

    // Cache the inflated puzzle
    this.inflatedLevelCache.set(compact.l, puzzle);
    return puzzle;
  }

  /**
   * Loads a level from the pre-generated database.
   * If level > 10,000 or non-English language requested, gracefully falls back to deterministic generator.
   */
  public async getLevel(levelNumber: number, language: LanguageCode = 'en'): Promise<PuzzleData> {
    // Non-English languages or levels > 10,000 use procedural fallback
    if (language !== 'en' || levelNumber > TOTAL_PREGENERATED_LEVELS || levelNumber < 1) {
      return generatePuzzle(levelNumber, undefined, language);
    }

    // Check memory cache first
    if (this.inflatedLevelCache.has(levelNumber)) {
      return this.inflatedLevelCache.get(levelNumber)!;
    }

    const chunkNum = getChunkNumberForLevel(levelNumber);
    let chunk = this.chunkCache.get(chunkNum);

    if (!chunk) {
      chunk = await this.preloadChunk(chunkNum);
    }

    if (chunk && chunk.length > 0) {
      const indexInChunk = (levelNumber - 1) % 500;
      const compactLevel = chunk[indexInChunk];
      if (compactLevel && compactLevel.l === levelNumber) {
        return this.inflateLevel(compactLevel);
      }
    }

    // Fallback if chunk could not be loaded
    console.warn(`⚠️ Pre-generated level ${levelNumber} missing in chunk ${chunkNum}, falling back to generator`);
    return generatePuzzle(levelNumber, undefined, language);
  }

  /**
   * Synchronous level getter if chunk is already loaded in memory
   */
  public getLevelSync(levelNumber: number, language: LanguageCode = 'en'): PuzzleData {
    if (language !== 'en' || levelNumber > TOTAL_PREGENERATED_LEVELS || levelNumber < 1) {
      return generatePuzzle(levelNumber, undefined, language);
    }

    if (this.inflatedLevelCache.has(levelNumber)) {
      return this.inflatedLevelCache.get(levelNumber)!;
    }

    const chunkNum = getChunkNumberForLevel(levelNumber);
    const chunk = this.chunkCache.get(chunkNum);
    if (chunk && chunk.length > 0) {
      const indexInChunk = (levelNumber - 1) % 500;
      const compactLevel = chunk[indexInChunk];
      if (compactLevel && compactLevel.l === levelNumber) {
        return this.inflateLevel(compactLevel);
      }
    }

    return generatePuzzle(levelNumber, undefined, language);
  }
}

export const levelService = new LevelService();
