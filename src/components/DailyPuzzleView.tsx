import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, Flame, CheckCircle, Play, Gift, Sparkles } from 'lucide-react';
import { UserProgress } from '../types';
import { soundManager } from '../services/sound';

interface Props {
  progress: UserProgress;
  onPlayDaily: () => void;
  onClaimDailyReward: () => void;
  onBack: () => void;
}

export const DailyPuzzleView: React.FC<Props> = ({
  progress,
  onPlayDaily,
  onBack
}) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const todayDate = today.getDate();
  const todayKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(todayDate).padStart(2, '0')}`;

  const isTodayCompleted = !!progress.dailyHistory[todayKey]?.completed;

  // Days of current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full min-h-screen bg-black text-neutral-100 flex flex-col max-w-[440px] mx-auto select-none"
    >
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-neutral-800 px-4 py-3 flex items-center justify-between">
        <motion.button
          id="btn-daily-back"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            soundManager.playTap();
            onBack();
          }}
          className="w-10 h-10 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 flex items-center justify-center text-neutral-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>

        <div className="text-center">
          <h2 className="text-sm font-black text-white flex items-center justify-center gap-1.5 tracking-wider">
            <Calendar className="w-4 h-4 text-white" />
            <span>DAILY EXPEDITION</span>
          </h2>
          <span className="text-[11px] font-semibold text-neutral-400">
            {monthNames[month]} {year}
          </span>
        </div>

        <div className="w-10" />
      </header>

      {/* Main Content */}
      <div className="p-4 space-y-5 flex-1 overflow-y-auto pb-16">
        {/* Streak Counter Hero */}
        <div className="p-5 rounded-3xl bg-neutral-950 border border-neutral-800 shadow-xl flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-white text-xs font-black uppercase tracking-wider mb-1">
              <Flame className="w-4 h-4 fill-white text-white" /> Daily Streak
            </div>
            <div className="text-3xl font-black text-white">
              {progress.stats.currentStreak} <span className="text-sm font-bold text-neutral-400">Days</span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Best record: {progress.stats.bestStreak} days
            </p>
          </div>

          <div className="text-center bg-neutral-900 p-3 rounded-2xl border border-neutral-800">
            <Gift className="w-6 h-6 text-white mx-auto mb-1" />
            <span className="text-[10px] font-black text-neutral-300 block">Streak Bonus</span>
            <span className="text-xs font-black text-white">+2 Hints</span>
          </div>
        </div>

        {/* Today's Special Challenge Card */}
        <div className="p-5 rounded-3xl bg-neutral-950 border border-neutral-800 shadow-xl space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white/10 text-white border border-white/20">
                TODAY'S SPECIAL THEME
              </span>
              <h3 className="text-xl font-black text-white mt-1.5">
                {monthNames[month]} {todayDate}, {year}
              </h3>
              <p className="text-xs text-neutral-400">
                Exclusive daily grid with double XP and bonus stars!
              </p>
            </div>
            {isTodayCompleted && (
              <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-black flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Solved
              </span>
            )}
          </div>

          <motion.button
            id="btn-play-daily-puzzle"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              soundManager.playTap();
              onPlayDaily();
            }}
            className={`w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-colors ${
              isTodayCompleted
                ? 'bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200'
                : 'bg-white hover:bg-neutral-200 text-black shadow-white/10'
            }`}
          >
            <Play className={`w-5 h-5 ${isTodayCompleted ? 'text-neutral-400' : 'fill-black text-black'}`} />
            <span>{isTodayCompleted ? 'REPLAY DAILY PUZZLE' : 'PLAY TODAY’S CHALLENGE'}</span>
          </motion.button>
        </div>

        {/* Calendar Overview */}
        <div className="p-5 rounded-3xl bg-neutral-950 border border-neutral-800 space-y-3">
          <h4 className="text-xs font-black text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-white" /> Monthly Progress
          </h4>

          <div className="grid grid-cols-7 gap-1.5 text-center">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((dayName, idx) => (
              <span key={`day-name-${idx}`} className="text-[10px] font-bold text-neutral-500 py-1">
                {dayName}
              </span>
            ))}

            {daysArray.map(dayNum => {
              const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isDone = !!progress.dailyHistory[dateString]?.completed;
              const isCurrentDay = dayNum === todayDate;

              return (
                <div
                  key={`cal-day-${dayNum}`}
                  className={`h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                    isCurrentDay
                      ? 'bg-white text-black font-black ring-2 ring-white'
                      : isDone
                      ? 'bg-neutral-800 text-white border border-neutral-600 font-black'
                      : dayNum < todayDate
                      ? 'bg-neutral-900 text-neutral-500'
                      : 'bg-neutral-900/40 text-neutral-600'
                  }`}
                >
                  {isDone ? '✓' : dayNum}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
