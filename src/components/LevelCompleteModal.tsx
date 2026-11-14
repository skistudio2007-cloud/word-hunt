import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ChevronRight, Zap } from 'lucide-react';
import { soundManager } from '../services/sound';
import { LanguageCode } from '../types';
import { getTranslation } from '../services/localization';

interface Props {
  starsAwarded?: number;
  language?: LanguageCode;
  onNextLevel: () => void;
}

// Pre-generate confetti data once at module level (never re-computed)
interface Piece {
  id: number; color: string; x: number; delay: number;
  dur: number; w: number; h: number; br: string; amp: number;
}
const COLORS = ['#6366F1','#F59E0B','#10B981','#EC4899','#38BDF8','#8B5CF6','#FBBF24','#F43F5E','#14B8A6','#2563EB'];
const PIECES: Piece[] = Array.from({ length: 32 }, (_, i) => ({
  id: i,
  color: COLORS[i % COLORS.length],
  x: -50 + (i * 97) % 100,          // spread -50..+50 % from center
  delay: (i * 0.038) % 0.6,
  dur: 2.0 + (i % 5) * 0.18,
  w: i % 3 === 0 ? 5 : i % 3 === 1 ? 9 : 7,
  h: i % 3 === 0 ? 14 : i % 3 === 1 ? 9 : 7,
  br: i % 3 === 0 ? '3px' : i % 3 === 1 ? '2px' : '50%',
  amp: 60 + (i % 6) * 25,            // fall distance variation
}));

export const LevelCompleteModal: React.FC<Props> = React.memo(({
  starsAwarded = 3,
  language = 'en',
  onNextLevel,
}) => {
  const [starPhase, setStarPhase] = useState(0); // 0 = none, 1,2,3 = stars revealed
  const [btnReady, setBtnReady] = useState(false);
  const [exiting, setExiting] = useState(false);
  const nextClickedRef = useRef(false);

  const nextText = getTranslation(language, 'nextLevel') || 'NEXT LEVEL';

  useEffect(() => {
    const t1 = setTimeout(() => { setStarPhase(1); soundManager.playStarPop(0); }, 350);
    const t2 = setTimeout(() => {
      if (starsAwarded >= 2) { setStarPhase(2); soundManager.playStarPop(1); }
    }, 620);
    const t3 = setTimeout(() => {
      if (starsAwarded >= 3) { setStarPhase(3); soundManager.playStarPop(2); }
    }, 890);
    const t4 = setTimeout(() => setBtnReady(true), 1050);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [starsAwarded]);

  const handleNext = () => {
    if (nextClickedRef.current) return;
    nextClickedRef.current = true;
    soundManager.playTap();
    setExiting(true);
    setTimeout(onNextLevel, 220);
  };

  return (
    <motion.div
      id="level-complete-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: exiting ? 0.2 : 0.18, ease: 'easeOut' }}
      className="fixed inset-0 z-50 flex items-center justify-center p-5 select-none overflow-hidden"
      style={{ background: 'rgba(10,10,25,0.82)' }}
    >
      {/* ── Confetti Rain ── */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        aria-hidden
        style={{ transform: 'translateZ(0)' }}
      >
        {PIECES.map(p => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              top: '-10%',
              left: `calc(50% + ${p.x}%)`,
              width: p.w,
              height: p.h,
              borderRadius: p.br,
              backgroundColor: p.color,
              willChange: 'transform, opacity',
              transform: 'translateZ(0)',
              animation: `lcRain ${p.dur}s ${p.delay}s cubic-bezier(0.3,0,0.7,1) infinite`,
              ['--amp' as string]: `${p.amp}px`,
              ['--rot' as string]: `${((p.id * 137) % 540) - 270}deg`,
            }}
          />
        ))}
      </div>

      {/* ── Victory Card ── */}
      <motion.div
        id="level-complete-card"
        initial={{ scale: 0.6, opacity: 0, y: 40 }}
        animate={exiting
          ? { scale: 0.85, opacity: 0, y: -20 }
          : { scale: 1, opacity: 1, y: 0 }
        }
        transition={exiting
          ? { duration: 0.2, ease: 'easeIn' }
          : { type: 'spring', damping: 18, stiffness: 380, mass: 0.9 }
        }
        className="relative w-full max-w-[320px] flex flex-col items-center rounded-[2rem] overflow-hidden"
        style={{ transform: 'translateZ(0)', willChange: 'transform' }}
      >
        {/* Card gradient background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(160deg, #1e1b4b 0%, #0f172a 55%, #1a0a3e 100%)',
          }}
        />

        {/* Top shimmer stripe */}
        <div
          className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)' }}
        />

        {/* Inner glow rings */}
        <div
          className="absolute inset-0 pointer-events-none rounded-[2rem]"
          style={{
            boxShadow: 'inset 0 0 60px rgba(99,102,241,0.12), 0 0 0 1px rgba(255,255,255,0.08)',
          }}
        />

        <div className="relative z-10 flex flex-col items-center w-full px-6 pt-8 pb-7 gap-5">

          {/* ── Trophy badge ── */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.08, type: 'spring', damping: 12, stiffness: 300 }}
            className="relative flex items-center justify-center"
          >
            {/* Halo ring */}
            <div
              className="absolute w-24 h-24 rounded-full opacity-30"
              style={{
                background: 'radial-gradient(circle, #FBBF24 0%, transparent 70%)',
                animation: 'lcHaloPulse 2.4s ease-in-out infinite',
              }}
            />
            {/* Badge */}
            <div
              className="relative w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 50%, #D97706 100%)',
                boxShadow: '0 8px 32px rgba(245,158,11,0.5), inset 0 1px 0 rgba(255,255,255,0.4)',
              }}
            >
              <span style={{ fontSize: 38 }}>🏆</span>
            </div>
            {/* Sparkle dots */}
            {[0,1,2,3].map(i => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-amber-300"
                style={{
                  top: `${50 + 48 * Math.sin((i / 4) * Math.PI * 2)}%`,
                  left: `${50 + 48 * Math.cos((i / 4) * Math.PI * 2)}%`,
                  transform: 'translate(-50%,-50%)',
                  animation: `lcSparkDot 1.6s ${i * 0.2}s ease-in-out infinite`,
                  opacity: 0.7,
                }}
              />
            ))}
          </motion.div>

          {/* ── Headline ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.32, ease: [0.22,1,0.36,1] }}
            className="text-center space-y-1"
          >
            <p className="text-xs font-black tracking-[0.2em] uppercase" style={{ color: '#FBBF24' }}>
              Level Complete
            </p>
            <h2
              className="text-3xl font-black tracking-tight leading-none"
              style={{ color: '#fff', textShadow: '0 0 24px rgba(251,191,36,0.4)' }}
            >
              Brilliant! 🎉
            </h2>
          </motion.div>

          {/* ── Stars row ── */}
          <div className="flex items-center justify-center gap-3">
            {[1, 2, 3].map(idx => {
              const filled = starsAwarded >= idx;
              const popped = starPhase >= idx;
              return (
                <div key={idx} className="relative w-16 h-16 flex items-center justify-center">
                  {/* Slot background */}
                  <div
                    className="absolute inset-0 rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />

                  {/* Ping ring on pop */}
                  <AnimatePresence>
                    {popped && filled && (
                      <motion.div
                        key="ring"
                        initial={{ scale: 0.5, opacity: 0.9 }}
                        animate={{ scale: 2.0, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="absolute inset-0 rounded-2xl"
                        style={{ background: 'rgba(251,191,36,0.5)', transformOrigin: 'center' }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Empty star */}
                  <Star
                    className="absolute w-7 h-7"
                    style={{ color: 'rgba(255,255,255,0.12)', fill: 'rgba(255,255,255,0.06)' }}
                  />

                  {/* Filled star pop */}
                  <AnimatePresence>
                    {popped && filled && (
                      <motion.div
                        key="star"
                        initial={{ scale: 0, rotate: -30 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', damping: 10, stiffness: 350 }}
                        className="absolute flex items-center justify-center"
                        style={{ willChange: 'transform' }}
                      >
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                          style={{
                            background: 'linear-gradient(145deg, #FDE68A, #F59E0B, #D97706)',
                            boxShadow: '0 4px 16px rgba(245,158,11,0.6), inset 0 1px 0 rgba(255,255,255,0.4)',
                          }}
                        >
                          <Star className="w-7 h-7 fill-white text-white drop-shadow" />
                        </div>
                      </motion.div>
                    )}
                    {popped && !filled && (
                      <motion.div
                        key="empty-star"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 14, stiffness: 300 }}
                        className="absolute w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.08)' }}
                      >
                        <Star className="w-6 h-6" style={{ color: 'rgba(255,255,255,0.3)', fill: 'rgba(255,255,255,0.12)' }} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* ── XP reward pill ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, type: 'spring', damping: 14, stiffness: 280 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              background: 'rgba(99,102,241,0.18)',
              border: '1px solid rgba(99,102,241,0.3)',
            }}
          >
            <Zap className="w-4 h-4" style={{ color: '#818CF8', fill: '#818CF8' }} />
            <span className="text-sm font-black tracking-wide" style={{ color: '#C7D2FE' }}>+100 XP Earned!</span>
          </motion.div>

          {/* ── Next Level Button ── */}
          <AnimatePresence>
            {btnReady && (
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', damping: 16, stiffness: 320 }}
                className="w-full"
              >
                <motion.button
                  id="btn-next-level"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.93 }}
                  onClick={handleNext}
                  className="relative w-full py-4 rounded-2xl font-black text-base text-white overflow-hidden flex items-center justify-center gap-2.5 cursor-pointer select-none"
                  style={{
                    background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 50%, #7C3AED 100%)',
                    boxShadow: '0 6px 24px rgba(99,102,241,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
                  }}
                >
                  {/* Shimmer sweep */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)',
                      animation: 'lcBtnShimmer 2.2s ease-in-out infinite',
                    }}
                  />
                  <span className="relative tracking-wide uppercase">{nextText}</span>
                  <ChevronRight className="relative w-5 h-5 stroke-[2.5]" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
});

LevelCompleteModal.displayName = 'LevelCompleteModal';
