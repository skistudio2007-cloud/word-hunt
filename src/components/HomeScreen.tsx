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
    <div className="w-full min-h-[calc(100vh-70px)] flex flex-col items-center justify-between px-6 pt-6 sm:pt-10 pb-24 select-none relative overflow-hidden">
      {/* 0. Theme-based Ambient Animated Background */}
      <AnimatedThemeBackground 
        world={world} 
        levelNumber={currentLevel} 
        variant="home" 
      />

      {/* 1. Upper-Center Hero Section: App Icon + Title + Theme Level Badge */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-xs space-y-6 my-auto">
        {/* Floating App Icon with Bouncy Float & Tactile Tap */}
        <motion.div 
          animate={{ y: [0, -10, 0], rotate: [0, -1.5, 1.5, 0] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
          whileHover={{ scale: 1.05, rotate: 1 }}
          whileTap={{ scale: 0.88, rotate: -3 }}
          className="relative flex flex-col items-center cursor-pointer select-none"
        >
          <div className="relative">
            <img
              src="/app-icon.png"
              alt="Word Hunt Icon"
              className="w-32 h-32 sm:w-36 sm:h-36 rounded-3xl shadow-2xl shadow-emerald-600/25 object-contain drop-shadow-xl"
            />
            {/* Soft ambient aura */}
            <div className="absolute -inset-2 bg-gradient-to-tr from-emerald-500/25 via-blue-500/20 to-amber-400/20 rounded-3xl blur-xl -z-10" />
          </div>
        </motion.div>

        {/* Word Hunt Typography */}
        <motion.div 
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 380, damping: 22 }}
          className="text-center space-y-1"
        >
          <h1 className="text-3xl sm:text-4xl font-black tracking-wider text-slate-900 leading-none">
            WORD HUNT
          </h1>
          <p className="text-xs sm:text-sm font-bold tracking-widest text-slate-500 uppercase">
            Word Search Adventure
          </p>
        </motion.div>

        {/* Current Theme World & Level Badge */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 420, damping: 20, delay: 0.1 }}
          whileTap={{ scale: 0.92 }}
          className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/90 backdrop-blur-xs border border-slate-200/90 shadow-xs cursor-pointer"
        >
          <span className="text-base">{world.bgDecorations[0] || '🌿'}</span>
          <span className="text-xs font-black text-slate-800 tracking-wider uppercase">
            {world.name}
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-xs font-extrabold text-blue-600 tracking-wide">
            {levelText} {currentLevel}
          </span>
        </motion.div>
      </div>

      {/* 2. Lower Action Section: Play Button placed at bottom */}
      <div className="w-full max-w-xs flex flex-col items-center gap-3 relative z-10 mt-auto pt-4 pb-2">
        <motion.button
          id="btn-main-play"
          animate={{ scale: [1, 1.05, 0.97, 1.03, 1] }}
          transition={{ 
            scale: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.88 }}
          onClick={handlePlayClick}
          className="btn-bouncy w-full py-5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:from-blue-800 active:to-indigo-800 text-white font-black text-xl shadow-xl shadow-blue-500/35 flex items-center justify-center gap-3 cursor-pointer border border-blue-400/50 relative overflow-hidden select-none transition-shadow"
        >
          <Play className="w-6 h-6 fill-white text-white translate-x-0.5 drop-shadow-xs" />
          <span className="tracking-wide text-xl uppercase font-black">{playText}</span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-white/20 font-bold border border-white/30 text-white shadow-xs">
            {levelText} {currentLevel}
          </span>
        </motion.button>
      </div>
    </div>
  );
};
