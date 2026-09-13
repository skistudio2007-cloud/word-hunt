import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Sparkles, Lock, CheckCircle2 } from 'lucide-react';
import { UserProgress } from '../types';
import { INITIAL_COLLECTIONS } from '../data/collections';
import { soundManager } from '../services/sound';

interface Props {
  progress: UserProgress;
  onBack: () => void;
}

export const CollectionModal: React.FC<Props> = ({ progress, onBack }) => {
  const items = INITIAL_COLLECTIONS.map(item => ({
    ...item,
    isUnlocked: item.unlockedAtLevel ? progress.highestLevelUnlocked >= item.unlockedAtLevel : false
  }));

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full min-h-screen bg-black text-neutral-100 flex flex-col max-w-[440px] mx-auto select-none"
    >
      <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-neutral-800 px-4 py-3 flex items-center justify-between">
        <motion.button
          id="btn-collection-back"
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
          <Sparkles className="w-4 h-4 text-white" />
          <span>EXPEDITION COLLECTION</span>
        </h2>

        <div className="w-10" />
      </header>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto pb-16">
        <div className="grid grid-cols-2 gap-3">
          {items.map(item => {
            return (
              <div
                key={`col-${item.id}`}
                className={`p-4 rounded-3xl border text-center transition-colors flex flex-col justify-between ${
                  item.isUnlocked
                    ? 'bg-neutral-900 border-neutral-700 shadow-lg shadow-white/5'
                    : 'bg-neutral-950/40 border-neutral-900 opacity-50'
                }`}
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-neutral-800 border border-neutral-700 mx-auto flex items-center justify-center text-3xl mb-3 shadow-inner relative">
                    {item.isUnlocked ? (
                      <span>{item.icon}</span>
                    ) : (
                      <Lock className="w-6 h-6 text-neutral-600" />
                    )}
                    {item.isUnlocked && (
                      <CheckCircle2 className="w-4 h-4 text-white bg-black rounded-full absolute -top-1 -right-1" />
                    )}
                  </div>

                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-1">
                    {item.category}
                  </span>
                  <h4 className="text-sm font-black text-white leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-neutral-800">
                  {item.isUnlocked ? (
                    <span className="text-[10px] font-black text-white uppercase">
                      ✓ Collected
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-neutral-500">
                      Unlocks at Level {item.unlockedAtLevel}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
