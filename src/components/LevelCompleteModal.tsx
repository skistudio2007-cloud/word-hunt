import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ChevronRight, Zap, Trophy } from 'lucide-react';
import { soundManager } from '../services/sound';
import { LanguageCode } from '../types';
import { getTranslation } from '../services/localization';

interface Props {
  starsAwarded?: number;
  language?: LanguageCode;
  onNextLevel: () => void;
}

// Light festive confetti pieces (soft pastels & vibrant party colors)
interface ConfettiPiece {
  id: number;
  color: string;
  x: number;
  delay: number;
  dur: number;
  w: number;
  h: number;
  br: string;
}

const CONFETTI_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#06B6D4', '#F43F5E'];
const CONFETTI_PIECES: ConfettiPiece[] = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  x: -45 + (i * 93) % 90,
  delay: (i * 0.04) % 0.5,
  dur: 2.2 + (i % 4) * 0.2,
  w: i % 3 === 0 ? 6 : i % 3 === 1 ? 9 : 7,
  h: i % 3 === 0 ? 12 : i % 3 === 1 ? 9 : 7,
  br: i % 3 === 0 ? '2px' : i % 3 === 1 ? '3px' : '50%',
}));

export const LevelCompleteModal: React.FC<Props> = React.memo(({
  starsAwarded = 3,
  language = 'en',
  onNextLevel,
}) => {
  const [starPhase, setStarPhase] = useState(0);
  const [btnReady, setBtnReady] = useState(false);
  const [exiting, setExiting] = useState(false);
  const nextClickedRef = useRef(false);

  const levelCompleteText = getTranslation(language, 'levelComplete') || 'LEVEL COMPLETE';
  const nextText = getTranslation(language, 'nextLevel') || 'NEXT LEVEL';

  useEffect(() => {
    const t1 = setTimeout(() => {
      setStarPhase(1);
      soundManager.playStarPop(0);
    }, 300);

    const t2 = setTimeout(() => {
      if (starsAwarded >= 2) {
        setStarPhase(2);
        soundManager.playStarPop(1);
      }
    }, 550);

    const t3 = setTimeout(() => {
      if (starsAwarded >= 3) {
        setStarPhase(3);
        soundManager.playStarPop(2);
      }
    }, 800);

    const t4 = setTimeout(() => setBtnReady(true), 950);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [starsAwarded]);

  const handleNext = () => {
    if (nextClickedRef.current) return;
    nextClickedRef.current = true;
    soundManager.playTap();
    setExiting(true);
    setTimeout(onNextLevel, 200);
  };

  return (
    <motion.div
      id="level-complete-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="fixed inset-0 z-50 flex items-center justify-center p-5 select-none overflow-hidden"
      style={{ background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(4px)' }}
    >
      {/* ── Soft Confetti Shower ── */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        aria-hidden
        style={{ transform: 'translateZ(0)' }}
      >
        {CONFETTI_PIECES.map(p => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              top: '-5%',
              left: `calc(50% + ${p.x}%)`,
              width: p.w,
              height: p.h,
              borderRadius: p.br,
              backgroundColor: p.color,
              opacity: 0.85,
              willChange: 'transform, opacity',
              transform: 'translateZ(0)',
              animation: `lcRain ${p.dur}s ${p.delay}s cubic-bezier(0.25, 0, 0.75, 1) infinite`,
            }}
          />
        ))}
      </div>

      {/* ── Clean & Light Victory Card ── */}
      <motion.div
        id="level-complete-card"
        initial={{ scale: 0.82, opacity: 0, y: 24 }}
        animate={exiting ? { scale: 0.88, opacity: 0, y: -12 } : { scale: 1, opacity: 1, y: 0 }}
        transition={
          exiting
            ? { duration: 0.18, ease: 'easeIn' }
            : { type: 'spring', damping: 22, stiffness: 420, mass: 0.8 }
        }
        className="relative w-full max-w-[310px] bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col items-center gap-4 text-center z-10"
        style={{ transform: 'translateZ(0)' }}
      >
        {/* Soft Golden Trophy Badge */}
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.05, type: 'spring', damping: 14, stiffness: 360 }}
          className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-200 flex items-center justify-center shadow-lg shadow-amber-400/25 border-2 border-white"
        >
          <Trophy className="w-8 h-8 text-amber-900/80 drop-shadow-xs" />
        </motion.div>

        {/* Clean Headline */}
        <div className="space-y-0.5">
          <p className="text-[11px] font-black uppercase tracking-wider text-amber-600">
            {levelCompleteText}
          </p>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Awesome! 🎉
          </h2>
        </div>

        {/* ── Light Star Row ── */}
        <div className="flex items-center justify-center gap-2.5 py-1">
          {[1, 2, 3].map(idx => {
            const filled = starsAwarded >= idx;
            const popped = starPhase >= idx;

            return (
              <div key={idx} className="relative w-14 h-14 flex items-center justify-center">
                {/* Empty base slot */}
                <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200/60 flex items-center justify-center">
                  <Star className="w-6 h-6 text-slate-300 fill-slate-200" />
                </div>

                {/* Popped filled golden star */}
                <AnimatePresence>
                  {popped && filled && (
                    <motion.div
                      key="filled-star"
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', damping: 12, stiffness: 400 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 border border-amber-200 flex items-center justify-center shadow-md shadow-amber-400/35">
                        <Star className="w-6 h-6 fill-white text-white drop-shadow-xs" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* ── Clean Light Reward Pill (+100 XP) ── */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-700 text-xs font-black shadow-2xs">
          <Zap className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
          <span>+100 XP EARNED</span>
        </div>

        {/* ── Action Next Level Button ── */}
        <div className="w-full pt-1">
          <motion.button
            id="btn-next-level"
            whileHover={btnReady ? { scale: 1.03 } : undefined}
            whileTap={btnReady ? { scale: 0.94 } : undefined}
            onClick={handleNext}
            className={`btn-bouncy w-full py-3.5 px-5 rounded-2xl font-black text-sm text-white shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all ${
              btnReady
                ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                : 'bg-blue-600 opacity-90'
            }`}
          >
            <span className="uppercase tracking-wider">{nextText}</span>
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
});

LevelCompleteModal.displayName = 'LevelCompleteModal';
