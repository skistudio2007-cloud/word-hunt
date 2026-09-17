import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Lightbulb, Pause, Star, Video } from 'lucide-react';
import { soundManager } from '../services/sound';
import { LanguageCode } from '../types';
import { getTranslation } from '../services/localization';

interface Props {
  levelNumber: number;
  themeName: string;
  starsCount: number;
  freeHintsRemaining: number;
  purchasedHints: number;
  language?: LanguageCode;
  isDaily?: boolean;
  onBack: () => void;
  onUseHint: () => void;
  onPause?: () => void;
}

export const TopHeader: React.FC<Props> = ({
  levelNumber,
  themeName,
  starsCount,
  freeHintsRemaining,
  purchasedHints,
  language = 'en',
  isDaily = false,
  onBack,
  onUseHint,
  onPause
}) => {
  const levelText = getTranslation(language, 'level') || 'LEVEL';

  // Label for Hint button
  const hasPurchasedHint = purchasedHints > 0;

  return (
    <header className="w-full max-w-[440px] mx-auto px-4 py-2.5 flex items-center justify-between text-slate-900 select-none">
      {/* Back Button */}
      <motion.button
        id="btn-header-back"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.86 }}
        onClick={() => {
          soundManager.playTap();
          onBack();
        }}
        className="btn-bouncy w-10 h-10 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 shadow-sm border border-slate-200 flex items-center justify-center transition-colors cursor-pointer"
        title="Go back"
      >
        <ArrowLeft className="w-5 h-5" />
      </motion.button>

      {/* Level & Category Badge */}
      <motion.div 
        whileTap={{ scale: 0.92 }}
        className="flex flex-col items-center cursor-pointer"
      >
        <div className="flex items-center gap-1.5">
          <span className="text-xs uppercase font-black tracking-wider text-slate-900 drop-shadow-xs">
            {isDaily ? 'EXPEDITION' : `${levelText.toUpperCase()} ${levelNumber}`}
          </span>
          {!isDaily && (
            <div className="flex items-center gap-0.5 text-amber-500 font-black text-xs">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{starsCount}</span>
            </div>
          )}
        </div>
        <div className="mt-0.5 px-3 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 text-[11px] font-bold uppercase tracking-wider shadow-2xs">
          {themeName}
        </div>
      </motion.div>

      {/* Hint & Pause Buttons */}
      <div className="flex items-center gap-2">
        <motion.button
          id="btn-header-hint"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.86 }}
          onClick={() => {
            soundManager.playTap();
            onUseHint();
          }}
          className={`btn-bouncy relative px-3.5 py-2 rounded-2xl text-white font-black text-xs flex items-center gap-1.5 shadow-md transition-colors cursor-pointer ${
            hasPurchasedHint
              ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/20'
          }`}
          title={hasPurchasedHint ? `Use Hint (${purchasedHints} left)` : 'Watch Google Rewarded Ad for Hint'}
        >
          {hasPurchasedHint ? (
            <>
              <Lightbulb className="w-4 h-4 fill-white" />
              <span>Hint ({purchasedHints})</span>
            </>
          ) : (
            <>
              <Video className="w-4 h-4 fill-white" />
              <span>Ad Hint</span>
              <span className="anim-bouncy-wobble px-1 py-0.2 rounded bg-amber-400 text-slate-950 text-[9px] font-black leading-tight inline-block">
                AD
              </span>
            </>
          )}
        </motion.button>

        {onPause && (
          <motion.button
            id="btn-header-pause"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.86 }}
            onClick={() => {
              soundManager.playTap();
              onPause();
            }}
            className="btn-bouncy w-10 h-10 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 shadow-sm border border-slate-200 flex items-center justify-center transition-colors cursor-pointer"
            title="Pause game"
          >
            <Pause className="w-4 h-4" />
          </motion.button>
        )}
      </div>
    </header>
  );
};
