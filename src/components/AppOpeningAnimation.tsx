import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { soundManager } from '../services/sound';

interface Props {
  onComplete: () => void;
}

const WORD1 = ['W', 'O', 'R', 'D'];
const WORD2 = ['H', 'U', 'N', 'T'];

const TILE_COLORS_1 = [
  'from-amber-400 to-amber-500 text-amber-950 border-amber-300 shadow-amber-500/30',
  'from-emerald-400 to-emerald-500 text-emerald-950 border-emerald-300 shadow-emerald-500/30',
  'from-sky-400 to-sky-500 text-sky-950 border-sky-300 shadow-sky-500/30',
  'from-indigo-400 to-indigo-500 text-white border-indigo-300 shadow-indigo-500/30',
];

const TILE_COLORS_2 = [
  'from-violet-400 to-violet-500 text-white border-violet-300 shadow-violet-500/30',
  'from-rose-400 to-rose-500 text-white border-rose-300 shadow-rose-500/30',
  'from-teal-400 to-teal-500 text-teal-950 border-teal-300 shadow-teal-500/30',
  'from-yellow-400 to-amber-500 text-amber-950 border-yellow-300 shadow-yellow-500/30',
];

export const AppOpeningAnimation: React.FC<Props> = ({ onComplete }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Play subtle chime on start
    try {
      soundManager.playHintSparkle();
    } catch {}

    const timer = setTimeout(() => {
      setIsExiting(true);
    }, 1800);

    const endTimer = setTimeout(() => {
      onComplete();
    }, 2200);

    return () => {
      clearTimeout(timer);
      clearTimeout(endTimer);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setIsExiting(true);
    setTimeout(onComplete, 250);
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          key="app-opening-splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          onClick={handleSkip}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white select-none overflow-hidden cursor-pointer"
        >
          {/* Animated Background Ambient Auras */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
              animate={{
                scale: [1, 1.25, 1],
                opacity: [0.25, 0.45, 0.25],
                rotate: [0, 90, 180],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-tr from-indigo-600/30 to-purple-500/30 blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.4, 0.2],
                rotate: [180, 270, 360],
              }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-rose-500/25 to-amber-500/25 blur-3xl"
            />
            <motion.div
              animate={{ scale: [0.85, 1.15, 0.85], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-indigo-500/20 blur-2xl"
            />
          </div>

          {/* Center Content */}
          <div className="relative z-10 flex flex-col items-center justify-center px-6">
            {/* App Icon with Spring Pop */}
            <motion.div
              initial={{ scale: 0.4, opacity: 0, y: -25 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{
                type: 'spring',
                stiffness: 340,
                damping: 22,
                delay: 0.1,
              }}
              className="relative mb-6"
            >
              <div className="relative">
                <img
                  src="/app-icon.png"
                  alt="Word Hunt Icon"
                  className="w-24 h-24 rounded-3xl shadow-2xl shadow-indigo-500/50 border-2 border-white/30 object-cover"
                />
                <motion.div
                  animate={{ scale: [1, 1.18, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                  className="absolute -inset-1 rounded-3xl border-2 border-indigo-400/60 pointer-events-none"
                />
              </div>
            </motion.div>

            {/* Cascading 3D Letter Tiles: WORD */}
            <div className="flex items-center gap-2 mb-2">
              {WORD1.map((letter, idx) => (
                <motion.div
                  key={`word1-${idx}`}
                  initial={{ opacity: 0, y: -45, rotateX: 60, scale: 0.5 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 420,
                    damping: 20,
                    delay: 0.25 + idx * 0.08,
                  }}
                  className={`w-11 h-12 rounded-2xl bg-gradient-to-b ${TILE_COLORS_1[idx]} border-b-4 flex items-center justify-center text-xl font-black shadow-lg`}
                >
                  {letter}
                </motion.div>
              ))}
            </div>

            {/* Cascading 3D Letter Tiles: HUNT */}
            <div className="flex items-center gap-2 mb-6">
              {WORD2.map((letter, idx) => (
                <motion.div
                  key={`word2-${idx}`}
                  initial={{ opacity: 0, y: 45, rotateX: -60, scale: 0.5 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 420,
                    damping: 20,
                    delay: 0.55 + idx * 0.08,
                  }}
                  className={`w-11 h-12 rounded-2xl bg-gradient-to-b ${TILE_COLORS_2[idx]} border-b-4 flex items-center justify-center text-xl font-black shadow-lg`}
                >
                  {letter}
                </motion.div>
              ))}
            </div>

            {/* Subtitle & Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.4 }}
              className="flex items-center gap-2 text-indigo-200/90 text-xs font-extrabold tracking-[0.28em] uppercase"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
              <span>Word Search Adventure</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
            </motion.div>

            {/* Loading Bar */}
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 140 }}
              transition={{ delay: 0.95, duration: 0.8, ease: 'easeInOut' }}
              className="h-1 bg-gradient-to-r from-amber-400 via-emerald-400 to-indigo-400 rounded-full mt-6 shadow-sm shadow-indigo-400/50"
            />
          </div>

          {/* Tap to Skip Prompt */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 1.2, duration: 0.3 }}
            className="absolute bottom-6 text-[10px] uppercase font-bold tracking-widest text-slate-400"
          >
            Tap anywhere to start
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
