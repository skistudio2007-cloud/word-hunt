import { ChallengeInfo } from '../types';

export const EXPEDITION_CHALLENGES: ChallengeInfo[] = [
  {
    id: 'challenge_ocean_abyss',
    title: 'Deep Ocean Expedition',
    subtitle: 'Abyssal Trench & Coral Reefs',
    theme: 'OCEAN',
    icon: '🌊',
    difficulty: 'Hard',
    gridSize: 8,
    wordCount: 8,
    rewardHints: 2,
    description: 'Find 8 deep-sea marine terms hidden in an 8x8 grid with diagonal and reverse placements.',
    expiresIn: 'Daily Reset'
  },
  {
    id: 'challenge_cosmic_riddle',
    title: 'Cosmic Nebula Mystery',
    subtitle: 'Interstellar Stellar Clusters',
    theme: 'SPACE',
    icon: '🚀',
    difficulty: 'Master',
    gridSize: 9,
    wordCount: 9,
    rewardHints: 3,
    description: 'Master a 9x9 cosmic puzzle featuring planets, constellations, and astrophysical phenomena.',
    expiresIn: 'Weekly Special'
  },
  {
    id: 'challenge_wild_savanna',
    title: 'Safari Wilderness Hunt',
    subtitle: 'Great Migration & Predators',
    theme: 'ANIMALS',
    icon: '🦁',
    difficulty: 'Medium',
    gridSize: 7,
    wordCount: 7,
    rewardHints: 2,
    description: 'Track 7 elusive wildlife species across an intricate 7x7 safari grid.',
    expiresIn: 'Active Now'
  },
  {
    id: 'challenge_culinary_delight',
    title: 'Gourmet World Feast',
    subtitle: 'Artisanal Flavors & Spices',
    theme: 'FOOD',
    icon: '🍕',
    difficulty: 'Medium',
    gridSize: 7,
    wordCount: 7,
    rewardHints: 2,
    description: 'Locate 7 delicious gourmet delicacies scattered in every direction.',
    expiresIn: 'Active Now'
  }
];

export function getActiveChallenge(): ChallengeInfo {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const idx = dayOfYear % EXPEDITION_CHALLENGES.length;
  return EXPEDITION_CHALLENGES[idx];
}
