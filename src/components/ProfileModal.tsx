import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, User, Star, Trophy, Flame, BookOpen, Edit2 } from 'lucide-react';
import { UserProgress } from '../types';
import { soundManager } from '../services/sound';

interface Props {
  progress: UserProgress;
  onUpdateName: (name: string) => void;
  onBack: () => void;
}

export const ProfileModal: React.FC<Props> = ({ progress, onUpdateName, onBack }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(progress.playerName);

  const handleSaveName = () => {
    if (nameInput.trim()) {
      onUpdateName(nameInput.trim());
      setIsEditing(false);
      soundManager.playTap();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full min-h-screen bg-black text-neutral-100 flex flex-col max-w-[440px] mx-auto select-none"
    >
      <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-neutral-800 px-4 py-3 flex items-center justify-between">
        <motion.button
          id="btn-profile-back"
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
          <User className="w-4 h-4 text-white" />
          <span>PLAYER PROFILE</span>
        </h2>

        <div className="w-10" />
      </header>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto pb-16">
        {/* Profile Card */}
        <div className="p-6 rounded-3xl bg-neutral-950 border border-neutral-800 shadow-xl text-center space-y-3">
          <div className="w-20 h-20 rounded-3xl bg-neutral-900 border-2 border-neutral-700 p-1 mx-auto flex items-center justify-center text-3xl shadow-xl shadow-white/5">
            🎓
          </div>

          <div>
            {isEditing ? (
              <div className="flex items-center justify-center gap-2 max-w-xs mx-auto">
                <input
                  type="text"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  maxLength={16}
                  className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-white/40 text-white font-bold text-center text-base focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="px-3 py-1.5 rounded-xl bg-white text-black font-black text-xs cursor-pointer"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1.5">
                <h3 className="text-xl font-black text-white">{progress.playerName}</h3>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 text-neutral-400 hover:text-white cursor-pointer transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <span className="text-xs font-bold text-neutral-400 mt-0.5 block">
              Level {progress.currentLevel} Explorer
            </span>
          </div>
        </div>

        {/* Career Statistics */}
        <div className="p-5 rounded-3xl bg-neutral-950 border border-neutral-800 space-y-3">
          <h4 className="text-xs font-black text-neutral-400 uppercase tracking-wider">
            Career Statistics
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-neutral-900 p-3.5 rounded-2xl border border-neutral-800">
              <span className="text-xs text-neutral-400 font-bold flex items-center gap-1.5 mb-1">
                <Trophy className="w-3.5 h-3.5 text-white" /> Puzzles Solved
              </span>
              <span className="text-xl font-black text-white">
                {progress.stats.puzzlesSolved}
              </span>
            </div>

            <div className="bg-neutral-900 p-3.5 rounded-2xl border border-neutral-800">
              <span className="text-xs text-neutral-400 font-bold flex items-center gap-1.5 mb-1">
                <BookOpen className="w-3.5 h-3.5 text-white" /> Words Found
              </span>
              <span className="text-xl font-black text-white">
                {progress.stats.wordsFound}
              </span>
            </div>

            <div className="bg-neutral-900 p-3.5 rounded-2xl border border-neutral-800">
              <span className="text-xs text-neutral-400 font-bold flex items-center gap-1.5 mb-1">
                <Star className="w-3.5 h-3.5 text-white" /> Total Stars
              </span>
              <span className="text-xl font-black text-white">
                {progress.totalStars}
              </span>
            </div>

            <div className="bg-neutral-900 p-3.5 rounded-2xl border border-neutral-800">
              <span className="text-xs text-neutral-400 font-bold flex items-center gap-1.5 mb-1">
                <Flame className="w-3.5 h-3.5 text-white" /> Best Streak
              </span>
              <span className="text-xl font-black text-white">
                {progress.stats.bestStreak}d
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
