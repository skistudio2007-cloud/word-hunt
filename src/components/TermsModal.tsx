import React from 'react';
import { motion } from 'motion/react';
import { X, FileText } from 'lucide-react';
import { soundManager } from '../services/sound';

interface Props {
  onClose: () => void;
}

export const TermsModal: React.FC<Props> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col space-y-4 max-h-[85vh] overflow-y-auto select-none"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Terms of Service</h3>
          </div>
          <button
            onClick={() => {
              soundManager.playTap();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
          <p className="font-bold text-slate-800">Effective Date: January 1, 2026</p>
          <p>
            Welcome to Word Hunt. By downloading, accessing, or playing our word puzzle game, you agree to these Terms of Service.
          </p>

          <h4 className="font-bold text-slate-800 text-sm">1. License & Game Access</h4>
          <p>
            We grant you a personal, non-exclusive, non-transferable license to play Word Hunt for personal educational and entertainment purposes.
          </p>

          <h4 className="font-bold text-slate-800 text-sm">2. In-App Items & Virtual Rewards</h4>
          <p>
            Hints, stars, badges, and awards earned within the game are purely virtual goods with no monetary value outside of the application.
          </p>

          <h4 className="font-bold text-slate-800 text-sm">3. Fair Play & Fair Content</h4>
          <p>
            All word databases, puzzle algorithms, and level generation systems are proprietary intellectual property designed for fair, accessible play.
          </p>
        </div>

        <button
          onClick={() => {
            soundManager.playTap();
            onClose();
          }}
          className="w-full py-3 rounded-full bg-blue-600 text-white font-bold text-xs cursor-pointer hover:bg-blue-700 transition-colors"
        >
          Close
        </button>
      </motion.div>
    </div>
  );
};
