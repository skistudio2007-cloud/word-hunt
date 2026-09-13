import React from 'react';
import { motion } from 'motion/react';
import { X, Shield } from 'lucide-react';
import { soundManager } from '../services/sound';

interface Props {
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<Props> = ({ onClose }) => {
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
              <Shield className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Privacy Policy</h3>
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
            Word Hunt is committed to respecting your privacy. This Privacy Policy explains how our mobile word puzzle application handles your data.
          </p>
          
          <h4 className="font-bold text-slate-800 text-sm">1. Data Collection & Offline Play</h4>
          <p>
            Word Hunt is designed to function entirely offline. Your gameplay progress, levels completed, records, and preferences are stored locally on your device storage. We do not collect or transmit personal identifiers to external servers.
          </p>

          <h4 className="font-bold text-slate-800 text-sm">2. Kid & Family Friendly Experience</h4>
          <p>
            Our game adheres to strict family privacy standards. We do not engage in behavioral tracking, geolocation tracking, or profiling of children.
          </p>

          <h4 className="font-bold text-slate-800 text-sm">3. Local Storage</h4>
          <p>
            Game saves and player achievements are maintained securely on your local device storage.
          </p>

          <h4 className="font-bold text-slate-800 text-sm">4. Contact</h4>
          <p>
            If you have questions regarding this privacy policy, you can reach out via our developer settings portal.
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
