import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Tv, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { soundManager } from '../services/sound';
import { adService } from '../services/adService';
import { LanguageCode } from '../types';

interface Props {
  language?: LanguageCode;
  onReward: () => void;
  onCancel: (reason?: string) => void;
  onClose: () => void;
}

export const RewardedAdModal: React.FC<Props> = ({
  language = 'en',
  onReward,
  onCancel,
  onClose
}) => {
  const TOTAL_DURATION_SECONDS = 5;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(TOTAL_DURATION_SECONDS);
  const [progress, setProgress] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [showCloseWarning, setShowCloseWarning] = useState<boolean>(false);
  const rewardGrantedRef = useRef<boolean>(false);

  const adConfig = adService.getConfig();

  useEffect(() => {
    adService.setPlaying(true);

    const startTime = Date.now();
    const durationMs = TOTAL_DURATION_SECONDS * 1000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(100, (elapsed / durationMs) * 100);
      const remainingSecs = Math.max(0, Math.ceil((durationMs - elapsed) / 1000));

      setProgress(currentProgress);
      setSecondsRemaining(remainingSecs);

      if (elapsed >= durationMs) {
        clearInterval(interval);
        setIsCompleted(true);

        // Safe Single-Reward execution guard
        if (!rewardGrantedRef.current) {
          rewardGrantedRef.current = true;
          soundManager.playWordSuccess();
          setTimeout(() => {
            adService.setPlaying(false);
            onReward();
            onClose();
          }, 600);
        }
      }
    }, 100);

    return () => {
      clearInterval(interval);
      adService.setPlaying(false);
    };
  }, [onReward, onClose]);

  const handleEarlyClose = () => {
    if (isCompleted) {
      onClose();
      return;
    }
    setShowCloseWarning(true);
  };

  const handleConfirmExit = () => {
    soundManager.playTap();
    setShowCloseWarning(false);
    onCancel('Ad closed early. No hint was granted.');
    onClose();
  };

  return (
    <AnimatePresence>
      <div 
        id="rewarded-ad-backdrop"
        className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 select-none"
      >
        <motion.div
          id="rewarded-ad-modal"
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col space-y-4 relative overflow-hidden"
        >
          {/* Top Bar with Ad Badge and Close button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                Google AdMob • Rewarded Ad
              </span>
            </div>

            <button
              id="btn-close-rewarded-ad"
              onClick={handleEarlyClose}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
              title="Close Ad"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Ad Creative Video Simulation Card */}
          <div className="w-full aspect-video rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 flex flex-col items-center justify-center text-center p-4 relative overflow-hidden shadow-inner">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent pointer-events-none" />

            {!isCompleted ? (
              <div className="space-y-2 z-10">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-400/30 text-blue-400 mx-auto flex items-center justify-center animate-pulse">
                  <Tv className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">Watch Ad for 1 Free Hint</h4>
                  <p className="text-[11px] text-slate-300 font-mono tracking-tight mt-0.5">
                    ID: {adConfig.rewardedAdUnitId}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2 z-10 animate-bounce">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">Reward Earned!</h4>
                  <p className="text-[11px] text-emerald-300 font-medium">+1 Hint unlocked & applying...</p>
                </div>
              </div>
            )}

            {/* Countdown Badge in corner */}
            <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-bold text-white border border-white/10">
              {isCompleted ? 'Reward Ready' : `Reward in ${secondsRemaining}s`}
            </div>
          </div>

          {/* Ad Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
              <span className="font-mono text-[10px]">{adConfig.isTestMode ? 'AdMob Test Unit' : 'AdMob Live Unit'}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-100 ease-linear rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Confirmation Dialog Overlay if user taps close early */}
          {showCloseWarning && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 bg-white/95 backdrop-blur-xs p-6 flex flex-col justify-center text-center space-y-4 z-30"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center border border-amber-200">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900">Leave early?</h4>
                <p className="text-xs text-slate-500 mt-1">
                  You will lose your hint reward if you leave before the video finishes.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => setShowCloseWarning(false)}
                  className="py-2.5 px-3 rounded-full bg-blue-600 text-white font-bold text-xs cursor-pointer"
                >
                  Keep Watching
                </button>
                <button
                  onClick={handleConfirmExit}
                  className="py-2.5 px-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Close & Skip
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

