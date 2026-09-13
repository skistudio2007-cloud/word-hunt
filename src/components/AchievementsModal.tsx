import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Trophy, CheckCircle, Gift, Award } from 'lucide-react';
import { UserProgress } from '../types';
import { INITIAL_ACHIEVEMENTS } from '../data/achievements';
import { soundManager } from '../services/sound';

interface Props {
  progress: UserProgress;
  onClaimAchievement: (achievementId: string, rewardHints: number) => void;
  onBack: () => void;
}

export const AchievementsModal: React.FC<Props> = ({ progress, onClaimAchievement, onBack }) => {
  // Compute progress for each achievement dynamically
  const achievements = INITIAL_ACHIEVEMENTS.map(ach => {
    let currentVal = 0;
    if (ach.id === 'first_word') currentVal = progress.stats.wordsFound;
    else if (ach.id === 'first_puzzle') currentVal = progress.stats.puzzlesSolved;
    else if (ach.id === 'levels_10' || ach.id === 'levels_50' || ach.id === 'levels_100' || ach.id === 'levels_500') {
      currentVal = progress.highestLevelUnlocked;
    } else if (ach.id === 'perfect_solver') currentVal = progress.stats.perfectLevels;
    else if (ach.id === 'streak_7' || ach.id === 'streak_30') currentVal = progress.stats.bestStreak;
    else if (ach.id === 'word_hunter') currentVal = progress.stats.wordsFound;
    else if (ach.id === 'daily_player') currentVal = Object.keys(progress.dailyHistory).length;
    else currentVal = progress.stats.puzzlesSolved;

    const isUnlocked = currentVal >= ach.target;
    const isClaimed = progress.claimedAchievements.includes(ach.id);

    return {
      ...ach,
      current: Math.min(currentVal, ach.target),
      unlocked: isUnlocked,
      claimed: isClaimed
    };
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full min-h-screen bg-black text-neutral-100 flex flex-col max-w-[440px] mx-auto select-none"
    >
      <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-neutral-800 px-4 py-3 flex items-center justify-between">
        <motion.button
          id="btn-achievements-back"
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

        <h2 className="text-sm font-black text-white flex items-center gap-1.5 tracking-wider">
          <Trophy className="w-4 h-4 text-white" />
          <span>ACHIEVEMENTS</span>
        </h2>

        <div className="w-10" />
      </header>

      <div className="flex-1 p-4 space-y-3 overflow-y-auto pb-16">
        {achievements.map(ach => {
          const percent = Math.min(100, Math.round((ach.current / ach.target) * 100));

          return (
            <div
              key={`ach-${ach.id}`}
              className={`p-4 rounded-2xl border transition-colors ${
                ach.claimed
                  ? 'bg-neutral-950/40 border-neutral-900 text-neutral-500'
                  : ach.unlocked
                  ? 'bg-neutral-900 border-neutral-700 shadow-lg shadow-white/5'
                  : 'bg-neutral-950 border-neutral-800'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-2xl border ${
                      ach.unlocked
                        ? 'bg-white/10 text-white border-white/20'
                        : 'bg-neutral-900 text-neutral-600 border-neutral-800'
                    }`}
                  >
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className={`text-sm font-black ${ach.unlocked ? 'text-white' : 'text-neutral-300'}`}>
                      {ach.titleKey}
                    </h4>
                    <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                      {ach.descKey}
                    </p>
                  </div>
                </div>

                {ach.claimed ? (
                  <span className="px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 text-xs font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-white" /> Claimed
                  </span>
                ) : ach.unlocked ? (
                  <motion.button
                    id={`btn-claim-${ach.id}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      soundManager.playWordSuccess();
                      onClaimAchievement(ach.id, ach.rewardHints);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-black text-xs shadow-md transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>+{ach.rewardHints} Hints</span>
                  </motion.button>
                ) : (
                  <span className="text-xs font-bold text-neutral-500">
                    {ach.current} / {ach.target}
                  </span>
                )}
              </div>

              {/* Progress bar */}
              {!ach.claimed && (
                <div className="mt-3">
                  <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                    <div
                      className="h-full bg-white transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
