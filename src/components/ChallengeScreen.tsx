import React from 'react';
import { motion } from 'motion/react';
import { Play, Sparkles, Trophy, CheckCircle2 } from 'lucide-react';
import { ChallengeInfo, LanguageCode, UserProgress } from '../types';
import { EXPEDITION_CHALLENGES, getActiveChallenge } from '../data/challenges';
import { soundManager } from '../services/sound';
import { getTranslation } from '../services/localization';

interface Props {
  progress: UserProgress;
  language?: LanguageCode;
  onPlayChallenge: (challenge: ChallengeInfo) => void;
}

export const ChallengeScreen: React.FC<Props> = ({ progress, language = 'en', onPlayChallenge }) => {
  const activeChallenge = getActiveChallenge();
  const isCompleted = progress.completedChallenges.includes(activeChallenge.id);

  const t = (key: string) => getTranslation(language, key);

  const handleStart = (challenge: ChallengeInfo) => {
    soundManager.playTap();
    onPlayChallenge(challenge);
  };

  return (
    <div className="w-full min-h-[calc(100vh-70px)] bg-white text-slate-900 flex flex-col p-4 pb-24 space-y-5 select-none">
      {/* Title */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="pt-2 px-1"
      >
        <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
          {t('challenges')}
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5">
          {t('challengeSubtitle')}
        </p>
      </motion.div>

      {/* Main Hero Challenge Card */}
      <motion.div 
        initial={{ opacity: 0, y: 22, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 280, delay: 0.05 }}
        className="p-6 rounded-3xl bg-slate-50 border border-slate-100/90 shadow-sm relative overflow-hidden space-y-4"
      >
        {/* Badge & Expiration */}
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('currentChallenge')}</span>
          </span>

          <span className="text-xs font-semibold text-slate-400">
            {activeChallenge.expiresIn || 'Active'}
          </span>
        </div>

        {/* Illustration & Title */}
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-center text-3xl shrink-0">
            {activeChallenge.icon}
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 leading-tight">
              {activeChallenge.title}
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">
              {activeChallenge.subtitle}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 bg-white p-3.5 rounded-2xl border border-slate-100 leading-relaxed font-medium">
          {activeChallenge.description}
        </p>

        {/* Specifications grid */}
        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div className="p-2.5 rounded-2xl bg-white border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">{t('gridSize')}</span>
            <span className="text-sm font-black text-slate-800">
              {activeChallenge.gridSize}x{activeChallenge.gridSize}
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-white border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">{t('difficulty')}</span>
            <span className="text-sm font-black text-blue-600 capitalize">
              {activeChallenge.difficulty}
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-white border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">{t('reward')}</span>
            <span className="text-sm font-black text-amber-600">
              +{activeChallenge.rewardHints} {t('hints')}
            </span>
          </div>
        </div>

        {/* Play Challenge Button */}
        <motion.button
          id="btn-play-challenge"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.88 }}
          onClick={() => handleStart(activeChallenge)}
          className={`btn-bouncy w-full py-4 rounded-full font-black text-base flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
            isCompleted
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
          }`}
        >
          {isCompleted ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{t('challengeCompleted')}</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-white text-white translate-x-0.5" />
              <span>{t('playChallenge')}</span>
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Other Special Expeditions Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 280, delay: 0.12 }}
        className="space-y-3 pt-2"
      >
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1 flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5 text-blue-600" />
          <span>{t('challenges')}</span>
        </h3>

        <div className="space-y-2.5">
          {EXPEDITION_CHALLENGES.filter(c => c.id !== activeChallenge.id).map((challenge, idx) => {
            const isDone = progress.completedChallenges.includes(challenge.id);

            return (
              <motion.div
                key={`expedition-${challenge.id}`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 280, delay: 0.15 + idx * 0.05 }}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center text-xl shadow-xs shrink-0">
                    {challenge.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-tight">
                      {challenge.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {challenge.gridSize}x{challenge.gridSize} • {challenge.difficulty}
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleStart(challenge)}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-blue-600 border border-blue-200 text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  {isDone ? t('challengeCompleted') : t('play')}
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
