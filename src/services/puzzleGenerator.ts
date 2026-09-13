import { Coordinate, Direction, PlacedWord, PuzzleData, ChallengeInfo, LanguageCode } from '../types';
import { getWordDatabase, THEME_FALLBACKS } from '../data/wordDatabase';
import { getWorldForLevel } from '../data/worlds';

/**
 * High-quality PRNG (Mulberry32) for deterministic level generation
 */
class SeededRandom {
  private s: number;

  constructor(seed: number) {
    this.s = seed;
  }

  next(): number {
    let t = (this.s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(min + this.next() * (max - min + 1));
  }

  choice<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }

  shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}

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

// Vibrant, beautiful contrast highlight colors for discovered words on the white board
export const WORD_HIGHLIGHT_COLORS = [
  '#2563EB', // Vibrant Blue
  '#059669', // Emerald Green
  '#D97706', // Warm Amber
  '#DB2777', // Rose Pink
  '#7C3AED', // Purple Violet
  '#0891B2', // Deep Cyan
  '#EA580C', // Bright Orange
  '#0D9488', // Deep Teal
  '#4F46E5', // Indigo
  '#C026D3', // Fuchsia
];

export interface LevelConfig {
  gridSize: number;
  wordCount: number;
  minWordLen: number;
  maxWordLen: number;
  allowedDirections: Direction[];
}

export function getDifficultyConfig(levelNumber: number): LevelConfig {
  if (levelNumber === 1) {
    return {
      gridSize: 5,
      wordCount: 3,
      minWordLen: 3,
      maxWordLen: 4,
      allowedDirections: ['RIGHT', 'DOWN']
    };
  }

  if (levelNumber <= 10) {
    return {
      gridSize: 5,
      wordCount: 3 + (levelNumber > 5 ? 1 : 0),
      minWordLen: 3,
      maxWordLen: 5,
      allowedDirections: ['RIGHT', 'DOWN', 'LEFT', 'UP', 'DOWN_RIGHT', 'UP_RIGHT']
    };
  }

  if (levelNumber <= 30) {
    return {
      gridSize: 6,
      wordCount: 4 + (levelNumber > 20 ? 1 : 0),
      minWordLen: 4,
      maxWordLen: 6,
      allowedDirections: ['RIGHT', 'DOWN', 'DOWN_RIGHT', 'UP_RIGHT', 'LEFT', 'UP']
    };
  }

  if (levelNumber <= 75) {
    return {
      gridSize: 7,
      wordCount: 5 + Math.floor((levelNumber - 30) / 20),
      minWordLen: 4,
      maxWordLen: 7,
      allowedDirections: ['RIGHT', 'DOWN', 'LEFT', 'UP', 'DOWN_RIGHT', 'DOWN_LEFT', 'UP_RIGHT', 'UP_LEFT']
    };
  }

  if (levelNumber <= 150) {
    return {
      gridSize: 8,
      wordCount: 6 + Math.floor((levelNumber - 75) / 35),
      minWordLen: 4,
      maxWordLen: 8,
      allowedDirections: ['RIGHT', 'DOWN', 'LEFT', 'UP', 'DOWN_RIGHT', 'DOWN_LEFT', 'UP_RIGHT', 'UP_LEFT']
    };
  }

  if (levelNumber <= 300) {
    return {
      gridSize: 9,
      wordCount: 7 + Math.floor((levelNumber - 150) / 50),
      minWordLen: 4,
      maxWordLen: 9,
      allowedDirections: ['RIGHT', 'DOWN', 'LEFT', 'UP', 'DOWN_RIGHT', 'DOWN_LEFT', 'UP_RIGHT', 'UP_LEFT']
    };
  }

  if (levelNumber <= 500) {
    return {
      gridSize: 10,
      wordCount: 8 + Math.floor((levelNumber - 300) / 60),
      minWordLen: 4,
      maxWordLen: 10,
      allowedDirections: ['RIGHT', 'DOWN', 'LEFT', 'UP', 'DOWN_RIGHT', 'DOWN_LEFT', 'UP_RIGHT', 'UP_LEFT']
    };
  }

  // Dynamic progressive scaling for 501 - 10,000+
  const cycle = (levelNumber - 500) % 50;
  const size = Math.min(10, 8 + Math.floor(cycle / 15));
  return {
    gridSize: size,
    wordCount: Math.min(10, 7 + Math.floor(cycle / 10)),
    minWordLen: 4,
    maxWordLen: size,
    allowedDirections: ['RIGHT', 'DOWN', 'LEFT', 'UP', 'DOWN_RIGHT', 'DOWN_LEFT', 'UP_RIGHT', 'UP_LEFT']
  };
}

/**
 * Generates a complete, validated word search puzzle deterministically.
 */
export function generatePuzzle(levelNumber: number, overrideSeed?: number, language: LanguageCode = 'en'): PuzzleData {
  const seed = overrideSeed ?? (100000 + levelNumber);
  const rng = new SeededRandom(seed);
  const world = getWorldForLevel(levelNumber);
  const config = getDifficultyConfig(levelNumber);
  const wordDb = getWordDatabase(language);

  // Special deterministic guarantee for Tutorial Level 1
  if (levelNumber === 1 && !overrideSeed) {
    return generateTutorialLevel1(seed, world, language);
  }

  // 1. Pick category from the world themes
  const themeCategory = rng.choice(world.themeCategories);

  // 2. Gather candidate words
  let candidates: { word: string; definition?: string; example?: string }[] = [];

  if (wordDb[themeCategory]) {
    candidates = wordDb[themeCategory]
      .filter(w => w.word.length >= config.minWordLen && w.word.length <= config.maxWordLen)
      .map(w => ({ word: w.word.toUpperCase(), definition: w.definition, example: w.example }));
  }

  if (candidates.length < config.wordCount && THEME_FALLBACKS[themeCategory]) {
    const fallbacks = THEME_FALLBACKS[themeCategory]
      .filter(w => w.length >= config.minWordLen && w.length <= config.maxWordLen)
      .map(w => ({
        word: w.toUpperCase(),
        definition: `A term related to ${themeCategory.toLowerCase().replace('_', ' ')}.`,
        example: `Explore words within the ${themeCategory.toLowerCase().replace('_', ' ')} theme.`
      }));
    candidates = [...candidates, ...fallbacks];
  }

  // If still insufficient, pull from other database categories
  if (candidates.length < config.wordCount) {
    for (const cat of Object.keys(wordDb)) {
      if (cat === themeCategory) continue;
      const extra = wordDb[cat]
        .filter(w => w.word.length >= config.minWordLen && w.word.length <= config.maxWordLen)
        .map(w => ({ word: w.word.toUpperCase(), definition: w.definition, example: w.example }));
      candidates = [...candidates, ...extra];
      if (candidates.length >= config.wordCount + 10) break;
    }
  }

  // Deduplicate and shuffle
  const uniqueMap = new Map<string, { word: string; definition?: string; example?: string }>();
  candidates.forEach(c => {
    if (!uniqueMap.has(c.word)) uniqueMap.set(c.word, c);
  });
  const uniqueCandidates = rng.shuffle(Array.from(uniqueMap.values()));

  // Attempt puzzle placement with backtracking
  let attempt = 0;
  let finalGrid: string[][] = [];
  let placedWords: PlacedWord[] = [];

  while (attempt < 25) {
    attempt++;
    const grid: (string | null)[][] = Array.from({ length: config.gridSize }, () =>
      Array.from({ length: config.gridSize }, () => null)
    );
    const placed: PlacedWord[] = [];
    const targetWords = uniqueCandidates.slice(0, config.wordCount + 5);

    // Sort longer words first for easier fitting
    targetWords.sort((a, b) => b.word.length - a.word.length);

    let colorIdx = 0;
    for (const item of targetWords) {
      if (placed.length >= config.wordCount) break;

      const placement = tryPlaceWord(item.word, grid, config.allowedDirections, rng);
      if (placement) {
        // Mark cells in grid
        placement.cells.forEach((coord, idx) => {
          grid[coord.row][coord.col] = item.word[idx];
        });

        placed.push({
          id: `${item.word}-${placed.length}`,
          word: item.word,
          displayWord: item.word,
          category: themeCategory,
          definition: item.definition || `A key word in the ${themeCategory.replace('_', ' ')} theme.`,
          example: item.example || `Discover ${item.word} as you master this level.`,
          start: placement.start,
          end: placement.end,
          direction: placement.direction,
          cells: placement.cells,
          color: WORD_HIGHLIGHT_COLORS[colorIdx % WORD_HIGHLIGHT_COLORS.length],
          found: false
        });
        colorIdx++;
      }
    }

    if (placed.length >= Math.min(config.wordCount, 3)) {
      // Success! Fill remaining cells with theme letters or alphabet
      const letterPool = placed.map(p => p.word).join('') + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      finalGrid = grid.map(row =>
        row.map(cell => cell !== null ? cell : letterPool[rng.nextInt(0, letterPool.length - 1)])
      );
      placedWords = placed;
      break;
    }
  }

  // Fallback safe build if extreme constraint
  if (placedWords.length === 0) {
    return generateTutorialLevel1(seed, world);
  }

  return {
    levelNumber,
    seed,
    worldId: world.id,
    worldName: world.name,
    theme: themeCategory.replace(/_/g, ' '),
    gridSize: config.gridSize,
    grid: finalGrid,
    words: placedWords,
    allowedDirections: config.allowedDirections
  };
}

function tryPlaceWord(
  word: string,
  grid: (string | null)[][],
  allowedDirs: Direction[],
  rng: SeededRandom
): { start: Coordinate; end: Coordinate; direction: Direction; cells: Coordinate[] } | null {
  const size = grid.length;
  const wordLen = word.length;
  const shuffledDirs = rng.shuffle(allowedDirs);

  // Generate all valid starting positions
  const startCoords: Coordinate[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      startCoords.push({ row: r, col: c });
    }
  }
  const shuffledStarts = rng.shuffle(startCoords);

  for (const dir of shuffledDirs) {
    const [dRow, dCol] = DIRECTION_OFFSETS[dir];

    for (const start of shuffledStarts) {
      const endRow = start.row + dRow * (wordLen - 1);
      const endCol = start.col + dCol * (wordLen - 1);

      if (endRow < 0 || endRow >= size || endCol < 0 || endCol >= size) {
        continue;
      }

      // Check if path is valid (empty or matching character)
      let canPlace = true;
      const cells: Coordinate[] = [];

      for (let i = 0; i < wordLen; i++) {
        const currRow = start.row + dRow * i;
        const currCol = start.col + dCol * i;
        const existingChar = grid[currRow][currCol];

        if (existingChar !== null && existingChar !== word[i]) {
          canPlace = false;
          break;
        }
        cells.push({ row: currRow, col: currCol });
      }

      if (canPlace) {
        return {
          start,
          end: { row: endRow, col: endCol },
          direction: dir,
          cells
        };
      }
    }
  }

  return null;
}

/**
 * Deterministic Tutorial Level 1 supporting all 9 languages
 */
function generateTutorialLevel1(seed: number, world: ReturnType<typeof getWorldForLevel>, lang: LanguageCode = 'en'): PuzzleData {
  const size = 5;

  const TUTORIAL_SETS: Record<LanguageCode, { words: { word: string; def: string; ex: string }[]; theme: string }> = {
    en: {
      theme: 'ANIMALS',
      words: [
        { word: 'CAT', def: 'A small domesticated feline companion with soft fur.', ex: 'The cheerful cat curled up on the sunny rug.' },
        { word: 'DOG', def: 'A loyal four-legged friend known for enthusiasm.', ex: 'The friendly dog chased the ball across the park.' },
        { word: 'LION', def: 'A majestic big cat known as the king of the savanna.', ex: 'The brave lion watched the horizon at sunrise.' },
      ]
    },
    es: {
      theme: 'ANIMALES',
      words: [
        { word: 'GATO', def: 'Pequeño mamífero felino doméstico.', ex: 'El gato duerme tranquilo al sol.' },
        { word: 'LEON', def: 'Gran felino salvaje rey de la sabana.', ex: 'El león ruge al amanecer.' },
        { word: 'OSO', def: 'Gran mamífero de abundante pelaje.', ex: 'El oso busca alimento en el bosque.' },
      ]
    },
    fr: {
      theme: 'ANIMAUX',
      words: [
        { word: 'CHAT', def: 'Petit félin domestique doux et agile.', ex: 'Le chat ronronne sur le fauteuil.' },
        { word: 'LION', def: 'Grand carnivore majestueux de la savane.', ex: 'Le lion règne sur son territoire.' },
        { word: 'OURS', def: 'Grand mammifère puissant des forêts.', ex: 'L’ours pêche dans la rivière.' },
      ]
    },
    de: {
      theme: 'TIERE',
      words: [
        { word: 'HUND', def: 'Treuer vierbeiniger Freund des Menschen.', ex: 'Der Hund läuft fröhlich durch den Park.' },
        { word: 'WOLF', def: 'Wildes Rudeltier der tiefen Wälder.', ex: 'Der Wolf heult im fernen Wald.' },
        { word: 'BAER', def: 'Großes starkes Waldtier mit dichtem Fell.', ex: 'Der Bär genießt die Frische des Flusses.' },
      ]
    },
    pt: {
      theme: 'ANIMAIS',
      words: [
        { word: 'GATO', def: 'Pequeno animal felino carinhoso e ágil.', ex: 'O gato brinca no jardim florido.' },
        { word: 'LEAO', def: 'O grande e imponente rei da selva.', ex: 'O leão descansa sob a sombra.' },
        { word: 'URSO', def: 'Mamífero grande e robusto com pelo espesso.', ex: 'O urso caminha pelas montanhas.' },
      ]
    },
    id: {
      theme: 'HEWAN',
      words: [
        { word: 'IKAN', def: 'Hewan air yang berenang dengan lincah.', ex: 'Ikan berenang di kolam jernih.' },
        { word: 'SINGA', def: 'Raja hutan yang gagah dan berani.', ex: 'Singa menjaga kawanannya dengan setia.' },
        { word: 'KUDA', def: 'Hewan berkaki empat yang tangkas berlari.', ex: 'Kuda berlari kencang di padang rumput.' },
      ]
    },
    ja: {
      theme: '動物 (ANIMALS)',
      words: [
        { word: 'NEKO', def: '猫 (ねこ) - 穏やかで愛らしい家庭の友。', ex: 'ひなたぼっこをする可愛い猫。' },
        { word: 'INU', def: '犬 (いぬ) - 忠実で賢い人間の親友。', ex: '元気に走る人懐っこい犬。' },
        { word: 'TORA', def: '虎 (とら) - 勇敢で力強い森の王者。', ex: '密林を堂々と歩く虎。' },
      ]
    },
    ko: {
      theme: '동물 (ANIMALS)',
      words: [
        { word: 'SAJA', def: '사자 - 초원의 용맹한 백수의 왕.', ex: '초원을 바라보는 늠름한 사자.' },
        { word: 'GOM', def: '곰 - 큰 몸집에 따뜻한 털을 가진 동물.', ex: '물속에서 헤엄치는 곰.' },
        { word: 'NABI', def: '나비 - 아름다운 날개로 꽃을 찾는 곤충.', ex: '꽃밭을 날아다니는 노란 나비.' },
      ]
    },
    hi: {
      theme: 'जानवर (ANIMALS)',
      words: [
        { word: 'SHER', def: 'शेर - जंगल का साहसी और शक्तिशाली राजा।', ex: 'सवेरे दहाड़ता हुआ जंगल का शेर।' },
        { word: 'HATHI', def: 'हाथी - लंबी सूंड वाला विशालकाय समझदार जानवर।', ex: 'शांत स्वभाव वाला विशाल हाथी।' },
        { word: 'TARA', def: 'तारा - रात के अंधेरे में टिमटिमाता आकाशीय पिंड।', ex: 'चमकता हुआ ध्रुव तारा।' },
      ]
    }
  };

  const selected = TUTORIAL_SETS[lang] || TUTORIAL_SETS.en;
  const grid: string[][] = Array.from({ length: size }, () => Array.from({ length: size }, () => ''));
  const fillerLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  const words: PlacedWord[] = selected.words.map((item, idx) => {
    const row = idx;
    const word = item.word.toUpperCase();
    const cells: Coordinate[] = [];
    for (let c = 0; c < word.length; c++) {
      grid[row][c] = word[c];
      cells.push({ row, col: c });
    }
    return {
      id: `${word}-${idx}`,
      word,
      displayWord: word,
      category: selected.theme,
      definition: item.def,
      example: item.ex,
      start: { row, col: 0 },
      end: { row, col: word.length - 1 },
      direction: 'RIGHT' as Direction,
      cells,
      color: WORD_HIGHLIGHT_COLORS[idx % WORD_HIGHLIGHT_COLORS.length],
      found: false
    };
  });

  const letterPool = words.map(w => w.word).join('') + fillerLetters;
  const rng = new SeededRandom(seed);
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!grid[r][c]) {
        grid[r][c] = letterPool[rng.nextInt(0, letterPool.length - 1)];
      }
    }
  }

  return {
    levelNumber: 1,
    seed,
    worldId: world.id,
    worldName: world.name,
    theme: selected.theme,
    gridSize: size,
    grid,
    words,
    allowedDirections: ['RIGHT', 'DOWN']
  };
}

/**
 * Generates Daily Puzzle for a specific date
 */
export function generateDailyPuzzle(date: Date = new Date(), language: LanguageCode = 'en'): PuzzleData {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  
  // Numerical seed from YYYYMMDD
  const dateSeed = year * 10000 + month * 100 + day;
  const puzzle = generatePuzzle(30 + (day * 3), dateSeed, language);
  
  return {
    ...puzzle,
    isDaily: true,
    dateKey,
    theme: `DAILY SPECIAL: ${puzzle.theme}`
  };
}

/**
 * Generates special Expedition Challenge Puzzle
 */
export function generateChallengePuzzle(challenge: ChallengeInfo, language: LanguageCode = 'en'): PuzzleData {
  const seed = 999000 + challenge.gridSize * 100 + challenge.wordCount;
  const rng = new SeededRandom(seed);
  const themeCategory = challenge.theme;
  const wordDb = getWordDatabase(language);

  let candidates: { word: string; definition?: string; example?: string }[] = [];
  if (wordDb[themeCategory]) {
    candidates = wordDb[themeCategory]
      .filter(w => w.word.length >= 3 && w.word.length <= challenge.gridSize)
      .map(w => ({ word: w.word.toUpperCase(), definition: w.definition, example: w.example }));
  }

  if (candidates.length < challenge.wordCount && THEME_FALLBACKS[themeCategory]) {
    const fallbacks = THEME_FALLBACKS[themeCategory]
      .filter(w => w.length >= 3 && w.length <= challenge.gridSize)
      .map(w => ({
        word: w.toUpperCase(),
        definition: `A term related to ${themeCategory.toLowerCase().replace('_', ' ')}.`,
        example: `Explore words within the ${themeCategory.toLowerCase().replace('_', ' ')} challenge.`
      }));
    candidates = [...candidates, ...fallbacks];
  }

  if (candidates.length < challenge.wordCount) {
    for (const cat of Object.keys(wordDb)) {
      if (cat === themeCategory) continue;
      const extra = wordDb[cat]
        .filter(w => w.word.length >= 3 && w.word.length <= challenge.gridSize)
        .map(w => ({ word: w.word.toUpperCase(), definition: w.definition, example: w.example }));
      candidates = [...candidates, ...extra];
      if (candidates.length >= challenge.wordCount + 10) break;
    }
  }

  const uniqueCandidates = rng.shuffle(candidates);
  const allowedDirs: Direction[] = ['RIGHT', 'DOWN', 'LEFT', 'UP', 'DOWN_RIGHT', 'DOWN_LEFT', 'UP_RIGHT', 'UP_LEFT'];

  const grid: (string | null)[][] = Array.from({ length: challenge.gridSize }, () =>
    Array.from({ length: challenge.gridSize }, () => null)
  );
  const placed: PlacedWord[] = [];
  const targetWords = uniqueCandidates.slice(0, challenge.wordCount + 6);
  targetWords.sort((a, b) => b.word.length - a.word.length);

  let colorIdx = 0;
  for (const item of targetWords) {
    if (placed.length >= challenge.wordCount) break;
    const placement = tryPlaceWord(item.word, grid, allowedDirs, rng);
    if (placement) {
      placement.cells.forEach((coord, idx) => {
        grid[coord.row][coord.col] = item.word[idx];
      });
      placed.push({
        id: `chal-${item.word}-${placed.length}`,
        word: item.word,
        displayWord: item.word,
        category: themeCategory,
        definition: item.definition || `A challenge term in ${themeCategory.replace('_', ' ')}.`,
        example: item.example || `Discovered during the ${challenge.title}.`,
        start: placement.start,
        end: placement.end,
        direction: placement.direction,
        cells: placement.cells,
        color: WORD_HIGHLIGHT_COLORS[colorIdx % WORD_HIGHLIGHT_COLORS.length],
        found: false
      });
      colorIdx++;
    }
  }

  const letterPool = placed.map(p => p.word).join('') + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const finalGrid = grid.map(row =>
    row.map(cell => cell !== null ? cell : letterPool[rng.nextInt(0, letterPool.length - 1)])
  );

  return {
    levelNumber: 0,
    seed,
    worldId: 1,
    worldName: 'Challenge Arena',
    theme: `${challenge.icon} ${challenge.title.toUpperCase()}`,
    gridSize: challenge.gridSize,
    grid: finalGrid,
    words: placed,
    allowedDirections: allowedDirs,
    isChallenge: true,
    challengeId: challenge.id
  };
}
