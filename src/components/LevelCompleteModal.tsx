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
  '#2563EB', '#38BDF8', '#F59E0B', '#10B981', '#EC4899', '#8B5CF6', '#FBBF24', '#06B6D4', '#F43F5E'
];

export const LevelCompleteModal: React.FC<Props> = ({
  starsAwarded = 3,
  language = 'en',
  onNextLevel
}) => {
  const [activeStars, setActiveStars] = useState(0);

  const levelCompleteText = getTranslation(language, 'levelComplete') || 'LEVEL COMPLETED!';
  const nextText = getTranslation(language, 'nextLevel') || 'NEXT LEVEL';

  // Generate lightweight, festive celebration confetti streamers (100% GPU compositor driven)
  const confetti = useMemo<ConfettiPiece[]>(() => {
    const list: ConfettiPiece[] = [];
    const count = 24;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 2 * Math.PI;
      const distance = 120 + (i % 6) * 35;
      const isRibbon = i % 2 === 0;
      list.push({
        id: i,
        tx: Math.round(Math.cos(angle) * distance),
        ty: Math.round(Math.sin(angle) * distance + 80),
        tr: (i * 65 + 180) % 720,
        color: CELEBRATION_COLORS[i % CELEBRATION_COLORS.length],
        delay: (i % 8) * 0.06,
        duration: 1.8 + (i % 3) * 0.3,
        width: isRibbon ? 6 : 10,
        height: isRibbon ? 16 : 10,
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
    }, 320);

    const t2 = setTimeout(() => {
      if (starsAwarded >= 2) {
        setActiveStars(2);
        soundManager.playStarPop(1);
      }
    }, 620);

    const t3 = setTimeout(() => {
      if (starsAwarded >= 3) {
        setActiveStars(3);
        soundManager.playStarPop(2);
      }
    }, 920);

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
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4 select-none overflow-hidden"
    >
      {/* 1. Rotating Golden Celebration Sunburst Rays (Compositor GPU Animation) */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none anim-sunburst opacity-20 select-none z-0"
        style={{
          background: 'conic-gradient(from 0deg at 50% 50%, rgba(251,191,36,0.5) 0deg 15deg, transparent 15deg 30deg, rgba(251,191,36,0.5) 30deg 45deg, transparent 45deg 60deg, rgba(251,191,36,0.5) 60deg 75deg, transparent 75deg 90deg, rgba(251,191,36,0.5) 90deg 105deg, transparent 105deg 120deg, rgba(251,191,36,0.5) 120deg 135deg, transparent 135deg 150deg, rgba(251,191,36,0.5) 150deg 165deg, transparent 165deg 180deg, rgba(251,191,36,0.5) 180deg 195deg, transparent 195deg 210deg, rgba(251,191,36,0.5) 210deg 225deg, transparent 225deg 240deg, rgba(251,191,36,0.5) 240deg 255deg, transparent 255deg 270deg, rgba(251,191,36,0.5) 270deg 285deg, transparent 285deg 300deg, rgba(251,191,36,0.5) 300deg 315deg, transparent 315deg 330deg, rgba(251,191,36,0.5) 330deg 345deg, transparent 345deg 360deg)'
        }}
      />

      {/* 2. Confetti Burst Streamers (Pure CSS Keyframe Animation on GPU) */}
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
              boxShadow: `0 0 8px ${c.color}70`,
              animation: `confettiFlutter ${c.duration}s cubic-bezier(0.22, 1, 0.36, 1) infinite`,
              animationDelay: `${c.delay}s`,
              ['--tx' as string]: `${c.tx}px`,
              ['--ty' as string]: `${c.ty}px`,
              ['--tr' as string]: `${c.tr}deg`
            }}
          />
        ))}
      </div>

      {/* 3. Victory Card with 3D Trophy, Stars & Next Button */}
      <motion.div
        id="level-complete-card"
        initial={{ scale: 0.75, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 15 }}
        transition={{ type: 'spring', damping: 20, stiffness: 320 }}
        className="w-full max-w-xs bg-white rounded-3xl p-6 sm:p-7 shadow-2xl text-slate-900 text-center relative z-10 flex flex-col items-center space-y-5 border border-amber-200/60 overflow-visible"
      >
        {/* Floating Trophy & Crown Badge */}
        <div className="relative -mt-12">
          {/* Glowing Aura Ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 blur-md opacity-60 scale-125 anim-bg-pulse" />
          
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 14, stiffness: 350, delay: 0.1 }}
            className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-white flex items-center justify-center border-4 border-white shadow-xl shadow-amber-500/40"
          >
            <Trophy className="w-11 h-11 text-amber-950/85 drop-shadow-sm" />
          </motion.div>

          {/* Sparkles on corner */}
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-3 -right-3 text-amber-400"
          >
            <Sparkles className="w-7 h-7 fill-amber-300 drop-shadow" />
          </motion.div>
        </div>

        {/* Victory Title & Ribbon */}
        <div className="space-y-1">
          <motion.h2 
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.25 }}
            className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase"
          >
            {levelCompleteText}
          </motion.h2>
          <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">
            ⭐ Outstanding Performance ⭐
          </p>
        </div>

        {/* 3 Juicy Stars Popping with Golden Waves */}
        <div className="flex items-center justify-center gap-3 py-1">
          {[1, 2, 3].map(starIndex => {
            const isPopped = activeStars >= starIndex;
            const isFilled = starsAwarded >= starIndex;

            return (
              <div 
                key={`star-${starIndex}`}
                className="relative flex items-center justify-center w-14 h-14"
              >
                {/* Expanding Golden Ripple Ring on Pop */}
                {isPopped && isFilled && (
                  <div className="absolute inset-0 rounded-2xl bg-amber-400/50 animate-ping pointer-events-none" />
                )}

                {/* Base Star Container */}
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200">
                  <Star className="w-6 h-6 text-slate-300 fill-slate-200" />
                </div>

                {/* Popped Brilliant Gold Star */}
                {isPopped && isFilled && (
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: [0, 1.4, 1], rotate: 0 }}
                    transition={{ type: 'spring', damping: 12, stiffness: 450 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-amber-300 to-amber-500 border-2 border-amber-300 flex items-center justify-center shadow-lg shadow-amber-400/50">
                      <Star className="w-6 h-6 fill-white text-white drop-shadow-sm" />
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        {/* Juicy NEXT LEVEL Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.9, duration: 0.25 }}
          className="w-full pt-1"
        >
          <motion.button
            id="btn-next-level"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              soundManager.playTap();
              onNextLevel();
            }}
            className="w-full py-4 px-6 rounded-2xl font-black text-base sm:text-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 text-white shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all border-b-4 border-blue-800 active:border-b-0"
          >
            <span>{nextText}</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
