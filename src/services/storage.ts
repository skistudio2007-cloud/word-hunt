import { UserProgress, UserSettings } from '../types';

const STORAGE_KEY_PROGRESS = 'wordhunt_user_progress_v2';
const STORAGE_KEY_SETTINGS = 'wordhunt_user_settings_v2';

export const DEFAULT_SETTINGS: UserSettings = {
  soundEnabled: true,
  soundVolume: 0.8,
  musicEnabled: true,
  musicVolume: 0.5,
  vibrationEnabled: true,
  darkMode: false,
  language: 'en',
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  notificationsEnabled: true
};

export const DEFAULT_PROGRESS: UserProgress = {
  currentLevel: 1,
  highestLevelUnlocked: 1,
  completedLevels: {},
  totalStars: 0,
  xp: 0,
  freeHintsUsed: 0,
  purchasedHints: 0,
  hintsRevealLetter: 0,
  hintsRevealWord: 0,
  hintsAutoSolve: 0,
  hasRemovedAds: false,
  stats: {
    puzzlesSolved: 0,
    wordsFound: 0,
    totalPlayTimeSeconds: 0,
    currentStreak: 1,
    bestStreak: 1,
    lastPlayDate: new Date().toISOString().split('T')[0],
    hintsUsed: 0,
    perfectLevels: 0,
    fastestSolveSeconds: 0,
    challengeWins: 0,
    consecutiveLevels: 0,
    bestConsecutiveLevels: 0
  },
  dailyHistory: {},
  claimedAchievements: [],
  unlockedAwards: [],
  completedChallenges: [],
  playerName: 'Word Hunter'
};

export class StorageService {
  public static loadSettings(): UserSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SETTINGS) || localStorage.getItem('wordhunt_user_settings_v1');
      if (data) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
    } catch (e) {
      console.warn('Failed to load settings from storage', e);
    }
    return { ...DEFAULT_SETTINGS };
  }

  public static saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings', e);
    }
  }

  public static loadProgress(): UserProgress {
    try {
      const data = localStorage.getItem(STORAGE_KEY_PROGRESS) || localStorage.getItem('wordhunt_user_progress_v1');
      if (data) {
        const parsed = JSON.parse(data);
        return {
          ...DEFAULT_PROGRESS,
          ...parsed,
          freeHintsUsed: typeof parsed.freeHintsUsed === 'number' ? parsed.freeHintsUsed : 0,
          purchasedHints: typeof parsed.purchasedHints === 'number' ? parsed.purchasedHints : (parsed.hintsRevealLetter || 0),
          stats: { ...DEFAULT_PROGRESS.stats, ...(parsed.stats || {}) },
          completedLevels: parsed.completedLevels || {},
          claimedAchievements: parsed.claimedAchievements || [],
          unlockedAwards: parsed.unlockedAwards || [],
          completedChallenges: parsed.completedChallenges || []
        };
      }
    } catch (e) {
      console.warn('Error loading progress from local storage', e);
    }
    return { ...DEFAULT_PROGRESS };
  }

  public static saveProgress(progress: UserProgress): void {
    try {
      const json = JSON.stringify(progress);
      localStorage.setItem(STORAGE_KEY_PROGRESS, json);
    } catch (e) {
      console.warn('Failed to persist progress', e);
    }
  }
}
