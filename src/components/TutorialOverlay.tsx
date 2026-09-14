import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { soundManager } from '../services/sound';

interface Props {
  onComplete: () => void;
}

export const TutorialOverlay: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const tutorialSteps = [
    {
      title: 'Find Hidden Words',
      desc: 'Words can be hidden horizontally, vertically, or diagonally in the letter grid.',
      icon: '🔍'
    },
    {
      title: 'Swipe Across Letters',
      desc: 'Press down on the first letter and drag your finger to the final letter.',
      icon: '👆'
    },
    {
      title: 'Learn & Discover',
      desc: 'Tap any found word to view its definition, pronunciation, and sample sentence.',
      icon: '📖'
    },
    {
      title: 'Explore 10,000+ Levels',
      desc: 'Embark through Green Valley, Sunny Beach, Mystic Forest, and beyond!',
      icon: '🌍'
    }
  ];

  const handleNext = () => {
    soundManager.playTap();
    if (step < tutorialSteps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const curr = tutorialSteps[step];

  return (
    <motion.div 
      id="tutorial-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 bg-slate-950/85 flex items-center justify-center p-4 select-none"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`tut-step-${step}`}
          initial={{ scale: 0.92, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-sm bg-neutral-950 border border-neutral-800 rounded-3xl p-6 shadow-2xl text-neutral-100 text-center relative"
        >
          <div className="w-16 h-16 rounded-3xl bg-neutral-900 border-2 border-neutral-700 mx-auto mb-4 flex items-center justify-center text-3xl shadow-xl shadow-white/5">
            {curr.icon}
          </div>

          <h3 className="text-xl font-black text-white mb-1.5">
            {curr.title}
          </h3>

          <p className="text-xs text-neutral-400 leading-relaxed max-w-xs mx-auto mb-6">
            {curr.desc}
          </p>

          {/* Dots progress indicator */}
          <div className="flex justify-center gap-1.5 mb-6">
            {tutorialSteps.map((_, i) => (
              <div
                key={`dot-${i}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? 'w-6 bg-white' : 'w-1.5 bg-neutral-800'
                }`}
              />
            ))}
          </div>

          <motion.button
            id="btn-tutorial-next"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleNext}
            className="w-full py-3.5 px-4 rounded-2xl font-black text-sm bg-white hover:bg-neutral-200 text-black shadow-xl shadow-white/10 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>{step === tutorialSteps.length - 1 ? "LET'S PLAY" : 'NEXT'}</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </motion.button>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};
