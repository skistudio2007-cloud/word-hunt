import React from 'react';
import { motion } from 'motion/react';
import { Home, Compass, Swords, Settings } from 'lucide-react';
import { NavigationTab, LanguageCode } from '../types';
import { soundManager } from '../services/sound';
import { getTranslation } from '../services/localization';

interface Props {
  activeTab: NavigationTab;
  language?: LanguageCode;
  onSelectTab: (tab: NavigationTab) => void;
}

interface TabItem {
  id: NavigationTab;
  translationKey: string;
  defaultLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabItem[] = [
  { id: 'HOME', translationKey: 'home', defaultLabel: 'Home', icon: Home },
  { id: 'COLLECTION', translationKey: 'collection', defaultLabel: 'Collection', icon: Compass },
  { id: 'CHALLENGE', translationKey: 'challenge', defaultLabel: 'Challenge', icon: Swords },
  { id: 'SETTINGS', translationKey: 'settings', defaultLabel: 'Settings', icon: Settings },
];

export const BottomNav: React.FC<Props> = ({ activeTab, language = 'en', onSelectTab }) => {
  return (
    <nav
      aria-label="Main Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100/90 shadow-[0_-4px_24px_rgba(15,23,42,0.04)] pb-[max(env(safe-area-inset-bottom),8px)] pt-2"
    >
      <div className="max-w-[440px] mx-auto px-4 flex items-center justify-around">
        {TABS.map(tab => {
          const isSelected = activeTab === tab.id;
          const Icon = tab.icon;
          const label = getTranslation(language, tab.translationKey) || tab.defaultLabel;

          return (
            <motion.button
              key={`bottom-tab-${tab.id}`}
              id={`nav-tab-${tab.id.toLowerCase()}`}
              whileTap={{ scale: 0.82 }}
              onClick={() => {
                if (activeTab !== tab.id) {
                  soundManager.playTap();
                  onSelectTab(tab.id);
                }
              }}
              className={`btn-bouncy relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-colors duration-200 cursor-pointer select-none min-w-[72px] ${
                isSelected
                  ? 'text-blue-600 font-bold'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50/60'
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="active-tab-indicator"
                  className="absolute inset-0 bg-blue-50 rounded-2xl -z-10 border border-blue-100 shadow-2xs"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
              <motion.div
                animate={isSelected ? { scale: [1, 1.3, 0.88, 1.1, 1] } : { scale: 1 }}
                transition={{ duration: 0.42, ease: 'easeOut' }}
                className="relative"
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isSelected ? 'stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />
              </motion.div>
              <span
                className={`text-[11px] mt-1 tracking-tight transition-all duration-200 ${
                  isSelected ? 'font-bold text-blue-600' : 'font-medium text-slate-500'
                }`}
              >
                {label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};
