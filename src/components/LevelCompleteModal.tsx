import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Star, ArrowRight, Sparkles, Trophy } from 'lucide-react';
import { soundManager } from '../services/sound';
import { LanguageCode } from '../types';
import { getTranslation } from '../services/localization';

interface Props {
  starsAwarded?: number;
  language?: LanguageCode;
  onNextLevel: () => void;
}

interface ConfettiPiece {
  id: number;
  tx: number;
  ty: number;
  tr: number;
  color: string;
  delay: number;
  duration: number;
  width: number;
  height: number;
  borderRadius: string;
}

const CELEBRATION_COLORS = [
  '#2563EB', '#38BDF8', '#F59E0B', '#10B981', '#EC4899', '#8B5CF6', '#FBBF24', '#06B6D4'
];

export const LevelCompleteModal: React.FC<Props> = ({
  starsAwarded = 3,
  language = 'en',
  onNextLevel
}) => {
  const [activeStars, setActiveStars] = useState(0);

  const levelCompleteText = getTranslation(language, 'levelComplete') || 'LEVEL COMPLETED!';
  const nextText = getTranslation(language, 'nextLevel') || 'NEXT LEVEL';

  // Lightweight festive confetti burst on GPU (16 pieces, no heavy box-shadow repaints)
  const confetti = useMemo<ConfettiPiece[]>(() => {
    const list: ConfettiPiece[] = [];
    const count = 16;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 2 * Math.PI;
      const distance = 100 + (i % 4) * 25;
      const isRibbon = i % 2 === 0;
      list.push({
        id: i,
        tx: Math.round(Math.cos(angle) * distance),
        ty: Math.round(Math.sin(angle) * distance + 60),
        tr: (i * 65 + 180) % 720,
        color: CELEBRATION_COLORS[i % CELEBRATION_COLORS.length],
        delay: (i % 6) * 0.05,
        duration: 1.6 + (i % 3) * 0.2,
        width: isRibbon ? 5 : 8,
        height: isRibbon ? 12 : 8,
        borderRadius: isRibbon ? '2px' : '9999px'
      });
    }
    return list;
  }, []);

  useEffect(() => {
    // Sequentially trigger star pop animation with cheerful audio
    const t1 = setTimeout(() => {
      setActiveStars(1);
      soundManager.playStarPop(0);
    }, 280);

    const t2 = setTimeout(() => {
      if (starsAwarded >= 2) {
        setActiveStars(2);
        soundManager.playStarPop(1);
      }
    }, 520);

    const t3 = setTimeout(() => {
      if (starsAwarded >= 3) {
        setActiveStars(3);
        soundManager.playStarPop(2);
      }
    }, 760);

    return () => {
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
      className="fixed inset-0 z-50 bg-slate-950/75 flex items-center justify-center p-3 sm:p-4 select-none overflow-hidden"
    >
      {/* 1. Golden Celebration Ambient Aura (Zero CPU Raster Overhead) */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-gradient-to-r from-amber-400/20 via-yellow-300/25 to-amber-500/20 blur-2xl pointer-events-none select-none z-0"
        style={{ willChange: 'opacity, transform', transform: 'translateZ(0)' }}
      />

      {/* 2. Confetti Streamers (Hardware-accelerated CSS keyframe transform) */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0">
        {confetti.map((c) => (
          <div
            key={`confetti-${c.id}`}
            style={{
              position: 'absolute',
              width: `${c.width}px`,
              height: `${c.height}px`,
              borderRadius: c.borderRadius,
              backgroundColor: c.color,
              animation: `confettiFlutter ${c.duration}s cubic-bezier(0.22, 1, 0.36, 1) infinite`,
              animationDelay: `${c.delay}s`,
              willChange: 'transform, opacity',
              transform: 'translateZ(0)',
              ['--tx' as string]: `${c.tx}px`,
              ['--ty' as string]: `${c.ty}px`,
              ['--tr' as string]: `${c.tr}deg`
            }}
          />
        ))}
      </div>

      {/* 3. Victory Card - Proportional on all screen sizes & aspect ratios */}
      <motion.div
        id="level-complete-card"
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 10 }}
        transition={{ type: 'spring', damping: 24, stiffness: 360 }}
        className="w-full max-w-[min(90vw,340px)] max-h-[88dvh] bg-white rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-900 text-center relative z-10 flex flex-col items-center space-y-3 sm:space-y-4 border border-amber-200/60 overflow-visible"
        style={{ willChange: 'transform, opacity', transform: 'translateZ(0)' }}
      >
        {/* Floating Trophy & Crown Badge */}
        <div className="relative -mt-10 sm:-mt-12">
          {/* Subtle Golden Glow */}
          <div className="absolute inset-0 rounded-full bg-amber-400/40 blur-md scale-110 pointer-events-none" />
          
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 16, stiffness: 380, delay: 0.08 }}
            className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-white flex items-center justify-center border-4 border-white shadow-xl shadow-amber-500/30"
          >
            <Trophy className="w-10 h-10 sm:w-11 sm:h-11 text-amber-950/85 drop-shadow-sm" />
          </motion.div>

          {/* Sparkles Badge */}
          <div className="absolute -top-2 -right-2 text-amber-400 pointer-events-none">
            <Sparkles className="w-6 h-6 fill-amber-300 drop-shadow-xs" />
          </div>
        </div>

        {/* Victory Title & Ribbon */}
        <div className="space-y-0.5">
          <motion.h2 
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.2 }}
            className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 uppercase"
          >
            {levelCompleteText}
          </motion.h2>
          <p className="text-[11px] font-bold text-amber-600 uppercase tracking-widest">
            ⭐ Outstanding Performance ⭐
          </p>
        </div>

        {/* 3 Stars with Juicy Pop */}
        <div className="flex items-center justify-center gap-2.5 sm:gap-3 py-0.5">
          {[1, 2, 3].map(starIndex => {
            const isPopped = activeStars >= starIndex;
            const isFilled = starsAwarded >= starIndex;

            return (
              <div 
                key={`star-${starIndex}`}
                className="relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14"
              >
                {/* Base Star Slot */}
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 text-slate-300 fill-slate-200" />
                </div>

                {/* Popped Gold Star */}
                {isPopped && isFilled && (
                  <motion.div
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: [0, 1.25, 1], rotate: 0 }}
                    transition={{ type: 'spring', damping: 14, stiffness: 480 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-b from-amber-300 to-amber-500 border-2 border-amber-300 flex items-center justify-center shadow-md shadow-amber-400/40">
                      <Star className="w-5 h-5 sm:w-6 sm:h-6 fill-white text-white drop-shadow-xs" />
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.2 }}
          className="w-full pt-1"
        >
          <motion.button
            id="btn-next-level"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              soundManager.playTap();
              onNextLevel();
            }}
            className="w-full py-3.5 sm:py-4 px-5 sm:px-6 rounded-2xl font-black text-sm sm:text-base bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 text-white shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all border-b-4 border-blue-800 active:border-b-0"
          >
            <span>{nextText}</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
