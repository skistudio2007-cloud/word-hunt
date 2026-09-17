import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Star, ArrowRight, Sparkles, Trophy, Zap } from 'lucide-react';
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
  '#2563EB', '#38BDF8', '#F59E0B', '#10B981', '#EC4899', '#8B5CF6', '#FBBF24', '#06B6D4', '#F43F5E', '#14B8A6'
];

export const LevelCompleteModal: React.FC<Props> = React.memo(({
  starsAwarded = 3,
  language = 'en',
  onNextLevel
}) => {
  const [activeStars, setActiveStars] = useState(0);

  const levelCompleteText = getTranslation(language, 'levelComplete') || 'LEVEL COMPLETED!';
  const nextText = getTranslation(language, 'nextLevel') || 'NEXT LEVEL';

  // 18 lightweight party popper confetti pieces that shoot outward on GPU compositor
  const confetti = useMemo<ConfettiPiece[]>(() => {
    const list: ConfettiPiece[] = [];
    const count = 18;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 2 * Math.PI;
      const distance = 130 + (i % 5) * 35;
      const isRibbon = i % 2 === 0;
      list.push({
        id: i,
        tx: Math.round(Math.cos(angle) * distance),
        ty: Math.round(Math.sin(angle) * (distance * 0.8) + 40),
        tr: (i * 75 + 160) % 720,
        color: CELEBRATION_COLORS[i % CELEBRATION_COLORS.length],
        delay: 0.05 + (i % 6) * 0.04,
        duration: 1.5 + (i % 4) * 0.25,
        width: isRibbon ? 6 : 9,
        height: isRibbon ? 15 : 9,
        borderRadius: isRibbon ? '2px' : '9999px'
      });
    }
    return list;
  }, []);

  useEffect(() => {
    // Sequentially pop stars with cheerful musical chimes
    const t1 = setTimeout(() => {
      setActiveStars(1);
      soundManager.playStarPop(0);
    }, 320);

    const t2 = setTimeout(() => {
      if (starsAwarded >= 2) {
        setActiveStars(2);
        soundManager.playStarPop(1);
      }
    }, 580);

    const t3 = setTimeout(() => {
      if (starsAwarded >= 3) {
        setActiveStars(3);
        soundManager.playStarPop(2);
      }
    }, 840);

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
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 select-none overflow-hidden"
    >
      {/* 1. Golden Celebration Aura (Smooth GPU Radial Glow) */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[460px] h-[460px] pointer-events-none rounded-full opacity-30 select-none z-0 anim-bg-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(251,191,36,0.5) 0%, rgba(245,158,11,0.15) 50%, transparent 70%)',
          transform: 'translateZ(0)'
        }}
      />

      {/* 2. Confetti Burst Streamers (100% GPU Hardware Accelerated) */}
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
              transform: 'translateZ(0)',
              willChange: 'transform, opacity',
              ['--tx' as string]: `${c.tx}px`,
              ['--ty' as string]: `${c.ty}px`,
              ['--tr' as string]: `${c.tr}deg`
            }}
          />
        ))}
      </div>

      {/* 3. Premium Victory Card with 3D Trophy, Stars & Next Button */}
      <motion.div
        id="level-complete-card"
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 380 }}
        className="w-full max-w-xs bg-white rounded-3xl p-6 sm:p-7 shadow-2xl text-slate-900 text-center relative z-10 flex flex-col items-center space-y-4 border border-amber-200/80 overflow-visible transform-gpu"
      >
        {/* Floating Trophy & Sunburst Badge */}
        <div className="relative -mt-12">
          {/* Rotating Sunburst Rays on GPU */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full opacity-30 anim-sunburst pointer-events-none"
            style={{
              background: 'conic-gradient(from 0deg, transparent 0deg, rgba(245,158,11,0.5) 20deg, transparent 40deg, rgba(245,158,11,0.5) 60deg, transparent 80deg, rgba(245,158,11,0.5) 100deg, transparent 120deg, rgba(245,158,11,0.5) 140deg, transparent 160deg, rgba(245,158,11,0.5) 180deg, transparent 200deg, rgba(245,158,11,0.5) 220deg, transparent 240deg, rgba(245,158,11,0.5) 260deg, transparent 280deg, rgba(245,158,11,0.5) 300deg, transparent 320deg, rgba(245,158,11,0.5) 340deg, transparent 360deg)'
            }}
          />

          {/* Glowing Aura Ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 blur-md opacity-60 scale-125 anim-bg-pulse" />
          
          {/* Trophy Pop Container */}
          <div
            style={{
              animation: 'trophyJuicyPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) backwards',
              animationDelay: '0.08s'
            }}
            className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-white flex items-center justify-center border-4 border-white shadow-xl shadow-amber-500/40 transform-gpu"
          >
            <Trophy className="w-11 h-11 text-amber-950/85 drop-shadow-sm" />
          </div>

          {/* Corner Sparkles */}
          <div
            style={{
              animation: 'bgPulseSoft 2.5s ease-in-out infinite'
            }}
            className="absolute -top-2 -right-2 text-amber-400 drop-shadow"
          >
            <Sparkles className="w-7 h-7 fill-amber-300" />
          </div>
        </div>

        {/* Victory Title & Ribbon */}
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase leading-tight">
            {levelCompleteText}
          </h2>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/60 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span className="text-[11px] font-black text-amber-700 tracking-wider uppercase">
              All Words Discovered!
            </span>
          </div>
        </div>

        {/* 3 Juicy Popping Stars Sequence */}
        <div className="flex items-center justify-center gap-3 py-1">
          {[1, 2, 3].map(starIndex => {
            const isPopped = activeStars >= starIndex;
            const isFilled = starsAwarded >= starIndex;

            return (
              <div 
                key={`star-box-${starIndex}`}
                className="relative flex items-center justify-center w-14 h-14"
              >
                {/* Expanding Star Ping Ring on Pop */}
                {isPopped && isFilled && (
                  <div className="absolute inset-0 rounded-2xl bg-amber-400/50 animate-ping pointer-events-none" />
                )}

                {/* Base Star Slot */}
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200/90 shadow-inner">
                  <Star className="w-6 h-6 text-slate-300 fill-slate-200" />
                </div>

                {/* Popped Golden Star with Smooth GPU Pop Keyframe */}
                {isPopped && isFilled && (
                  <div
                    style={{
                      animation: 'starJuicyPop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
                    }}
                    className="absolute inset-0 flex items-center justify-center transform-gpu"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 border-2 border-amber-200 flex items-center justify-center shadow-lg shadow-amber-500/50">
                      <Star className="w-6 h-6 fill-white text-white drop-shadow-sm" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Level Reward Pill (+100 XP) */}
        <div className="flex items-center justify-center gap-2 pt-0.5">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-black shadow-2xs">
            <Zap className="w-3.5 h-3.5 fill-blue-500 text-blue-500" />
            <span>+100 XP EARNED</span>
          </div>
        </div>

        {/* Juicy NEXT LEVEL Action Button */}
        <div
          style={{
            animation: 'buttonJuicyEntrance 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) backwards',
            animationDelay: '0.85s'
          }}
          className="w-full pt-1"
        >
          <motion.button
            id="btn-next-level"
            whileHover={{ scale: 1.025 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              soundManager.playTap();
              onNextLevel();
            }}
            className="w-full py-4 px-6 rounded-2xl font-black text-base sm:text-lg bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl shadow-blue-500/35 flex items-center justify-center gap-2.5 cursor-pointer transition-all border-b-4 border-blue-800 active:border-b-0 select-none"
          >
            <span className="tracking-wide uppercase">{nextText}</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
});

LevelCompleteModal.displayName = 'LevelCompleteModal';
