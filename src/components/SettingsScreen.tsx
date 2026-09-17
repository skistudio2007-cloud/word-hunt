import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Volume2, 
  VolumeX, 
  Music, 
  Smartphone, 
  Globe, 
  Shield, 
  FileText, 
  Check, 
  Eye
} from 'lucide-react';
import { LanguageCode, UserProgress, UserSettings } from '../types';
import { soundManager } from '../services/sound';
import { getTranslation } from '../services/localization';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import { TermsModal } from './TermsModal';

interface Props {
  settings: UserSettings;
  progress: UserProgress;
  onUpdateSettings: (newSettings: UserSettings) => void;
  onRemoveAds: () => void;
}

const LANGUAGES: { code: LanguageCode; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'id', label: 'Bahasa', flag: '🇮🇩' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
];

export const SettingsScreen: React.FC<Props> = ({
  settings,
  progress,
  onUpdateSettings,
  onRemoveAds,
}) => {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const lang = settings.language;
  const t = (key: string) => getTranslation(lang, key);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const toggleSound = () => {
    soundManager.playTap();
    onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled });
  };

  const toggleMusic = () => {
    soundManager.playTap();
    onUpdateSettings({ ...settings, musicEnabled: !settings.musicEnabled });
  };

  const toggleVibration = () => {
    soundManager.playTap();
    onUpdateSettings({ ...settings, vibrationEnabled: !settings.vibrationEnabled });
  };

  const toggleHighContrast = () => {
    soundManager.playTap();
    onUpdateSettings({ ...settings, highContrast: !settings.highContrast });
  };

  return (
    <div className="w-full min-h-[calc(100vh-70px)] bg-white text-slate-900 flex flex-col p-4 pb-24 space-y-5 select-none">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="pt-2 px-1"
      >
        <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
          {t('settings')}
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5">
          {t('settingsSubtitle')}
        </p>
      </motion.div>

      {toastMessage && (
        <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold text-center animate-bounce">
          ✓ {toastMessage}
        </div>
      )}

      {/* 1. Gameplay & Audio */}
      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 280, delay: 0.04 }}
        className="p-4 rounded-3xl bg-slate-50 border border-slate-100 space-y-3"
      >
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          {t('gameplayAudio')}
        </h3>

        {/* Sound Effects */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-700">
              {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-blue-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">{t('sound')}</div>
              <div className="text-[11px] text-slate-400">{t('soundDesc')}</div>
            </div>
          </div>
          <button
            onClick={toggleSound}
            className={`btn-bouncy w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              settings.soundEnabled ? 'bg-blue-600' : 'bg-slate-200'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white shadow-xs absolute top-1 transition-transform ${
                settings.soundEnabled ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Ambient Music */}
        <div className="flex items-center justify-between py-1 border-t border-slate-200/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-700">
              <Music className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">{t('music')}</div>
              <div className="text-[11px] text-slate-400">{t('musicDesc')}</div>
            </div>
          </div>
          <button
            onClick={toggleMusic}
            className={`btn-bouncy w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              settings.musicEnabled ? 'bg-blue-600' : 'bg-slate-200'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white shadow-xs absolute top-1 transition-transform ${
                settings.musicEnabled ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Vibration / Haptics */}
        <div className="flex items-center justify-between py-1 border-t border-slate-200/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-700">
              <Smartphone className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">{t('vibration')}</div>
              <div className="text-[11px] text-slate-400">{t('vibrationDesc')}</div>
            </div>
          </div>
          <button
            onClick={toggleVibration}
            className={`btn-bouncy w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              settings.vibrationEnabled ? 'bg-blue-600' : 'bg-slate-200'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white shadow-xs absolute top-1 transition-transform ${
                settings.vibrationEnabled ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>
      </motion.div>

      {/* 2. Appearance */}
      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 280, delay: 0.08 }}
        className="p-4 rounded-3xl bg-slate-50 border border-slate-100 space-y-3"
      >
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          {t('appearance')}
        </h3>

        {/* High Contrast */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-700">
              <Eye className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">{t('highContrast')}</div>
              <div className="text-[11px] text-slate-400">{t('highContrastDesc')}</div>
            </div>
          </div>
          <button
            onClick={toggleHighContrast}
            className={`btn-bouncy w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              settings.highContrast ? 'bg-blue-600' : 'bg-slate-200'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white shadow-xs absolute top-1 transition-transform ${
                settings.highContrast ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>
      </motion.div>

      {/* 3. Language Selection */}
      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 280, delay: 0.12 }}
        className="p-4 rounded-3xl bg-slate-50 border border-slate-100 space-y-3"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span>{t('language')}</span>
          </h3>
          <span className="text-[11px] font-bold text-blue-600 uppercase">
            {LANGUAGES.find(l => l.code === settings.language)?.label}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 font-medium">
          {t('languageSubtitle')}
        </p>
        <div className="grid grid-cols-3 gap-2 pt-1">
          {LANGUAGES.map(languageItem => {
            const isSelected = settings.language === languageItem.code;
            return (
              <button
                key={`lang-opt-${languageItem.code}`}
                onClick={() => {
                  soundManager.playTap();
                  onUpdateSettings({ ...settings, language: languageItem.code });
                }}
                className={`btn-bouncy p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{languageItem.flag} {languageItem.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* 4. Legal & Policies */}
      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 280, delay: 0.16 }}
        className="p-4 rounded-3xl bg-slate-50 border border-slate-100 space-y-2"
      >
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          {t('about')}
        </h3>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              soundManager.playTap();
              setShowPrivacy(true);
            }}
            className="btn-bouncy p-3 rounded-2xl bg-white hover:bg-slate-100/80 border border-slate-200/80 text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Shield className="w-4 h-4 text-blue-600" />
            <span>{t('privacy')}</span>
          </button>

          <button
            onClick={() => {
              soundManager.playTap();
              setShowTerms(true);
            }}
            className="btn-bouncy p-3 rounded-2xl bg-white hover:bg-slate-100/80 border border-slate-200/80 text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>{t('terms')}</span>
          </button>
        </div>
      </motion.div>

      {/* Modals */}
      {showPrivacy && (
        <PrivacyPolicyModal onClose={() => setShowPrivacy(false)} />
      )}

      {showTerms && (
        <TermsModal onClose={() => setShowTerms(false)} />
      )}
    </div>
  );
};
