import { Achievement } from '../types';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_level',
    titleKey: 'First Level',
    descKey: 'Complete your first word search puzzle.',
    icon: 'CheckCircle2',
    target: 1,
    current: 0,
    rewardHints: 1,
    unlocked: false,
    claimed: false
  },
  {
    id: 'levels_5',
    titleKey: '5 Levels Completed',
    descKey: 'Solve 5 word search levels.',
    icon: 'Sparkles',
    target: 5,
    current: 0,
    rewardHints: 2,
    unlocked: false,
    claimed: false
  },
  {
    id: 'levels_10',
    titleKey: '10 Levels Completed',
    descKey: 'Solve 10 word search levels.',
    icon: 'MapPin',
    target: 10,
    current: 0,
    rewardHints: 2,
    unlocked: false,
    claimed: false
  },
  {
    id: 'levels_25',
    titleKey: '25 Levels Completed',
    descKey: 'Solve 25 word search levels.',
    icon: 'Compass',
    target: 25,
    current: 0,
    rewardHints: 3,
    unlocked: false,
    claimed: false
  },
  {
    id: 'levels_50',
    titleKey: '50 Levels Completed',
    descKey: 'Solve 50 word search levels.',
    icon: 'Globe',
    target: 50,
    current: 0,
    rewardHints: 5,
    unlocked: false,
    claimed: false
  },
  {
    id: 'levels_100',
    titleKey: '100 Levels Completed',
    descKey: 'Complete 100 word search puzzles.',
    icon: 'Award',
    target: 100,
    current: 0,
    rewardHints: 10,
    unlocked: false,
    claimed: false
  },
  {
    id: 'levels_500',
    titleKey: '500 Levels Completed',
    descKey: 'Complete 500 word search puzzles.',
    icon: 'Crown',
    target: 500,
    current: 0,
    rewardHints: 20,
    unlocked: false,
    claimed: false
  },
  {
    id: 'levels_1000',
    titleKey: '1000 Levels Completed',
    descKey: 'Legendary milestone: 1,000 levels conquered!',
    icon: 'Trophy',
    target: 1000,
    current: 0,
    rewardHints: 50,
    unlocked: false,
    claimed: false
  },
  {
    id: 'perfect_level',
    titleKey: 'Perfect Level',
    descKey: 'Complete a level with 3 stars without using any hints.',
    icon: 'Star',
    target: 1,
    current: 0,
    rewardHints: 2,
    unlocked: false,
    claimed: false
  },
  {
    id: 'fast_solver',
    titleKey: 'Fast Solver',
    descKey: 'Solve any word puzzle in under 30 seconds.',
    icon: 'Zap',
    target: 1,
    current: 0,
    rewardHints: 3,
    unlocked: false,
    claimed: false
  },
  {
    id: 'word_master',
    titleKey: 'Word Master',
    descKey: 'Find a total of 250 hidden words.',
    icon: 'BookOpen',
    target: 250,
    current: 0,
    rewardHints: 5,
    unlocked: false,
    claimed: false
  },
  {
    id: 'long_streak',
    titleKey: 'Long Streak',
    descKey: 'Reach a 7-day daily gameplay streak.',
    icon: 'Flame',
    target: 7,
    current: 0,
    rewardHints: 5,
    unlocked: false,
    claimed: false
  },
  {
    id: 'hint_free',
    titleKey: 'Hint-Free Level',
    descKey: 'Complete 5 levels without asking for hints.',
    icon: 'Shield',
    target: 5,
    current: 0,
    rewardHints: 3,
    unlocked: false,
    claimed: false
  },
  {
    id: 'challenge_winner',
    titleKey: 'Challenge Winner',
    descKey: 'Conquer a special Expedition Challenge.',
    icon: 'Target',
    target: 1,
    current: 0,
    rewardHints: 4,
    unlocked: false,
    claimed: false
  },
  {
    id: 'vocab_master',
    titleKey: 'Vocabulary Master',
    descKey: 'Discover and review definitions for 50 distinct words.',
    icon: 'GraduationCap',
    target: 50,
    current: 0,
    rewardHints: 5,
    unlocked: false,
    claimed: false
  }
];
