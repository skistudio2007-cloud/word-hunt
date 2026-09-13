import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Calendar, 
  Trophy, 
  Sparkles, 
  Settings, 
  ShoppingBag, 
  Compass, 
  Star,
  Search,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { UserProgress, UserSettings } from '../types';
import { getWorldForLevel } from '../data/worlds';
import { soundManager } from '../services/sound';

interface Props {
  progress: UserProgress;
  settings: UserSettings;
  onPlay: () => void;
  onOpenWorldMap: () => void;
  onOpenDailyPuzzle: () => void;
  onOpenAchievements: () => void;
  onOpenCollection: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onOpenShop: () => void;
}

export const MainMenu: React.FC<Props> = ({
  progress,
  onPlay,
  onOpenWorldMap,
  onOpenDailyPuzzle,
  onOpenAchievements,
  onOpenCollection,
  onOpenProfile,
  onOpenSettings,
  onOpenShop
}) => {
  const currentWorld = getWorldForLevel(progress.currentLevel);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full min-h-screen bg-black flex flex-col justify-between p-4 max-w-[440px] mx-auto text-neutral-100 select-none relative"
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-4 right-4 z-50 bg-neutral-900 border border-neutral-700 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Profile & Status Bar */}
      <header className="flex items-center justify-between gap-2 pt-2">
        {/* Avatar & Player Info */}
        <motion.button
          id="btn-main-profile"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            soundManager.playTap();
            onOpenProfile();
          }}
          className="flex items-center gap-2.5 bg-neutral-900 hover:bg-neutral-800 p-1.5 pr-3 rounded-2xl border border-neutral-800 shadow-md text-left transition-colors cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center text-lg font-black shadow-inner">
            🎓
          </div>
          <div>
            <div className="text-xs font-black text-white leading-tight flex items-center gap-1">
              <span>{progress.playerName}</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-black text-white bg-white/10 px-1.5 py-0.5 rounded-md border border-white/20">
                Lvl {progress.currentLevel}
              </span>
              <span className="text-[10px] font-bold text-neutral-400">
                {progress.xp} XP
              </span>
            </div>
          </div>
        </motion.button>

        {/* Quick Currency / Stats + Settings */}
        <div className="flex items-center gap-2">
          {/* Star Counter */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900 rounded-2xl border border-neutral-800 shadow-md">
            <Star className="w-4 h-4 text-white fill-white" />
            <span className="text-xs font-black text-white">{progress.totalStars}</span>
          </div>

          {/* Settings Button */}
          <motion.button
            id="btn-main-settings"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              soundManager.playTap();
              onOpenSettings();
            }}
            className="w-10 h-10 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 flex items-center justify-center text-neutral-300 hover:text-white transition-colors shadow-md cursor-pointer"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </motion.button>
        </div>
      </header>

      {/* Main Center Logo & World Teaser */}
      <div className="my-auto py-4 text-center space-y-4">
        {/* Animated Brand Emblem & Logo */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-2.5"
        >
          <motion.div 
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white text-black p-0.5 shadow-2xl shadow-white/10 mx-auto"
          >
            <div className="w-full h-full bg-black rounded-[22px] flex items-center justify-center relative overflow-hidden border border-neutral-800">
              <Search className="w-9 h-9 text-white" strokeWidth={2.5} />
              <Sparkles className="w-4 h-4 text-white absolute top-2 right-2 animate-pulse" />
            </div>
          </motion.div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white font-sans">
            WORD HUNT
          </h1>

          <p className="text-xs font-bold tracking-widest text-neutral-400 uppercase">
            Find • Learn • Explore
          </p>
        </motion.div>

        {/* Current World Journey Badge */}
        <motion.button
          id="btn-current-world-badge"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            soundManager.playTap();
            onOpenWorldMap();
          }}
          className="mx-auto inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 shadow-lg transition-colors cursor-pointer"
        >
          <Compass className="w-4 h-4 text-white" />
          <div className="text-left">
            <div className="text-[10px] uppercase font-bold text-neutral-400">Current Journey</div>
            <div className="text-xs font-black text-white">{currentWorld.name} (Lvl {progress.currentLevel})</div>
          </div>
        </motion.button>

        {/* Big Touch-Friendly PLAY Button */}
        <div className="pt-2 max-w-xs mx-auto">
          <motion.button
            id="btn-main-play"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              soundManager.playTap();
              onPlay();
            }}
            className="w-full py-4.5 px-6 rounded-3xl font-black text-xl bg-white hover:bg-neutral-200 text-black shadow-2xl shadow-white/20 flex items-center justify-center gap-3 cursor-pointer transition-colors"
          >
            <Play className="w-6 h-6 fill-black text-black" />
            <span className="tracking-wide">PLAY NOW</span>
          </motion.button>
        </div>

        {/* Feature Grid Buttons (Daily, Journey, Achievements, Collection) */}
        <div className="grid grid-cols-2 gap-3 pt-2 max-w-xs mx-auto">
          {/* Daily Puzzle */}
          <motion.button
            id="btn-main-daily"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              soundManager.playTap();
              onOpenDailyPuzzle();
            }}
            className="p-3.5 rounded-2xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 shadow-lg flex flex-col items-center gap-1.5 transition-colors cursor-pointer"
          >
            <div className="p-2 rounded-xl bg-white/10 text-white">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-white">Daily Puzzle</span>
            {progress.stats.currentStreak > 0 ? (
              <span className="text-[10px] font-bold text-neutral-300 flex items-center gap-0.5">
                <Flame className="w-3 h-3 text-white" /> {progress.stats.currentStreak}d Streak
              </span>
            ) : (
              <span className="text-[10px] font-bold text-neutral-400">Fresh daily</span>
            )}
          </motion.button>

          {/* World Journey Map */}
          <motion.button
            id="btn-main-journey"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              soundManager.playTap();
              onOpenWorldMap();
            }}
            className="p-3.5 rounded-2xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 shadow-lg flex flex-col items-center gap-1.5 transition-colors cursor-pointer"
          >
            <div className="p-2 rounded-xl bg-white/10 text-white">
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-white">World Map</span>
            <span className="text-[10px] font-bold text-neutral-400">
              {currentWorld.name}
            </span>
          </motion.button>

          {/* Achievements */}
          <motion.button
            id="btn-main-achievements"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              soundManager.playTap();
              onOpenAchievements();
            }}
            className="p-3.5 rounded-2xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 shadow-lg flex flex-col items-center gap-1.5 transition-colors cursor-pointer"
          >
            <div className="p-2 rounded-xl bg-white/10 text-white">
              <Trophy className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-white">Achievements</span>
            <span className="text-[10px] font-bold text-neutral-400">Trophies & Badges</span>
          </motion.button>

          {/* Collection / Cards */}
          <motion.button
            id="btn-main-collection"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              soundManager.playTap();
              onOpenCollection();
            }}
            className="p-3.5 rounded-2xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 shadow-lg flex flex-col items-center gap-1.5 transition-colors cursor-pointer"
          >
            <div className="p-2 rounded-xl bg-white/10 text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-white">Collection</span>
            <span className="text-[10px] font-bold text-neutral-400">Postcards & Seals</span>
          </motion.button>
        </div>

        {/* Shop banner */}
        <div className="pt-1 max-w-xs mx-auto">
          <motion.button
            id="btn-main-shop"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              soundManager.playTap();
              onOpenShop();
            }}
            className="w-full py-2.5 px-4 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-black text-white flex items-center justify-between transition-colors cursor-pointer shadow-md"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-white" />
              <span>Hint Shop & Perks</span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-white text-black font-black">
              Offers
            </span>
          </motion.button>
        </div>
      </div>

      {/* Bottom Auxiliary Links */}
      <footer className="pt-3 border-t border-neutral-800/80 flex items-center justify-around text-[11px] font-semibold text-neutral-400">
        <button
          id="btn-footer-remove-ads"
          onClick={() => {
            soundManager.playTap();
            onOpenShop();
          }}
          className="hover:text-white transition-colors cursor-pointer"
        >
          {progress.hasRemovedAds ? '✓ No Ads Active' : 'Remove Ads'}
        </button>

        <span>•</span>

        <button
          id="btn-footer-restore"
          onClick={() => {
            soundManager.playTap();
            showToast('Purchases and unlocked worlds are saved on this device.');
          }}
          className="hover:text-white transition-colors cursor-pointer"
        >
          Restore Purchases
        </button>

        <span>•</span>

        <button
          id="btn-footer-privacy"
          onClick={() => {
            soundManager.playTap();
            showToast('Word Hunt respects your privacy: no invasive cookies or tracking.');
          }}
          className="hover:text-white transition-colors cursor-pointer"
        >
          Privacy Policy
        </button>
      </footer>
    </motion.div>
  );
};
