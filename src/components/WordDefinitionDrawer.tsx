import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, X, Volume2, Sparkles, CheckCircle } from 'lucide-react';
import { PlacedWord } from '../types';
import { soundManager } from '../services/sound';

interface Props {
  word: PlacedWord | null;
  onClose: () => void;
}

export const WordDefinitionDrawer: React.FC<Props> = ({ word, onClose }) => {
  if (!word) return null;

  const handleSpeak = () => {
    soundManager.playTap();
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word.word.toLowerCase());
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <AnimatePresence>
      <div 
        id="word-definition-backdrop"
        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 select-none"
        onClick={onClose}
      >
        <motion.div
          id="word-definition-drawer"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="w-full max-w-md bg-white border-t sm:border border-slate-100 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl text-slate-900 relative max-h-[85vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header pill bar */}
          <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden" />

          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-600" /> Discovered
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {word.category}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-wide text-slate-900 flex items-center gap-3">
                {word.word}
                <button
                  id="btn-speak-word"
                  onClick={handleSpeak}
                  className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
                  title="Listen pronunciation"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </h2>
            </div>
            <button
              id="btn-close-definition"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" /> Definition
              </div>
              <p className="text-sm leading-relaxed text-slate-700">
                {word.definition || `A key word belonging to the ${word.category} topic.`}
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Example
              </div>
              <p className="text-sm italic leading-relaxed text-slate-600">
                "{word.example || `You discovered the word ${word.word} during your adventure.`}"
              </p>
            </div>
          </div>

          <motion.button
            id="btn-got-it-definition"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="w-full mt-6 py-3.5 px-4 rounded-full font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-colors cursor-pointer text-sm"
          >
            Continue Playing
          </motion.button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
