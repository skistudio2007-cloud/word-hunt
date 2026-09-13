import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ShoppingBag, ShieldCheck, Sparkles, Gift, Tv, Check } from 'lucide-react';
import { soundManager } from '../services/sound';

interface Props {
  hasRemovedAds: boolean;
  onRemoveAds: () => void;
  onBuyHintPack: (letterCount: number, wordCount: number, autoCount: number, xp: number) => void;
  onWatchRewardedAd: () => void;
  onBack: () => void;
}

export const ShopModal: React.FC<Props> = ({
  hasRemovedAds,
  onRemoveAds,
  onBuyHintPack,
  onWatchRewardedAd,
  onBack
}) => {
  const [purchaseFeedback, setPurchaseFeedback] = useState<string | null>(null);

  const triggerFeedback = (msg: string) => {
    soundManager.playLevelVictory();
    setPurchaseFeedback(msg);
    setTimeout(() => setPurchaseFeedback(null), 3000);
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
          id="btn-shop-back"
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
          <ShoppingBag className="w-4 h-4 text-white" />
          <span>EXPEDITION SHOP</span>
        </h2>

        <div className="w-10" />
      </header>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto pb-16">
        {purchaseFeedback && (
          <div className="p-3.5 rounded-2xl bg-neutral-900 border border-white/40 text-white text-xs font-black text-center animate-bounce">
            ✓ {purchaseFeedback}
          </div>
        )}

        {/* Remove Ads Card */}
        <div className="p-5 rounded-3xl bg-neutral-950 border border-neutral-800 shadow-xl relative overflow-hidden">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  $1.99 / MONTH
                </span>
                <h3 className="text-lg font-black text-white mt-1">Remove Ads</h3>
                <p className="text-xs text-neutral-400">$1.99 per month • Enjoy uninterrupted ad-free offline gameplay.</p>
              </div>
            </div>
          </div>

          <motion.button
            disabled={hasRemovedAds}
            whileHover={!hasRemovedAds ? { scale: 1.02 } : {}}
            whileTap={!hasRemovedAds ? { scale: 0.98 } : {}}
            onClick={() => {
              onRemoveAds();
              triggerFeedback('Subscribed! Ad-Free Pass active ($1.99/mo).');
            }}
            className={`w-full py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              hasRemovedAds
                ? 'bg-neutral-900 text-neutral-400 border border-neutral-800 cursor-default'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
            }`}
          >
            {hasRemovedAds ? <Check className="w-4 h-4 text-emerald-400" /> : null}
            <span>{hasRemovedAds ? 'SUBSCRIBED ($1.99/MO) • ACTIVE' : 'SUBSCRIBE FOR $1.99 / MONTH'}</span>
          </motion.button>
        </div>

        {/* Free Daily / Rewarded Bonus */}
        <div className="p-4 rounded-3xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 text-white">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white">Daily Sponsor Gift</h4>
              <p className="text-xs text-neutral-400">Watch short sponsor clip for +1 hint</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              soundManager.playTap();
              onWatchRewardedAd();
              triggerFeedback('+1 Free Hint added to your backpack!');
            }}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-black transition-colors cursor-pointer"
          >
            Claim (+1)
          </motion.button>
        </div>

        {/* Hint Packs */}
        <div className="space-y-3">
          <h4 className="text-xs font-black text-neutral-400 uppercase tracking-wider">
            Curator Bundles
          </h4>

          {/* Starter Pack */}
          <div className="p-4 rounded-3xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-white/10 text-white">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white">Explorer Starter Pack</h4>
                <p className="text-xs text-neutral-400">+3 Letters, +3 Clues, +2 Auto-Solves</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                onBuyHintPack(3, 3, 2, 100);
                triggerFeedback('Starter Pack added!');
              }}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-black text-xs shadow-md transition-colors cursor-pointer"
            >
              Claim Pack
            </motion.button>
          </div>

          {/* Master Explorer Bundle */}
          <div className="p-4 rounded-3xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-white/10 text-white">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white">Master Navigator Bundle</h4>
                <p className="text-xs text-neutral-400">+10 Letters, +10 Clues, +10 Auto-Solves, +500 XP</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                onBuyHintPack(10, 10, 10, 500);
                triggerFeedback('Master Navigator Bundle loaded!');
              }}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-black text-xs shadow-md transition-colors cursor-pointer"
            >
              Claim Bundle
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
