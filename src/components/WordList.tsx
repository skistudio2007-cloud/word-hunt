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

interface WordItemProps {
  word: PlacedWord;
  index: number;
  highContrast: boolean;
  onSelect: (word: PlacedWord) => void;
}

const TargetWordItem: React.FC<WordItemProps> = ({ word, index, highContrast, onSelect }) => {
  const wasFoundRef = React.useRef(word.found);
  const [isJustFound, setIsJustFound] = React.useState(false);

  React.useEffect(() => {
    if (!wasFoundRef.current && word.found) {
      wasFoundRef.current = true;
      setIsJustFound(true);
      const timer = setTimeout(() => setIsJustFound(false), 500);
      return () => clearTimeout(timer);
    }
  }, [word.found]);

  return (
    <motion.button
      key={`target-word-${word.id || index}`}
      id={`target-word-pill-${word.word.toLowerCase()}`}
      onClick={() => {
        if (word.found) {
          soundManager.playTap();
          onSelect(word);
        }
      }}
      initial={{ scale: 0.8, opacity: 0, y: 6 }}
      animate={
        isJustFound
          ? { scale: [1, 1.2, 0.94, 1.04, 1], opacity: 1, y: 0 }
          : { scale: 1, opacity: 1, y: 0 }
      }
      transition={
        isJustFound
          ? { duration: 0.4, ease: 'easeOut' }
          : { type: 'spring', stiffness: 420, damping: 24, delay: index * 0.03 }
      }
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      className={`group relative px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-black tracking-wider transition-colors duration-200 flex items-center gap-1.5 cursor-pointer shadow-xs ${
        word.found
          ? 'bg-slate-100/90 text-slate-400 line-through border border-slate-200'
          : highContrast
          ? 'bg-white text-slate-900 border-2 border-slate-900'
          : 'bg-white text-slate-900 border border-slate-200 hover:border-blue-400'
      }`}
      title={word.found ? 'Tap to view definition' : undefined}
    >
      {word.found ? (
        <>
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: word.color || '#2563EB' }}
          />
          <span>{word.word}</span>
          <div className="flex items-center">
            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3] ml-0.5" />
          </div>
          <Info className="w-3 h-3 text-slate-400 group-hover:text-blue-600 transition-colors" />
        </>
      ) : (
        <span>{word.word}</span>
      )}
    </motion.button>
  );
};

export const WordList: React.FC<Props> = ({ words, onSelectWordForInfo, highContrast = false }) => {
  return (
    <div className="w-full max-w-[440px] mx-auto px-3 py-2 select-none">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {words.map((w, idx) => (
          <TargetWordItem
            key={`word-item-${w.id || idx}`}
            word={w}
            index={idx}
            highContrast={highContrast}
            onSelect={onSelectWordForInfo}
          />
        ))}
      </div>
    </div>
  );
};
