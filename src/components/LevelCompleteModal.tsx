import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Star, Check, ArrowRight } from 'lucide-react';
import { soundManager } from '../services/sound';
import { LanguageCode } from '../types';
import { getTranslation } from '../services/localization';

interface Props {
  starsAwarded?: number;
  language?: LanguageCode;
  onNextLevel: () => void;
}

export const LevelCompleteModal: React.FC<Props> = ({
  starsAwarded = 3,
  language = 'en',
  onNextLevel
}) => {
  const [activeStars, setActiveStars] = useState(0);

  const levelCompleteText = getTranslation(language, 'levelComplete') || 'LEVEL COMPLETE';
  const nextText = getTranslation(language, 'nextLevel') || 'NEXT';

  useEffect(() => {
    // Multi-stage celebration confetti particle cannons
    try {
      // 1. Center victory burst when modal pops open
      confetti({
        particleCount: 75,
        spread: 75,
        origin: { x: 0.5, y: 0.55 },
        zIndex: 999,
        colors: ['#2563EB', '#38BDF8', '#F59E0B', '#10B981', '#EC4899', '#8B5CF6', '#FBBF24']
      });
    } catch {}

    // 2. Dual side cannons cross-fire across the screen
    const tCannons = setTimeout(() => {
      try {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 60,
          origin: { x: 0.08, y: 0.78 },
          zIndex: 999,
          colors: ['#F59E0B', '#FBBF24', '#2563EB', '#10B981', '#EC4899']
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 60,
          origin: { x: 0.92, y: 0.78 },
          zIndex: 999,
          colors: ['#F59E0B', '#FBBF24', '#2563EB', '#10B981', '#EC4899']
        });
      } catch {}
    }, 220);

    // 3. Gold sparkle burst shower on final star pop
    const tSparkles = setTimeout(() => {
      try {
        confetti({
          particleCount: 45,
          spread: 90,
          origin: { x: 0.5, y: 0.42 },
          scalar: 1.15,
          zIndex: 999,
          colors: ['#F59E0B', '#FCD34D', '#FFFFFF', '#60A5FA', '#34D399']
        });
      } catch {}
    }, 840);

    // Sequentially trigger star pop animation
    const t1 = setTimeout(() => {
      setActiveStars(1);
      soundManager.playStarPop(0);
    }, 280);

    const t2 = setTimeout(() => {
      if (starsAwarded >= 2) {
        setActiveStars(2);
        soundManager.playStarPop(1);
      }
    }, 550);

    const t3 = setTimeout(() => {
      if (starsAwarded >= 3) {
        setActiveStars(3);
        soundManager.playStarPop(2);
      }
    }, 820);

    return () => {
      clearTimeout(tCannons);
      clearTimeout(tSparkles);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [starsAwarded]);

  return (
    <motion.div 
      id="level-complete-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-6 select-none"
    >
      <motion.div
        id="level-complete-card"
        initial={{ scale: 0.86, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0, y: 12 }}
        transition={{ type: 'spring', damping: 24, stiffness: 350 }}
        className="w-full max-w-xs bg-white rounded-3xl p-8 shadow-2xl text-slate-900 text-center relative flex flex-col items-center space-y-6 border border-slate-100 overflow-visible"
      >
        {/* 1. Winning Icon / Checkmark Animation */}
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 16, stiffness: 300 }}
          className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border-2 border-emerald-200 shadow-sm"
        >
          <Check className="w-9 h-9 stroke-[3]" />
        </motion.div>

        {/* 2. Simple LEVEL COMPLETE Text */}
        <motion.h2 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.2 }}
          className="text-2xl font-black tracking-tight text-slate-900 uppercase"
        >
          {levelCompleteText}
        </motion.h2>

        {/* 3. Star Animation (Pop 1 by 1 with bounce and glow) */}
        <div className="flex items-center justify-center gap-3 py-1">
          {[1, 2, 3].map(starIndex => {
            const isPopped = activeStars >= starIndex;
            const isFilled = starsAwarded >= starIndex;

            return (
              <div 
                key={`star-${starIndex}`}
                className="relative flex items-center justify-center w-14 h-14"
              >
                {/* Base soft star container */}
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200/80">
                  <Star className="w-6 h-6 text-slate-300 fill-slate-200" />
                </div>

                {/* Popped Gold Star */}
                {isPopped && isFilled && (
                  <motion.div
                    initial={{ scale: 0, rotate: -25 }}
                    animate={{ scale: [0, 1.35, 1], rotate: 0 }}
                    transition={{ type: 'spring', damping: 14, stiffness: 450 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 border-2 border-amber-400 flex items-center justify-center shadow-lg shadow-amber-400/30">
                      <Star className="w-6 h-6 fill-amber-400 text-amber-500" />
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        {/* 4. Large Blue Rounded NEXT Button */}
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.85, duration: 0.25 }}
          className="w-full pt-2"
        >
          <motion.button
            id="btn-next-level"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              soundManager.playTap();
              onNextLevel();
            }}
            className="w-full py-4 px-6 rounded-full font-black text-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <span>{nextText}</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
