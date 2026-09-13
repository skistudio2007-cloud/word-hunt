import { WorldInfo } from '../types';

export const WORLDS: WorldInfo[] = [
  {
    id: 1,
    name: 'Green Valley',
    subtitle: 'Lush meadows & fresh breeze',
    startLevel: 1,
    endLevel: 50,
    themeCategories: ['ANIMALS', 'NATURE', 'GARDEN', 'FRUITS', 'COLORS_SHAPES'],
    gradient: 'from-emerald-500 via-teal-600 to-green-700',
    cardBg: 'bg-emerald-600/90 border-emerald-400',
    textColor: 'text-emerald-100',
    accentColor: '#10B981',
    bgDecorations: ['🌱', '🍃', '🌸', '🦋', '🌿'],
    icon: 'Trees',
    themeType: 'nature'
  },
  {
    id: 2,
    name: 'Sunny Beach',
    subtitle: 'Golden sands & turquoise waves',
    startLevel: 51,
    endLevel: 100,
    themeCategories: ['OCEAN', 'FRUITS', 'FOOD', 'SPORTS', 'WEATHER'],
    gradient: 'from-cyan-500 via-blue-500 to-teal-600',
    cardBg: 'bg-cyan-600/90 border-cyan-400',
    textColor: 'text-cyan-100',
    accentColor: '#06B6D4',
    bgDecorations: ['🏖️', '🐚', '🦀', '🌊', '☀️'],
    icon: 'Sun',
    themeType: 'ocean'
  },
  {
    id: 3,
    name: 'Mystic Forest',
    subtitle: 'Whispering pines & hidden wonders',
    startLevel: 101,
    endLevel: 150,
    themeCategories: ['NATURE', 'ANIMALS', 'CAMPING', 'EMOTIONS', 'MUSIC'],
    gradient: 'from-indigo-600 via-purple-700 to-slate-900',
    cardBg: 'bg-indigo-700/90 border-indigo-400',
    textColor: 'text-indigo-100',
    accentColor: '#8B5CF6',
    bgDecorations: ['🍄', '🦉', '✨', '🌲', '🌙'],
    icon: 'Sparkles',
    themeType: 'nature'
  },
  {
    id: 4,
    name: 'Desert Trail',
    subtitle: 'Ancient dunes & glowing canyons',
    startLevel: 151,
    endLevel: 200,
    themeCategories: ['GEOGRAPHY', 'HISTORY', 'WEATHER', 'COLORS_SHAPES'],
    gradient: 'from-amber-500 via-orange-600 to-red-700',
    cardBg: 'bg-amber-600/90 border-amber-400',
    textColor: 'text-amber-100',
    accentColor: '#F59E0B',
    bgDecorations: ['🏜️', '🐪', '🌵', '☀️', '🏺'],
    icon: 'Compass',
    themeType: 'desert'
  },
  {
    id: 5,
    name: 'Snow Mountains',
    subtitle: 'Crisp heights & crystalline peaks',
    startLevel: 201,
    endLevel: 250,
    themeCategories: ['WEATHER', 'NATURE', 'SPORTS', 'PHYSICS'],
    gradient: 'from-sky-400 via-indigo-500 to-slate-800',
    cardBg: 'bg-sky-600/90 border-sky-300',
    textColor: 'text-sky-100',
    accentColor: '#38BDF8',
    bgDecorations: ['❄️', '🏔️', '⛷️', '⛄', '🌲'],
    icon: 'Mountain',
    themeType: 'snow'
  },
  {
    id: 6,
    name: 'Space Station',
    subtitle: 'Orbiting starlight & cosmic frontier',
    startLevel: 251,
    endLevel: 300,
    themeCategories: ['SPACE', 'ASTRONOMY', 'SCIENCE', 'TECHNOLOGY'],
    gradient: 'from-violet-800 via-purple-900 to-slate-950',
    cardBg: 'bg-purple-800/90 border-purple-400',
    textColor: 'text-purple-100',
    accentColor: '#A855F7',
    bgDecorations: ['🚀', '🪐', '🛸', '⭐', '🌌'],
    icon: 'Rocket',
    themeType: 'space'
  },
  {
    id: 7,
    name: 'Underwater City',
    subtitle: 'Deep abyss bioluminescence',
    startLevel: 301,
    endLevel: 350,
    themeCategories: ['OCEAN', 'SCIENCE', 'ANIMALS', 'NATURE'],
    gradient: 'from-blue-600 via-cyan-700 to-teal-900',
    cardBg: 'bg-blue-700/90 border-blue-400',
    textColor: 'text-blue-100',
    accentColor: '#3B82F6',
    bgDecorations: ['🐬', '🪸', '🦑', '🫧', '🔱'],
    icon: 'Waves',
    themeType: 'ocean'
  },
  {
    id: 8,
    name: 'Ancient Ruins',
    subtitle: 'Lost temples & forgotten wisdom',
    startLevel: 351,
    endLevel: 400,
    themeCategories: ['HISTORY', 'GEOGRAPHY', 'ART', 'HUMAN_BODY'],
    gradient: 'from-yellow-600 via-amber-700 to-stone-900',
    cardBg: 'bg-amber-700/90 border-amber-400',
    textColor: 'text-amber-100',
    accentColor: '#D97706',
    bgDecorations: ['🏛️', '📜', '🗿', '🗝️', '💎'],
    icon: 'Landmark',
    themeType: 'ancient'
  },
  {
    id: 9,
    name: 'Tropical Island',
    subtitle: 'Exotic flora & warm coral lagoons',
    startLevel: 401,
    endLevel: 450,
    themeCategories: ['FRUITS', 'OCEAN', 'TRAVEL', 'NATURE'],
    gradient: 'from-teal-500 via-emerald-600 to-green-800',
    cardBg: 'bg-teal-600/90 border-teal-300',
    textColor: 'text-teal-100',
    accentColor: '#14B8A6',
    bgDecorations: ['🌺', '🦜', '🥥', '🏝️', '🍹'],
    icon: 'Palmtree',
    themeType: 'food'
  },
  {
    id: 10,
    name: 'Future City',
    subtitle: 'Neon spires & intelligent highways',
    startLevel: 451,
    endLevel: 500,
    themeCategories: ['TECHNOLOGY', 'SCIENCE', 'PHYSICS', 'CHEMISTRY'],
    gradient: 'from-fuchsia-600 via-purple-700 to-indigo-900',
    cardBg: 'bg-fuchsia-700/90 border-fuchsia-400',
    textColor: 'text-fuchsia-100',
    accentColor: '#D946EF',
    bgDecorations: ['⚡', '🤖', '🛰️', '🏙️', '🧬'],
    icon: 'Cpu',
    themeType: 'space'
  },
  {
    id: 11,
    name: 'Crystal Caverns',
    subtitle: 'Glimmering geodes & subterranean depths',
    startLevel: 501,
    endLevel: 600,
    themeCategories: ['CHEMISTRY', 'PHYSICS', 'NATURE', 'COLORS_SHAPES'],
    gradient: 'from-pink-500 via-rose-600 to-purple-800',
    cardBg: 'bg-pink-600/90 border-pink-400',
    textColor: 'text-pink-100',
    accentColor: '#EC4899',
    bgDecorations: ['🔮', '💎', '💠', '✨', '⛏️'],
    icon: 'Gem',
    themeType: 'ancient'
  },
  {
    id: 12,
    name: 'Aurora Kingdom',
    subtitle: 'Shimmering polar lights & eternal glaciers',
    startLevel: 601,
    endLevel: 10000,
    themeCategories: ['ASTRONOMY', 'SPACE', 'WEATHER', 'SCIENCE', 'GEOGRAPHY'],
    gradient: 'from-emerald-500 via-teal-600 to-indigo-900',
    cardBg: 'bg-emerald-600/90 border-emerald-400',
    textColor: 'text-emerald-100',
    accentColor: '#10B981',
    bgDecorations: ['🌌', '❄️', '👑', '🌠', '✨'],
    icon: 'Crown',
    themeType: 'snow'
  }
];

export function getWorldForLevel(levelNumber: number): WorldInfo {
  for (const world of WORLDS) {
    if (levelNumber >= world.startLevel && levelNumber <= world.endLevel) {
      return world;
    }
  }
  return WORLDS[WORLDS.length - 1];
}
