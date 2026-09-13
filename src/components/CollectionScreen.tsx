import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Award, 
  BarChart3, 
  Flame, 
  ChevronRight, 
  ArrowLeft, 
  Lock, 
  CheckCircle2, 
  Sparkles, 
  Gift,
  Star,
  Zap,
  Target,
  Clock,
  BookOpen,
  Calendar
} from 'lucide-react';
import { LanguageCode, UserProgress } from '../types';
import { INITIAL_ACHIEVEMENTS } from '../data/achievements';
import { AWARDS_DATA } from '../data/awards';
import { soundManager } from '../services/sound';
import { getTranslation } from '../services/localization';

interface Props {
  progress: UserProgress;
  language?: LanguageCode;
  onClaimAchievement: (achievementId: string, rewardHints: number) => void;
}

type SubView = 'MENU' | 'ACHIEVEMENTS' | 'AWARDS' | 'RECORDS' | 'STREAK';

export const CollectionScreen: React.FC<Props> = ({ progress, language = 'en', onClaimAchievement }) => {
  const [subView, setSubView] = useState<SubView>('MENU');
  const t = (key: string) => getTranslation(language, key);

  // Compute stats for achievements
  const computedAchievements = INITIAL_ACHIEVEMENTS.map(ach => {
    let currentVal = 0;
    if (ach.id === 'first_level') currentVal = progress.stats.puzzlesSolved;
    else if (ach.id.startsWith('levels_')) {
      currentVal = progress.stats.puzzlesSolved;
    } else if (ach.id === 'perfect_level') currentVal = progress.stats.perfectLevels;
    else if (ach.id === 'fast_solver') currentVal = progress.stats.fastestSolveSeconds > 0 && progress.stats.fastestSolveSeconds <= 30 ? 1 : 0;
    else if (ach.id === 'word_master') currentVal = progress.stats.wordsFound;
    else if (ach.id === 'long_streak') currentVal = progress.stats.bestStreak;
    else if (ach.id === 'hint_free') currentVal = progress.stats.perfectLevels;
    else if (ach.id === 'challenge_winner') currentVal = progress.stats.challengeWins;
    else if (ach.id === 'vocab_master') currentVal = Math.min(50, progress.stats.wordsFound);
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

  const unlockedAchievementsCount = computedAchievements.filter(a => a.unlocked || a.claimed).length;

  // Compute stats for awards
  const computedAwards = AWARDS_DATA.map(award => {
    let current = 0;
    if (award.metric === 'level') current = progress.highestLevelUnlocked;
    else if (award.metric === 'words') current = progress.stats.wordsFound;
    else if (award.metric === 'streak') current = progress.stats.bestStreak;
    else if (award.metric === 'perfect') current = progress.stats.perfectLevels;
    else if (award.metric === 'challenges') current = progress.stats.challengeWins;

    const isUnlocked = current >= award.target;
    return {
      ...award,
      current,
      isUnlocked
    };
  });

  const unlockedAwardsCount = computedAwards.filter(a => a.isUnlocked).length;

  // Streak details
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const todayDate = today.getDate();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="w-full min-h-[calc(100vh-70px)] bg-white text-slate-900 flex flex-col pb-24 select-none">
      <AnimatePresence mode="wait">
        {/* 1. Main Collection Menu */}
        {subView === 'MENU' && (
          <motion.div
            key="collection-menu"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="p-4 space-y-6"
          >
            {/* Header */}
            <div className="pt-2 px-1">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                {t('collection')}
              </h1>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {t('collectionSubtitle')}
              </p>
            </div>

            {/* 4 Main Categories Cards */}
            <div className="space-y-3">
              {/* Category 1: ACHIEVEMENTS */}
              <motion.button
                id="cat-achievements"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 280, delay: 0.04 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  soundManager.playTap();
                  setSubView('ACHIEVEMENTS');
                }}
                className="w-full p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-100 flex items-center justify-between transition-colors text-left cursor-pointer shadow-sm"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{t('achievements')}</h3>
                    <p className="text-xs font-semibold text-slate-400">
                      {unlockedAchievementsCount} {t('of')} {computedAchievements.length} {t('unlocked')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                    {Math.round((unlockedAchievementsCount / computedAchievements.length) * 100)}%
                  </span>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
              </motion.button>

              {/* Category 2: AWARDS */}
              <motion.button
                id="cat-awards"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 280, delay: 0.08 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  soundManager.playTap();
                  setSubView('AWARDS');
                }}
                className="w-full p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-100 flex items-center justify-between transition-colors text-left cursor-pointer shadow-sm"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 flex items-center justify-center">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{t('awards')}</h3>
                    <p className="text-xs font-semibold text-slate-400">
                      {unlockedAwardsCount} {t('of')} {computedAwards.length} {t('unlocked')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                    {unlockedAwardsCount}
                  </span>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
              </motion.button>

              {/* Category 3: RECORDS */}
              <motion.button
                id="cat-records"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 280, delay: 0.12 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  soundManager.playTap();
                  setSubView('RECORDS');
                }}
                className="w-full p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-100 flex items-center justify-between transition-colors text-left cursor-pointer shadow-sm"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{t('records')}</h3>
                    <p className="text-xs font-semibold text-slate-400">
                      {t('puzzlesSolved')}: {progress.stats.puzzlesSolved}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
              </motion.button>

              {/* Category 4: STREAK */}
              <motion.button
                id="cat-streak"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 280, delay: 0.16 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  soundManager.playTap();
                  setSubView('STREAK');
                }}
                className="w-full p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-100 flex items-center justify-between transition-colors text-left cursor-pointer shadow-sm"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center">
                    <Flame className="w-6 h-6 fill-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{t('streak')}</h3>
                    <p className="text-xs font-semibold text-slate-400">
                      {t('dailyStreak')}: {progress.stats.currentStreak}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                    🔥 {progress.stats.currentStreak}
                  </span>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* 2. SubView: ACHIEVEMENTS LIST */}
        {subView === 'ACHIEVEMENTS' && (
          <motion.div
            key="subview-achievements"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="p-4 space-y-4"
          >
            <div className="flex items-center gap-3">
              <button
                id="btn-back-collection-achievements"
                onClick={() => {
                  soundManager.playTap();
                  setSubView('MENU');
                }}
                className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-xl font-black text-slate-900">Achievements</h2>
                <p className="text-xs text-slate-400 font-medium">
                  {unlockedAchievementsCount} of {computedAchievements.length} unlocked
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              {computedAchievements.map(ach => {
                const percent = Math.min(100, Math.round((ach.current / ach.target) * 100));

                return (
                  <div
                    key={`ach-item-${ach.id}`}
                    className={`p-4 rounded-2xl border transition-all ${
                      ach.claimed
                        ? 'bg-slate-50/70 border-slate-100 text-slate-400'
                        : ach.unlocked
                        ? 'bg-blue-50/60 border-blue-200 shadow-sm'
                        : 'bg-white border-slate-100 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                            ach.unlocked || ach.claimed
                              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {ach.unlocked || ach.claimed ? '🏆' : <Lock className="w-4 h-4" />}
                        </div>
                        <div>
                          <h4 className={`text-sm font-bold ${ach.unlocked ? 'text-slate-900' : 'text-slate-700'}`}>
                            {ach.titleKey}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                            {ach.descKey}
                          </p>
                        </div>
                      </div>

                      {ach.claimed ? (
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[11px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Done
                        </span>
                      ) : ach.unlocked ? (
                        <motion.button
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => {
                            soundManager.playWordSuccess();
                            onClaimAchievement(ach.id, ach.rewardHints);
                          }}
                          className="px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center gap-1 cursor-pointer"
                        >
                          <Gift className="w-3.5 h-3.5" />
                          <span>+{ach.rewardHints} Hints</span>
                        </motion.button>
                      ) : (
                        <span className="text-xs font-bold text-slate-400">
                          {ach.current}/{ach.target}
                        </span>
                      )}
                    </div>

                    {!ach.claimed && (
                      <div className="mt-3">
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 transition-all duration-300"
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
        )}

        {/* 3. SubView: AWARDS MILESTONES */}
        {subView === 'AWARDS' && (
          <motion.div
            key="subview-awards"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="p-4 space-y-4"
          >
            <div className="flex items-center gap-3">
              <button
                id="btn-back-collection-awards"
                onClick={() => {
                  soundManager.playTap();
                  setSubView('MENU');
                }}
                className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-xl font-black text-slate-900">Milestone Awards</h2>
                <p className="text-xs text-slate-400 font-medium">
                  {unlockedAwardsCount} of {computedAwards.length} earned
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {computedAwards.map(award => (
                <div
                  key={`award-${award.id}`}
                  className={`p-4 rounded-3xl border text-center transition-all flex flex-col items-center justify-between ${
                    award.isUnlocked
                      ? 'bg-blue-50/50 border-blue-200 shadow-sm'
                      : 'bg-slate-50/60 border-slate-100 opacity-60'
                  }`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center text-2xl shadow-sm mb-2 relative">
                    {award.isUnlocked ? (
                      <span>{award.icon}</span>
                    ) : (
                      <Lock className="w-5 h-5 text-slate-400" />
                    )}
                    {award.isUnlocked && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 bg-white rounded-full absolute -top-1 -right-1" />
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">{award.title}</h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-tight">
                    {award.requirement}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 w-full">
                    {award.isUnlocked ? (
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                        ✓ Unlocked
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-400">
                        {award.current} / {award.target}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 4. SubView: PERSONAL RECORDS */}
        {subView === 'RECORDS' && (
          <motion.div
            key="subview-records"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="p-4 space-y-4"
          >
            <div className="flex items-center gap-3">
              <button
                id="btn-back-collection-records"
                onClick={() => {
                  soundManager.playTap();
                  setSubView('MENU');
                }}
                className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-xl font-black text-slate-900">Personal Records</h2>
                <p className="text-xs text-slate-400 font-medium">
                  Verified statistics from your gameplay
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {/* Highest Level */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
                  <Target className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-slate-400 block">Highest Level</span>
                <span className="text-xl font-black text-slate-900 mt-0.5 block">
                  Level {progress.highestLevelUnlocked}
                </span>
              </div>

              {/* Total Puzzles Solved */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-slate-400 block">Puzzles Solved</span>
                <span className="text-xl font-black text-slate-900 mt-0.5 block">
                  {progress.stats.puzzlesSolved}
                </span>
              </div>

              {/* Words Found */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-2">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-slate-400 block">Words Found</span>
                <span className="text-xl font-black text-slate-900 mt-0.5 block">
                  {progress.stats.wordsFound}
                </span>
              </div>

              {/* Longest Streak */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-2">
                  <Flame className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-slate-400 block">Best Streak</span>
                <span className="text-xl font-black text-slate-900 mt-0.5 block">
                  {progress.stats.bestStreak} {progress.stats.bestStreak === 1 ? 'Day' : 'Days'}
                </span>
              </div>

              {/* Perfect Levels (3 Stars) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-2">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                </div>
                <span className="text-xs font-medium text-slate-400 block">Perfect (3★) Levels</span>
                <span className="text-xl font-black text-slate-900 mt-0.5 block">
                  {progress.stats.perfectLevels}
                </span>
              </div>

              {/* Challenge Wins */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-2">
                  <Zap className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-slate-400 block">Challenges Won</span>
                <span className="text-xl font-black text-slate-900 mt-0.5 block">
                  {progress.stats.challengeWins}
                </span>
              </div>

              {/* Total Stars */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-yellow-100 text-yellow-600 flex items-center justify-center mb-2">
                  <Star className="w-4 h-4 text-yellow-600" />
                </div>
                <span className="text-xs font-medium text-slate-400 block">Total Stars</span>
                <span className="text-xl font-black text-slate-900 mt-0.5 block">
                  {progress.totalStars} ⭐
                </span>
              </div>

              {/* Hints Used */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center mb-2">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-slate-400 block">Hints Used</span>
                <span className="text-xl font-black text-slate-900 mt-0.5 block">
                  {progress.stats.hintsUsed}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* 5. SubView: STREAK & CALENDAR */}
        {subView === 'STREAK' && (
          <motion.div
            key="subview-streak"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="p-4 space-y-4"
          >
            <div className="flex items-center gap-3">
              <button
                id="btn-back-collection-streak"
                onClick={() => {
                  soundManager.playTap();
                  setSubView('MENU');
                }}
                className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-xl font-black text-slate-900">Daily Streak</h2>
                <p className="text-xs text-slate-400 font-medium">
                  Exercise your mind every day
                </p>
              </div>
            </div>

            {/* Hero Streak Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20 text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-white/20 mx-auto flex items-center justify-center text-3xl mb-2 backdrop-blur-sm">
                🔥
              </div>
              <h3 className="text-3xl font-black tracking-tight">
                {progress.stats.currentStreak} {progress.stats.currentStreak === 1 ? 'DAY' : 'DAYS'}
              </h3>
              <p className="text-xs font-medium text-orange-100">
                Personal best streak: {progress.stats.bestStreak} days
              </p>
            </div>

            {/* Monthly Calendar View */}
            <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>{monthNames[month]} {year}</span>
                </h4>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Active
                </span>
              </div>

              <div className="grid grid-cols-7 gap-1.5 text-center">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((dayName, idx) => (
                  <span key={`day-lbl-${idx}`} className="text-[10px] font-bold text-slate-400 py-1">
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
                          ? 'bg-blue-600 text-white font-black shadow-sm shadow-blue-500/30'
                          : isDone
                          ? 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-200'
                          : dayNum < todayDate
                          ? 'bg-slate-200/60 text-slate-500'
                          : 'bg-white text-slate-400 border border-slate-100'
                      }`}
                    >
                      {isDone ? '✓' : dayNum}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
