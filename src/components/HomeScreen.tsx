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
        {/* Floating App Icon with Calm Ambient Glow */}
        <motion.div 
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
          className="relative flex flex-col items-center"
        >
          <div className="relative">
            <img
              src="/app-icon.png"
              alt="Word Hunt Icon"
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl shadow-2xl shadow-blue-500/25 border-2 border-white/95 object-cover"
            />
            {/* Soft ambient aura */}
            <div className="absolute -inset-2 bg-gradient-to-tr from-blue-500/20 via-indigo-500/20 to-teal-400/20 rounded-3xl blur-xl -z-10" />
          </div>
        </motion.div>

        {/* Word Hunt Typography */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black tracking-wider text-slate-900 leading-none">
            WORD HUNT
          </h1>
          <p className="text-xs sm:text-sm font-bold tracking-widest text-slate-500 uppercase">
            Word Search Adventure
          </p>
        </div>

        {/* Current Theme World & Level Badge */}
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/90 backdrop-blur-xs border border-slate-200/90 shadow-xs">
          <span className="text-base">{world.bgDecorations[0] || '🌿'}</span>
          <span className="text-xs font-black text-slate-800 tracking-wider uppercase">
            {world.name}
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-xs font-extrabold text-blue-600 tracking-wide">
            {levelText} {currentLevel}
          </span>
        </div>
      </div>

      {/* 2. Lower Action Section: Play Button placed at bottom */}
      <div className="w-full max-w-xs flex flex-col items-center gap-3 relative z-10 mt-auto pt-4 pb-2">
        <motion.button
          id="btn-main-play"
          animate={{ scale: [1, 1.025, 1] }}
          transition={{ 
            scale: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }
          }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.94 }}
          onClick={handlePlayClick}
          className="w-full py-5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:from-blue-800 active:to-indigo-800 text-white font-black text-xl shadow-xl shadow-blue-500/35 flex items-center justify-center gap-3 cursor-pointer border border-blue-400/50 relative overflow-hidden select-none transition-shadow"
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
