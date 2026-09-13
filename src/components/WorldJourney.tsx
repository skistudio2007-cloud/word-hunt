import React, { useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Lock, Star, Play, Compass } from 'lucide-react';
import { UserProgress } from '../types';
import { WORLDS } from '../data/worlds';
import { soundManager } from '../services/sound';

interface Props {
  progress: UserProgress;
  onSelectLevel: (level: number) => void;
  onBack: () => void;
}

export const WorldJourney: React.FC<Props> = ({ progress, onSelectLevel, onBack }) => {
  const currentLevelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Smoothly scroll to current level
    if (currentLevelRef.current) {
      setTimeout(() => {
        currentLevelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full min-h-screen bg-black text-neutral-100 flex flex-col max-w-[440px] mx-auto select-none"
    >
      {/* Fixed Sticky Header */}
      <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-neutral-800 px-4 py-3 flex items-center justify-between shadow-md">
        <motion.button
          id="btn-journey-back"
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
            <Compass className="w-4 h-4 text-white" />
            <span>WORLD EXPEDITION</span>
          </h2>
          <div className="text-[11px] font-bold text-neutral-400 flex items-center justify-center gap-1">
            <Star className="w-3 h-3 fill-white text-white" />
            <span>{progress.totalStars} Stars Earned</span>
          </div>
        </div>

        <div className="w-10" />
      </header>

      {/* World Progression List */}
      <div className="flex-1 p-4 space-y-6 overflow-y-auto pb-20">
        {WORLDS.map((world) => {
          const isUnlocked = progress.highestLevelUnlocked >= world.startLevel;
          const isCurrentWorld =
            progress.currentLevel >= world.startLevel && progress.currentLevel <= world.endLevel;

          // Generate level node range for this world
          const levelCount = Math.min(world.endLevel - world.startLevel + 1, 20);
          const levelNumbers = Array.from({ length: levelCount }, (_, i) => world.startLevel + i);

          return (
            <div
              key={`world-${world.id}`}
              className={`rounded-3xl border transition-all relative overflow-hidden ${
                isUnlocked
                  ? 'bg-neutral-950 border-neutral-800 shadow-xl'
                  : 'bg-neutral-950/40 border-neutral-900 opacity-50'
              }`}
            >
              {/* World Header Banner */}
              <div className="p-5 bg-neutral-900 border-b border-neutral-800 relative overflow-hidden">
                <div className="flex items-start justify-between relative z-10">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-white/10 text-white">
                        WORLD {world.id}
                      </span>
                      {isCurrentWorld && (
                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-white text-black">
                          CURRENT
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-black text-white">
                      {world.name}
                    </h3>
                    <p className="text-xs text-neutral-400 font-medium">
                      {world.subtitle}
                    </p>
                  </div>

                  <div className="text-xl p-2.5 rounded-2xl bg-neutral-800 border border-neutral-700">
                    {isUnlocked ? world.bgDecorations[0] || '✦' : <Lock className="w-5 h-5 text-neutral-500" />}
                  </div>
                </div>

                {/* Level range tag */}
                <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-neutral-400">
                  <span>Levels {world.startLevel} – {world.endLevel}</span>
                  <span>{world.themeCategories.join(' • ')}</span>
                </div>
              </div>

              {/* Level Nodes Grid */}
              <div className="p-5">
                {!isUnlocked ? (
                  <div className="py-6 text-center space-y-2">
                    <Lock className="w-7 h-7 text-neutral-600 mx-auto" />
                    <p className="text-xs font-semibold text-neutral-500">
                      Reach Level {world.startLevel} to unlock {world.name}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                    {levelNumbers.map(lvl => {
                      const isCompleted = !!progress.completedLevels[lvl];
                      const stars = progress.completedLevels[lvl]?.stars || 0;
                      const isCurrent = progress.currentLevel === lvl;
                      const isLvlUnlocked = lvl <= progress.highestLevelUnlocked;

                      return (
                        <div
                          key={`node-lvl-${lvl}`}
                          ref={isCurrent ? currentLevelRef : null}
                          className="flex flex-col items-center"
                        >
                          <motion.button
                            id={`btn-journey-lvl-${lvl}`}
                            disabled={!isLvlUnlocked}
                            whileHover={isLvlUnlocked ? { scale: 1.08 } : {}}
                            whileTap={isLvlUnlocked ? { scale: 0.92 } : {}}
                            onClick={() => {
                              soundManager.playTap();
                              onSelectLevel(lvl);
                            }}
                            className={`w-13 h-13 rounded-2xl flex flex-col items-center justify-center font-black transition-all relative cursor-pointer ${
                              isCurrent
                                ? 'bg-white text-black shadow-lg shadow-white/20 ring-2 ring-white scale-105'
                                : isCompleted
                                ? 'bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 text-white'
                                : isLvlUnlocked
                                ? 'bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300'
                                : 'bg-neutral-950 border border-neutral-900 text-neutral-700 cursor-not-allowed'
                            }`}
                          >
                            {isCurrent ? (
                              <Play className="w-5 h-5 fill-black text-black" />
                            ) : isCompleted || isLvlUnlocked ? (
                              <span className="text-sm font-black">{lvl}</span>
                            ) : (
                              <Lock className="w-4 h-4 text-neutral-700" />
                            )}
                          </motion.button>

                          {/* Star rating under node */}
                          {isCompleted && (
                            <div className="flex gap-0.5 mt-1">
                              {[1, 2, 3].map(s => (
                                <Star
                                  key={`lvl-${lvl}-star-${s}`}
                                  className={`w-2.5 h-2.5 ${
                                    s <= stars ? 'fill-white text-white' : 'text-neutral-700'
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
