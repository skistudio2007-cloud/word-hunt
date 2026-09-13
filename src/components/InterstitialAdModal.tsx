import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Tv, ShieldCheck, Trophy, ArrowRight, Play } from 'lucide-react';
import { soundManager } from '../services/sound';
import { adService } from '../services/adService';
import { LanguageCode } from '../types';

interface Props {
  completedLevel: number;
  language?: LanguageCode;
  onClose: () => void;
}

export const InterstitialAdModal: React.FC<Props> = ({
  completedLevel,
  language = 'en',
  onClose
}) => {
  const TOTAL_SECONDS = 5;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(TOTAL_SECONDS);
  const [canSkip, setCanSkip] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const adConfig = adService.getConfig();
  const closedRef = useRef<boolean>(false);

  useEffect(() => {
    adService.setPlaying(true);
    const startTime = Date.now();
    const durationMs = TOTAL_SECONDS * 1000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(100, (elapsed / durationMs) * 100);
      const remaining = Math.max(0, Math.ceil((durationMs - elapsed) / 1000));

      setProgress(currentProgress);
      setSecondsRemaining(remaining);

      if (elapsed >= durationMs) {
        setCanSkip(true);
        clearInterval(interval);
      }
    }, 100);

    return () => {
      clearInterval(interval);
      adService.setPlaying(false);
    };
  }, []);

  const handleDismiss = () => {
    if (closedRef.current) return;
    closedRef.current = true;
    soundManager.playTap();
    adService.setPlaying(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div 
        id="interstitial-ad-backdrop"
        className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none"
      >
        <motion.div
          id="interstitial-ad-modal"
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col space-y-4 relative overflow-hidden"
        >
          {/* Top Bar with Ad Badge and Skip / Close */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                Google AdMob • Interstitial Ad
              </span>
            </div>

            {canSkip ? (
              <button
                id="btn-skip-interstitial"
                onClick={handleDismiss}
                className="px-3 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
              >
                <span>Skip</span>
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="text-[11px] font-bold text-slate-400 font-mono px-2 py-0.5 rounded-full bg-slate-100">
                Skip in {secondsRemaining}s
              </div>
            )}
          </div>

          {/* Level Milestone Banner */}
          <div className="flex items-center gap-3 bg-blue-50/80 border border-blue-100 rounded-2xl p-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-sm flex-shrink-0">
              <Trophy className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="text-[11px] font-black uppercase tracking-wider text-blue-600">
                Milestone Complete!
              </div>
              <div className="text-xs font-bold text-slate-800">
                You reached Level {completedLevel}! Level Break Ad
              </div>
            </div>
          </div>

          {/* Interstitial Ad Creative Visual */}
          <div className="w-full aspect-[4/3] rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center text-center p-5 relative overflow-hidden shadow-inner border border-slate-800">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent pointer-events-none" />

            <div className="space-y-3 z-10">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-400 mx-auto flex items-center justify-center animate-pulse">
                <Tv className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-base font-black text-white">Google AdMob Interstitial</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Showing level milestone break (Level {completedLevel})
                </p>
                <p className="text-[10px] text-slate-400 font-mono mt-1">
                  Unit: {adConfig.interstitialAdUnitId}
                </p>
              </div>
            </div>

            {/* Corner progress status */}
            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-bold text-white border border-white/10 flex items-center gap-1">
              <Play className="w-3 h-3 text-indigo-400 fill-indigo-400" />
              <span>{canSkip ? 'Ready' : `${secondsRemaining}s`}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
              <span>Ad playback</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-100 ease-linear rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleDismiss}
            className={`w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
              canSkip
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            <span>{canSkip ? `Continue to Level ${completedLevel + 1}` : `Continue in ${secondsRemaining}s`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
