import { AwardMilestone } from '../types';

export const AWARDS_DATA: AwardMilestone[] = [
  {
    id: 'award_beginner',
    title: 'Beginner',
    requirement: 'Reach Level 5',
    icon: '🌱',
    target: 5,
    metric: 'level',
    description: 'Began your journey into hidden word discovery.'
  },
  {
    id: 'award_explorer',
    title: 'Explorer',
    requirement: 'Reach Level 25',
    icon: '🧭',
    target: 25,
    metric: 'level',
    description: 'Traversed through diverse thematic landscapes.'
  },
  {
    id: 'award_word_finder',
    title: 'Word Finder',
    requirement: 'Find 50 words',
    icon: '🔍',
    target: 50,
    metric: 'words',
    description: 'Spotted 50 hidden words across puzzles.'
  },
  {
    id: 'award_word_master',
    title: 'Word Master',
    requirement: 'Reach Level 100',
    icon: '📚',
    target: 100,
    metric: 'level',
    description: 'Demonstrated superior pattern recognition and vocabulary.'
  },
  {
    id: 'award_puzzle_master',
    title: 'Puzzle Master',
    requirement: 'Reach Level 250',
    icon: '⭐',
    target: 250,
    metric: 'level',
    description: 'Conquered intricate word matrices and reverse diagonals.'
  },
  {
    id: 'award_grand_master',
    title: 'Grand Master',
    requirement: 'Reach Level 500',
    icon: '👑',
    target: 500,
    metric: 'level',
    description: 'Achieved the pinnacle of word-hunting supremacy.'
  },
  {
    id: 'award_streak_champion',
    title: 'Streak Champion',
    requirement: 'Maintain 7-day streak',
    icon: '🔥',
    target: 7,
    metric: 'streak',
    description: 'Dedicated daily mind exercise for 7 consecutive days.'
  },
  {
    id: 'award_perfectionist',
    title: 'Perfectionist',
    requirement: 'Complete 25 Perfect Levels',
    icon: '💎',
    target: 25,
    metric: 'perfect',
    description: 'Earned 3 stars on 25 levels without using any hints.'
  }
];
