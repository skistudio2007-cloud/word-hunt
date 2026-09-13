export type NavigationTab = 'HOME' | 'COLLECTION' | 'CHALLENGE' | 'SETTINGS';

export type GameState =
  | 'MAIN_MENU'
  | 'PLAYING'
  | 'CHALLENGE_PLAYING'
  | 'PAUSED'
  | 'LEVEL_COMPLETE';

export interface CollectionItem {
  id: string;
  title: string;
  category: string;
  type: 'postcard' | 'badge' | 'medal';
  unlockedAtLevel: number;
  isUnlocked: boolean;
  description: string;
  icon: string;
}

export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'id' | 'ja' | 'ko' | 'hi';

export type Direction =
  | 'RIGHT'
  | 'LEFT'
  | 'DOWN'
  | 'UP'
  | 'DOWN_RIGHT'
  | 'DOWN_LEFT'
  | 'UP_RIGHT'
  | 'UP_LEFT';

export interface Coordinate {
  row: number;
  col: number;
}

export interface PlacedWord {
  id: string;
  word: string;
  displayWord: string;
  category: string;
  definition?: string;
  example?: string;
  start: Coordinate;
  end: Coordinate;
  direction: Direction;
  cells: Coordinate[];
  color: string;
  found: boolean;
}

export interface PuzzleData {
  levelNumber: number;
  seed: number;
  worldId: number;
  worldName: string;
  theme: string;
  gridSize: number;
  grid: string[][];
  words: PlacedWord[];
  allowedDirections: Direction[];
  isDaily?: boolean;
  isChallenge?: boolean;
  challengeId?: string;
  dateKey?: string;
}

export interface WorldInfo {
  id: number;
  name: string;
  subtitle: string;
  startLevel: number;
  endLevel: number;
  themeCategories: string[];
  gradient: string;
  cardBg: string;
  textColor: string;
  accentColor: string;
  bgDecorations: string[];
  icon: string;
  themeType: 'ocean' | 'space' | 'food' | 'animals' | 'nature' | 'snow' | 'desert' | 'ancient';
}

export interface UserStats {
  puzzlesSolved: number;
  wordsFound: number;
  totalPlayTimeSeconds: number;
  currentStreak: number;
  bestStreak: number;
  lastPlayDate?: string;
  hintsUsed: number;
  perfectLevels: number;
  fastestSolveSeconds: number;
  challengeWins: number;
  consecutiveLevels: number;
  bestConsecutiveLevels: number;
}

export interface Achievement {
  id: string;
  titleKey: string;
  descKey: string;
  icon: string;
  target: number;
  current: number;
  rewardHints: number;
  unlocked: boolean;
  claimed: boolean;
  dateEarned?: string;
}

export interface AwardMilestone {
  id: string;
  title: string;
  requirement: string;
  icon: string;
  target: number;
  metric: 'level' | 'words' | 'streak' | 'perfect' | 'challenges';
  description: string;
}

export interface ChallengeInfo {
  id: string;
  title: string;
  subtitle: string;
  theme: string;
  icon: string;
  difficulty: 'Medium' | 'Hard' | 'Master';
  gridSize: number;
  wordCount: number;
  rewardHints: number;
  description: string;
  expiresIn?: string;
}

export interface UserSettings {
  soundEnabled: boolean;
  soundVolume: number;
  musicEnabled: boolean;
  musicVolume: number;
  vibrationEnabled: boolean;
  darkMode: boolean;
  language: LanguageCode;
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  notificationsEnabled: boolean;
}

export interface UserProgress {
  currentLevel: number;
  highestLevelUnlocked: number;
  completedLevels: Record<number, { stars: number; timeSeconds: number; date: string }>;
  totalStars: number;
  xp: number;
  freeHintsUsed: number;
  purchasedHints: number;
  hintsRevealLetter: number;
  hintsRevealWord: number;
  hintsAutoSolve: number;
  hasRemovedAds: boolean;
  stats: UserStats;
  dailyHistory: Record<string, { completed: boolean; stars: number; bestTime?: number }>;
  claimedAchievements: string[];
  unlockedAwards: string[];
  completedChallenges: string[];
  playerName: string;
}
