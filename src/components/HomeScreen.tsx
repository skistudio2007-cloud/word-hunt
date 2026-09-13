import React from 'react';
import { motion } from 'motion/react';
import { Play } from 'lucide-react';
import { soundManager } from '../services/sound';
import { LanguageCode } from '../types';
import { getTranslation } from '../services/localization';
import { getWorldForLevel } from '../data/worlds';
import { AnimatedThemeBackground } from './AnimatedThemeBackground';

interface Props {
  currentLevel: number;
  language?: LanguageCode;
  onPlay: () => void;
}

export const HomeScreen: React.FC<Props> = ({ currentLevel, language = 'en', onPlay }) => {
  const handlePlayClick = () => {
    soundManager.playTap();
    onPlay();
  };

  const playText = getTranslation(language, 'play') || 'PLAY';
  const levelText = getTranslation(language, 'level') || 'Level';
  const world = getWorldForLevel(currentLevel);

  return (
    <div className="w-full min-h-[calc(100vh-70px)] bg-white flex flex-col items-center justify-between px-6 py-10 select-none relative overflow-hidden">
      {/* 0. Theme-based Animated Background */}
      <AnimatedThemeBackground 
        world={world} 
        levelNumber={currentLevel} 
        variant="home" 
      />
      {/* 1. Upper-Center: Original Game Logo */}
      <div className="flex-1 flex flex-col items-center justify-center pt-6 relative z-10">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: -10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center text-center space-y-4"
        >
          {/* App Icon Badge with gentle floating animation */}
          <motion.div 
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="relative"
          >
            <img
              src="/app-icon.png"
              alt="Word Hunt Icon"
              className="w-24 h-24 rounded-3xl shadow-2xl shadow-indigo-500/30 border-2 border-white/90 object-cover"
            />
            {/* Subtle glow accent */}
            <div className="absolute -inset-1 bg-indigo-500/20 rounded-3xl blur-md -z-10" />
          </motion.div>

          {/* Word Hunt Typography */}
          <div>
            <h1 className="text-3xl font-black tracking-wider text-slate-900 leading-none">
              WORD HUNT
            </h1>
            <p className="text-xs font-bold tracking-widest text-slate-500 uppercase mt-1.5">
              Word Search Adventure
            </p>
          </div>
        </motion.div>
      </div>

      {/* 2. Main Content: Centered Blue Play Button & Theme Level Indicator */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-xs space-y-4 pb-8 relative z-10">
        <motion.button
          id="btn-main-play"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          onClick={handlePlayClick}
          className="w-full py-5 rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-xl shadow-xl shadow-blue-600/30 flex items-center justify-center gap-3 transition-colors cursor-pointer border border-blue-400/50"
        >
          <Play className="w-6 h-6 fill-white text-white translate-x-0.5" />
          <span>{playText}</span>
        </motion.button>

        {/* Current Theme World & Level Badge */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/85 backdrop-blur-xs border border-slate-200/80 shadow-2xs">
          <span className="text-sm">{world.bgDecorations[0] || '🌿'}</span>
          <span className="text-xs font-black text-slate-800 tracking-wide uppercase">
            {world.name}
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-xs font-bold text-slate-500">
            {levelText} {currentLevel}
          </span>
        </div>
      </div>

      {/* Spacer to keep optical balance with bottom nav */}
      <div className="h-6" />
    </div>
  );
};
