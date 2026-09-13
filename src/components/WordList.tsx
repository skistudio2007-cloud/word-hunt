import React from 'react';
import { motion } from 'motion/react';
import { Check, Info } from 'lucide-react';
import { PlacedWord } from '../types';
import { soundManager } from '../services/sound';

interface Props {
  words: PlacedWord[];
  onSelectWordForInfo: (word: PlacedWord) => void;
  highContrast?: boolean;
}

export const WordList: React.FC<Props> = ({ words, onSelectWordForInfo, highContrast = false }) => {
  const handleWordClick = (word: PlacedWord) => {
    if (word.found) {
      soundManager.playTap();
      onSelectWordForInfo(word);
    }
  };

  return (
    <div className="w-full max-w-[440px] mx-auto px-3 py-2 select-none">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {words.map((w, idx) => {
          return (
            <motion.button
              key={`target-word-${w.id || idx}`}
              id={`target-word-pill-${w.word.toLowerCase()}`}
              onClick={() => handleWordClick(w)}
              initial={{ scale: 0.5, opacity: 0, y: 8 }}
              animate={
                w.found
                  ? { scale: [1, 1.25, 0.92, 1.06, 1], opacity: 1, y: 0 }
                  : { scale: 1, opacity: 1, y: 0 }
              }
              transition={
                w.found
                  ? { duration: 0.38, times: [0, 0.3, 0.6, 0.85, 1], ease: 'easeOut' }
                  : { type: 'spring', stiffness: 420, damping: 22, delay: idx * 0.04 }
              }
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className={`group relative px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-black tracking-wider transition-colors duration-200 flex items-center gap-1.5 cursor-pointer shadow-xs ${
                w.found
                  ? 'bg-slate-100/90 text-slate-400 line-through border border-slate-200'
                  : highContrast
                  ? 'bg-white text-slate-900 border-2 border-slate-900'
                  : 'bg-white/95 text-slate-900 border border-slate-200/90 hover:border-blue-400 backdrop-blur-xs'
              }`}
              title={w.found ? 'Tap to view definition' : undefined}
            >
              {w.found ? (
                <>
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 14, delay: 0.05 }}
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: w.color || '#2563EB' }}
                  />
                  <span>{w.word}</span>
                  <motion.div
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 16, delay: 0.08 }}
                    className="flex items-center"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3] ml-0.5" />
                  </motion.div>
                  <Info className="w-3 h-3 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </>
              ) : (
                <span>{w.word}</span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
