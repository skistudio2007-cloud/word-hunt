import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Tv, AlertCircle, ShieldCheck, Sparkles, CheckCircle2, Play } from 'lucide-react';
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
  const TOTAL_SECONDS = 5;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(TOTAL_SECONDS);
  const [progress, setProgress] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [showCloseWarning, setShowCloseWarning] = useState<boolean>(false);
  const isPausedRef = useRef<boolean>(false);
  const closedRef = useRef<boolean>(false);
  const adConfig = adService.getConfig();

  useEffect(() => {
    adService.setPlaying(true);
    const durationMs = TOTAL_SECONDS * 1000;
    let accumulatedMs = 0;
    const intervalTick = 100;

    const interval = setInterval(() => {
      if (isPausedRef.current || closedRef.current) return;

      accumulatedMs += intervalTick;
      const currentProgress = Math.min(100, (accumulatedMs / durationMs) * 100);
      const remaining = Math.max(0, Math.ceil((durationMs - accumulatedMs) / 1000));

      setProgress(currentProgress);
      setSecondsRemaining(remaining);

      if (accumulatedMs >= durationMs) {
        setIsCompleted(true);
        clearInterval(interval);
        soundManager.playHintSparkle();
      }
    }, intervalTick);

    return () => {
      clearInterval(interval);
      adService.setPlaying(false);
    };
  }, []);

  const handleClaimReward = () => {
    if (closedRef.current) return;
    closedRef.current = true;
    soundManager.playTap();
    adService.setPlaying(false);
    onReward();
    onClose();
  };

  const handleEarlyClose = () => {
    if (isCompleted) {
      handleClaimReward();
      return;
    }
    isPausedRef.current = true;
    setShowCloseWarning(true);
  };

  const handleResumeWatching = () => {
    soundManager.playTap();
    setShowCloseWarning(false);
    isPausedRef.current = false;
  };

  const handleConfirmExit = () => {
    if (closedRef.current) return;
    closedRef.current = true;
    soundManager.playTap();
    setShowCloseWarning(false);
    adService.setPlaying(false);
    onCancel('Ad closed early, hint not granted');
    onClose();
  };

  return (
    <motion.div 
      id="rewarded-ad-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4 select-none"
    >
      <motion.div
        id="rewarded-ad-modal"
        initial={{ scale: 0.88, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0, y: 10 }}
        transition={{ type: 'spring', damping: 24, stiffness: 350 }}
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

          <div className="space-y-2 z-10">
            <div className={`w-12 h-12 rounded-2xl border mx-auto flex items-center justify-center transition-all ${
              isCompleted
                ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-400 scale-110'
                : 'bg-blue-600/20 border-blue-400/30 text-blue-400 animate-pulse'
            }`}>
              {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Tv className="w-6 h-6" />}
            </div>
            <div>
              <h4 className="text-sm font-black text-white">
                {isCompleted ? '🎉 Video Finished! Hint Ready!' : 'Watch Video for 1 Free Hint'}
              </h4>
              <p className="text-[11px] text-slate-300 font-mono tracking-tight mt-0.5">
                Unit: {adConfig.rewardedAdUnitId}
              </p>
            </div>
          </div>

          {/* Badge in corner */}
          <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-bold text-white border border-white/10 flex items-center gap-1">
            <Play className="w-3 h-3 text-blue-400 fill-blue-400" />
            <span>{isCompleted ? 'Reward Ready' : `${secondsRemaining}s`}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
            <span>Video Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-100 ease-linear rounded-full ${
                isCompleted ? 'bg-emerald-500' : 'bg-blue-600'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Reward Action Button */}
        <button
          id="btn-claim-reward-hint"
          onClick={isCompleted ? handleClaimReward : undefined}
          disabled={!isCompleted}
          className={`w-full py-3.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all ${
            isCompleted
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 cursor-pointer scale-102 animate-bounce'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isCompleted ? (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>CLAIM FREE HINT NOW</span>
            </>
          ) : (
            <span>Reward unlocks in {secondsRemaining}s...</span>
          )}
        </button>

        {/* Confirmation Dialog Overlay if user taps close early */}
        <AnimatePresence>
          {showCloseWarning && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
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
                  onClick={handleResumeWatching}
                  className="py-2.5 px-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-sm transition-colors"
                >
                  Keep Watching
                </button>
                <button
                  onClick={handleConfirmExit}
                  className="py-2.5 px-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                >
                  Close & Skip
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

