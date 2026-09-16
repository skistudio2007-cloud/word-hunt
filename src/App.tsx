import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Capacitor } from '@capacitor/core';
import { 
  GameState, 
  NavigationTab, 
  PlacedWord, 
  PuzzleData, 
  UserProgress, 
  UserSettings,
  ChallengeInfo,
  LanguageCode 
} from './types';
import { generatePuzzle, generateDailyPuzzle, generateChallengePuzzle } from './services/puzzleGenerator';
import { StorageService, DEFAULT_PROGRESS, DEFAULT_SETTINGS } from './services/storage';
import { soundManager } from './services/sound';
import { adService } from './services/adService';
import { getWorldForLevel } from './data/worlds';

import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { CollectionScreen } from './components/CollectionScreen';
import { ChallengeScreen } from './components/ChallengeScreen';
import { SettingsScreen } from './components/SettingsScreen';

import { TopHeader } from './components/TopHeader';
import { LetterGrid } from './components/LetterGrid';
import { WordList } from './components/WordList';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { RewardedAdModal } from './components/RewardedAdModal';
import { InterstitialAdModal } from './components/InterstitialAdModal';
import { WordDefinitionDrawer } from './components/WordDefinitionDrawer';
import { TutorialOverlay } from './components/TutorialOverlay';
import { AnimatedThemeBackground } from './components/AnimatedThemeBackground';

const TAB_ORDER: NavigationTab[] = ['HOME', 'COLLECTION', 'CHALLENGE', 'SETTINGS'];

const tabVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 45 : direction < 0 ? -45 : 0,
    opacity: 0,
    scale: 0.98
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: 'spring', stiffness: 320, damping: 28 },
      opacity: { duration: 0.2 },
      scale: { type: 'spring', stiffness: 320, damping: 28 }
    }
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -35 : direction < 0 ? 35 : 0,
    opacity: 0,
    scale: 0.98,
    transition: {
      duration: 0.16,
      ease: 'easeInOut'
    }
  })
};

export default function App() {
  // Navigation & Game State
  const [activeTab, setActiveTab] = useState<NavigationTab>('HOME');
  const [tabDirection, setTabDirection] = useState<number>(0);
  const [gameState, setGameState] = useState<GameState>('MAIN_MENU');
  
  // Persistent Progress & Settings
  const [progress, setProgress] = useState<UserProgress>(StorageService.loadProgress);
  const [settings, setSettings] = useState<UserSettings>(StorageService.loadSettings);

  // Active Puzzle Data
  const [currentPuzzle, setCurrentPuzzle] = useState<PuzzleData | null>(null);
  const [puzzleWords, setPuzzleWords] = useState<PlacedWord[]>([]);
  const [levelStartTime, setLevelStartTime] = useState<number>(Date.now());
  const [hintsUsedInLevel, setHintsUsedInLevel] = useState<number>(0);
  const [activeChallenge, setActiveChallenge] = useState<ChallengeInfo | null>(null);
  const [isLevelCompleting, setIsLevelCompleting] = useState<boolean>(false);

  // Modals & Drawers
  const [isRewardedAdOpen, setIsRewardedAdOpen] = useState(false);
  const [isInterstitialAdOpen, setIsInterstitialAdOpen] = useState(false);
  const [milestoneAdLevel, setMilestoneAdLevel] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedWordForInfo, setSelectedWordForInfo] = useState<PlacedWord | null>(null);
  const [hintStartCell, setHintStartCell] = useState<{ row: number; col: number } | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  // Rewarded Ad and Hint Transaction State Refs (preventing double grants & multi-taps)
  const isRewardedSessionActiveRef = useRef(false);
  const isGrantingHintRef = useRef(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Initialize Sound Engine with user settings on start
  useEffect(() => {
    soundManager.updateSettings(
      settings.soundEnabled,
      settings.soundVolume,
      settings.musicEnabled,
      settings.musicVolume,
      settings.vibrationEnabled
    );
  }, [settings]);

  // Initialize Real Google Mobile Ads (AdMob) on Native Android
  useEffect(() => {
    adService.initialize();
  }, []);

  // Sync state changes to persistent storage
  useEffect(() => {
    StorageService.saveProgress(progress);
  }, [progress]);

  useEffect(() => {
    StorageService.saveSettings(settings);
  }, [settings]);

  // Check first-time onboarding tutorial
  useEffect(() => {
    if (progress.stats.puzzlesSolved === 0 && progress.currentLevel === 1) {
      setShowTutorial(true);
    }
  }, []);

  // Load standard level puzzle
  const startLevel = useCallback((levelNum: number, lang?: LanguageCode) => {
    setIsLevelCompleting(false);
    setHintStartCell(null);
    setHintsUsedInLevel(0);
    setLevelStartTime(Date.now());
    setActiveChallenge(null);

    const puzzle = generatePuzzle(levelNum, undefined, lang || settings.language);
    setCurrentPuzzle(puzzle);
    setPuzzleWords(puzzle.words.map(w => ({ ...w, found: false })));
    setGameState('PLAYING');
  }, [settings.language]);

  // Load special expedition challenge puzzle
  const startChallenge = useCallback((challenge: ChallengeInfo, lang?: LanguageCode) => {
    setIsLevelCompleting(false);
    setHintStartCell(null);
    setHintsUsedInLevel(0);
    setLevelStartTime(Date.now());
    setActiveChallenge(challenge);

    const puzzle = generateChallengePuzzle(challenge, lang || settings.language);
    setCurrentPuzzle(puzzle);
    setPuzzleWords(puzzle.words.map(w => ({ ...w, found: false })));
    setGameState('CHALLENGE_PLAYING');
  }, [settings.language]);

  // Handle discovered word
  const handleWordFound = useCallback((foundWord: PlacedWord) => {
    setPuzzleWords(prevWords => {
      const nextWords = prevWords.map(w => {
        if (w.word.toUpperCase() === foundWord.word.toUpperCase() && !w.found) {
          return { ...w, found: true };
        }
        return w;
      });

      // Update statistics
      setProgress(p => ({
        ...p,
        xp: p.xp + 25,
        stats: {
          ...p.stats,
          wordsFound: p.stats.wordsFound + 1
        }
      }));

      // Check if all words completed in this puzzle
      const allFound = nextWords.every(w => w.found);
      if (allFound) {
        // Step 1: Lock user input and trigger board victory bounce
        setIsLevelCompleting(true);

        // Step 2: Play victory fanfare and transition to clean win screen
        setTimeout(() => {
          soundManager.playLevelVictory();
          setIsLevelCompleting(false);
          setGameState('LEVEL_COMPLETE');

          const solveTimeSecs = Math.max(5, Math.round((Date.now() - levelStartTime) / 1000));
          // Star calculation: 3 stars = <=1 hint, 2 stars = <=2 hints, 1 star = 3+ hints
          let stars = 3;
          if (hintsUsedInLevel >= 3) stars = 1;
          else if (hintsUsedInLevel >= 1) stars = 2;

          setProgress(prev => {
            const completedLvl = currentPuzzle?.levelNumber || 1;
            const isExpedition = !!activeChallenge;
            const nextLvl = Math.max(prev.highestLevelUnlocked, completedLvl + 1);

            const newCompletedLevels = { ...prev.completedLevels };
            if (!isExpedition) {
              newCompletedLevels[completedLvl] = {
                stars: Math.max(prev.completedLevels[completedLvl]?.stars || 0, stars),
                timeSeconds: solveTimeSecs,
                date: new Date().toISOString()
              };
            }

            const totalStarsCount = Object.values(newCompletedLevels).reduce(
              (acc: number, curr: any) => acc + (curr?.stars || 0),
              0
            );

            // Daily puzzle streak handling
            const todayKey = new Date().toISOString().split('T')[0];
            let newStreak = prev.stats.currentStreak;
            const newDailyHistory = { ...prev.dailyHistory };

            if (!newDailyHistory[todayKey]?.completed) {
              newDailyHistory[todayKey] = { completed: true, stars };
              newStreak = prev.stats.currentStreak + 1;
            }

            const updatedCompletedChallenges = [...prev.completedChallenges];
            if (activeChallenge && !updatedCompletedChallenges.includes(activeChallenge.id)) {
              updatedCompletedChallenges.push(activeChallenge.id);
            }

            const bestFastest = prev.stats.fastestSolveSeconds === 0 
              ? solveTimeSecs 
              : Math.min(prev.stats.fastestSolveSeconds, solveTimeSecs);

            return {
              ...prev,
              currentLevel: isExpedition ? prev.currentLevel : completedLvl + 1,
              highestLevelUnlocked: isExpedition ? prev.highestLevelUnlocked : nextLvl,
              completedLevels: newCompletedLevels,
              completedChallenges: updatedCompletedChallenges,
              totalStars: totalStarsCount,
              xp: prev.xp + 100,
              hintsRevealLetter: prev.hintsRevealLetter + (activeChallenge ? activeChallenge.rewardHints : 0),
              stats: {
                ...prev.stats,
                puzzlesSolved: prev.stats.puzzlesSolved + 1,
                currentStreak: newStreak,
                bestStreak: Math.max(prev.stats.bestStreak, newStreak),
                perfectLevels: prev.stats.perfectLevels + (stars === 3 ? 1 : 0),
                fastestSolveSeconds: bestFastest,
                challengeWins: prev.stats.challengeWins + (isExpedition ? 1 : 0)
              },
              dailyHistory: newDailyHistory
            };
          });
        }, 650);
      }

      return nextWords;
    });
  }, [currentPuzzle, activeChallenge, levelStartTime, hintsUsedInLevel]);

  // Helper: Highlight the starting letter of the first unfound word
  const applyLetterHintHighlight = useCallback(() => {
    const unfoundWords = puzzleWords.filter(w => !w.found);
    if (unfoundWords.length === 0) return false;

    const targetWord = unfoundWords[0];
    setHintStartCell(targetWord.start);
    soundManager.playHintSparkle();
    setHintsUsedInLevel(h => h + 1);
    setTimeout(() => setHintStartCell(null), 5000);
    return true;
  }, [puzzleWords]);

  // Centralized function for granting exactly ONE rewarded hint (Requirement 7)
  const grantRewardedHint = useCallback(() => {
    // Prevent duplicate grants in the same transaction (Requirement 4)
    if (isGrantingHintRef.current) {
      console.warn('⚠️ grantRewardedHint duplicate execution prevented');
      return;
    }
    isGrantingHintRef.current = true;

    // 1. Grant exactly +1 hint and update state & persistence
    setProgress(prev => {
      const updated: UserProgress = {
        ...prev,
        stats: {
          ...prev.stats,
          hintsUsed: prev.stats.hintsUsed + 1
        }
      };
      StorageService.saveProgress(updated);
      return updated;
    });

    // 2. Trigger existing hint application behavior
    const applied = applyLetterHintHighlight();
    if (applied) {
      showToast('Hint Unlocked from Ad & Applied!');
    } else {
      // If unable to apply immediately (e.g. puzzle solved), preserve hint in inventory
      setProgress(prev => {
        const updated: UserProgress = {
          ...prev,
          purchasedHints: (prev.purchasedHints || 0) + 1
        };
        StorageService.saveProgress(updated);
        return updated;
      });
      showToast('Hint Unlocked from Ad & Saved!');
    }

    // 3. Reset lock after safe window to protect against any race conditions
    setTimeout(() => {
      isGrantingHintRef.current = false;
    }, 1200);
  }, [applyLetterHintHighlight]);

  // Main direct Hint Button handler (Gameplay Screen Header)
  const handleMainHintTap = useCallback(() => {
    const unfoundWords = puzzleWords.filter(w => !w.found);
    if (unfoundWords.length === 0) return;

    // Prevent rapid multi-taps during active ad session (Requirement 8)
    if (isRewardedSessionActiveRef.current || adService.isSessionActive()) {
      console.log('Rewarded ad session in progress, ignoring tap');
      return;
    }

    const purchasedLetter = (progress.purchasedHints || 0) + (progress.hintsRevealLetter || 0);

    // 1. USE PURCHASED HINT IF AVAILABLE
    if (purchasedLetter > 0) {
      setProgress(p => {
        let newPurchased = p.purchasedHints || 0;
        let newLetter = p.hintsRevealLetter || 0;
        if (newPurchased > 0) {
          newPurchased -= 1;
        } else if (newLetter > 0) {
          newLetter -= 1;
        }
        const updated: UserProgress = {
          ...p,
          purchasedHints: newPurchased,
          hintsRevealLetter: newLetter,
          stats: { ...p.stats, hintsUsed: p.stats.hintsUsed + 1 }
        };
        StorageService.saveProgress(updated);
        return updated;
      });
      applyLetterHintHighlight();
      showToast('Purchased Hint Applied');
      return;
    }

    // 2. WATCH GOOGLE REWARDED AD FOR HINT
    if (Capacitor.isNativePlatform()) {
      isRewardedSessionActiveRef.current = true;
      showToast('Loading Google Ad...');

      adService.showRewardVideo()
        .then(result => {
          if (result.earnedReward) {
            grantRewardedHint();
          } else if (result.message === 'ad_closed_early') {
            showToast('Ad closed earlier, hint not granted');
          } else {
            showToast('Ads not available');
          }
        })
        .catch(err => {
          console.warn('Ad session error:', err);
          showToast('Ads not available');
        })
        .finally(() => {
          isRewardedSessionActiveRef.current = false;
        });
      return;
    }

    showToast('Ads not available');
  }, [puzzleWords, progress, applyLetterHintHighlight, grantRewardedHint]);

  // Handle Rewarded Ad completion
  const handleRewardedAdReward = useCallback(() => {
    grantRewardedHint();
  }, [grantRewardedHint]);

  // Handle Rewarded Ad cancellation or failure
  const handleRewardedAdCancel = useCallback((reason?: string) => {
    if (reason) {
      showToast(reason);
    } else {
      showToast('Ad closed earlier, hint not granted');
    }
  }, []);

  const handleNextLevel = () => {
    if (activeChallenge) {
      setGameState('MAIN_MENU');
      setActiveTab('CHALLENGE');
      return;
    }

    const completedLvl = currentPuzzle?.levelNumber || (progress.currentLevel - 1);

    // Show Interstitial Ad at Level 16, 22, 28, 34, 40... (every 6 levels after Level 10)
    if (adService.shouldShowLevelMilestoneAd(completedLvl, progress.hasRemovedAds)) {
      if (Capacitor.isNativePlatform()) {
        showToast('Loading Google Ad...');
        adService.showInterstitial().finally(() => {
          startLevel(progress.currentLevel);
        });
        return;
      }
      setMilestoneAdLevel(completedLvl);
      setIsInterstitialAdOpen(true);
      return;
    }

    startLevel(progress.currentLevel);
  };

  const handleInterstitialAdClose = () => {
    setIsInterstitialAdOpen(false);
    startLevel(progress.currentLevel);
  };

  const handleClaimAchievement = (achId: string, rewardHints: number) => {
    setProgress(p => ({
      ...p,
      claimedAchievements: [...p.claimedAchievements, achId],
      hintsRevealLetter: p.hintsRevealLetter + rewardHints,
      hintsRevealWord: p.hintsRevealWord + 1,
      xp: p.xp + 150
    }));
  };

  const handleSelectTab = (newTab: NavigationTab) => {
    if (newTab === activeTab) return;
    const fromIndex = TAB_ORDER.indexOf(activeTab);
    const toIndex = TAB_ORDER.indexOf(newTab);
    setTabDirection(toIndex > fromIndex ? 1 : -1);
    setActiveTab(newTab);
  };

  const freeHintsRemaining = Math.max(0, 5 - (progress.freeHintsUsed || 0));
  const purchasedLetterHints = (progress.purchasedHints || 0) + (progress.hintsRevealLetter || 0);

  const currentWorld = getWorldForLevel(currentPuzzle?.levelNumber || progress.currentLevel);

  return (
    <div className="w-full min-h-[100dvh] bg-slate-50 text-slate-900 flex flex-col items-center justify-start overflow-x-hidden font-sans select-none">
      <div className="w-full max-w-[480px] min-h-[100dvh] bg-white shadow-xl flex flex-col relative overflow-x-hidden">
        
        {/* Toast Feedback Notification Banner */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-3 z-50 left-1/2 -translate-x-1/2 px-4 py-2 rounded-2xl bg-slate-900/95 text-white text-xs font-bold shadow-xl flex items-center gap-2 pointer-events-none border border-slate-700/50"
            >
              <span>✨</span>
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 1. Main Navigation Screens (When Game State is MAIN_MENU) */}
        {gameState === 'MAIN_MENU' && (
          <div className="w-full flex-1 flex flex-col overflow-y-auto overflow-x-hidden pb-[75px] overscroll-y-contain">
            <AnimatePresence mode="wait" custom={tabDirection}>
              {/* Tab 1: HOME */}
              {activeTab === 'HOME' && (
                <motion.div
                  key="tab-home"
                  custom={tabDirection}
                  variants={tabVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="flex-1 w-full"
                >
                  <HomeScreen
                    currentLevel={progress.currentLevel}
                    language={settings.language}
                    onPlay={() => startLevel(progress.currentLevel)}
                  />
                </motion.div>
              )}

              {/* Tab 2: COLLECTION */}
              {activeTab === 'COLLECTION' && (
                <motion.div
                  key="tab-collection"
                  custom={tabDirection}
                  variants={tabVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="flex-1 w-full"
                >
                  <CollectionScreen
                    progress={progress}
                    language={settings.language}
                    onClaimAchievement={handleClaimAchievement}
                  />
                </motion.div>
              )}

              {/* Tab 3: CHALLENGE */}
              {activeTab === 'CHALLENGE' && (
                <motion.div
                  key="tab-challenge"
                  custom={tabDirection}
                  variants={tabVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="flex-1 w-full"
                >
                  <ChallengeScreen
                    progress={progress}
                    language={settings.language}
                    onPlayChallenge={challenge => startChallenge(challenge)}
                  />
                </motion.div>
              )}

              {/* Tab 4: SETTINGS */}
              {activeTab === 'SETTINGS' && (
                <motion.div
                  key="tab-settings"
                  custom={tabDirection}
                  variants={tabVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="flex-1 w-full"
                >
                  <SettingsScreen
                    settings={settings}
                    progress={progress}
                    onUpdateSettings={s => {
                      const languageChanged = s.language !== settings.language;
                      setSettings(s);
                      if (languageChanged && currentPuzzle) {
                        if (activeChallenge) {
                          startChallenge(activeChallenge, s.language);
                        } else {
                          startLevel(currentPuzzle.levelNumber, s.language);
                        }
                      }
                    }}
                    onRemoveAds={() => setProgress(p => ({ ...p, hasRemovedAds: true }))}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Persistent 4-Tab Bottom Navigation Bar */}
            <BottomNav
              activeTab={activeTab}
              language={settings.language}
              onSelectTab={handleSelectTab}
            />
          </div>
        )}

        {/* 2. Active Level / Challenge Gameplay Screen (Stays visible during LEVEL_COMPLETE under the modal) */}
        {(gameState === 'PLAYING' || gameState === 'CHALLENGE_PLAYING' || gameState === 'LEVEL_COMPLETE') && currentPuzzle && (
          <div
            className="w-full min-h-[100dvh] flex-1 bg-white flex flex-col justify-between p-2 pb-3 sm:pb-4 relative overflow-y-auto overflow-x-hidden overscroll-y-contain"
          >
            {/* Theme-based Animated Dynamic Background */}
            <AnimatedThemeBackground 
              world={currentWorld} 
              levelNumber={currentPuzzle.levelNumber} 
            />

            {/* Top Header with direct Hint button */}
            <div className="relative z-10 w-full shrink-0">
              <TopHeader
                levelNumber={currentPuzzle.levelNumber}
                themeName={activeChallenge ? activeChallenge.title : currentPuzzle.theme}
                starsCount={progress.totalStars}
                freeHintsRemaining={freeHintsRemaining}
                purchasedHints={purchasedLetterHints}
                language={settings.language}
                isDaily={!!activeChallenge}
                onBack={() => setGameState('MAIN_MENU')}
                onUseHint={handleMainHintTap}
                onPause={() => setGameState('PAUSED')}
              />
            </div>

            {/* Center Letter Grid & Responsive Words Container */}
            <main className="flex-1 flex flex-col items-center justify-start my-auto w-full relative z-10 py-1">
              <LetterGrid
                key={`grid-lvl-${currentPuzzle.levelNumber}-${currentPuzzle.seed || ''}`}
                grid={currentPuzzle.grid}
                words={puzzleWords}
                onWordFound={handleWordFound}
                hintStartCell={hintStartCell}
                highContrast={settings.highContrast}
                isCompleting={gameState === 'PLAYING' && isLevelCompleting}
              />

              {/* Target Words List with proportional scroll-safe container */}
              <div className="w-full max-w-[440px] px-2 py-1">
                <WordList
                  words={puzzleWords}
                  onSelectWordForInfo={w => setSelectedWordForInfo(w)}
                  highContrast={settings.highContrast}
                />
              </div>
            </main>

            {/* Bottom Educational Hint Tip */}
            <footer className="shrink-0 text-center py-1 relative z-10">
              <p className="text-[11px] font-bold text-slate-700 bg-white/95 py-1 px-3 rounded-full inline-block shadow-2xs border border-slate-200/60">
                💡 Swipe letters to find words
              </p>
            </footer>
          </div>
        )}

        {/* 3. Modals & Overlays with smooth enter/exit animations */}
        <AnimatePresence>
          {gameState === 'PAUSED' && (
            <motion.div
              key="paused-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-slate-950/75 flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 10 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                className="w-full max-w-sm bg-white border border-slate-100 rounded-3xl p-6 text-center space-y-4 shadow-2xl"
              >
                <h2 className="text-2xl font-black text-slate-900">GAME PAUSED</h2>
                <p className="text-xs text-slate-400">Take your time. Word Hunt saves your progress!</p>
                <div className="space-y-2 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      soundManager.playTap();
                      setGameState(activeChallenge ? 'CHALLENGE_PLAYING' : 'PLAYING');
                    }}
                    className="w-full py-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-md shadow-blue-500/20 transition-colors cursor-pointer"
                  >
                    RESUME PLAYING
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      soundManager.playTap();
                      setGameState('MAIN_MENU');
                    }}
                    className="w-full py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Quit to Menu
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* 4. Simple Clean Level Complete Win Modal */}
          {gameState === 'LEVEL_COMPLETE' && currentPuzzle && (
            <LevelCompleteModal
              key="modal-level-complete"
              starsAwarded={hintsUsedInLevel >= 3 ? 1 : hintsUsedInLevel >= 1 ? 2 : 3}
              language={settings.language}
              onNextLevel={handleNextLevel}
            />
          )}

          {/* 5. Rewarded Ad Modal (Hint) */}
          {isRewardedAdOpen && (
            <RewardedAdModal
              key="modal-rewarded-ad"
              language={settings.language}
              onReward={handleRewardedAdReward}
              onCancel={handleRewardedAdCancel}
              onClose={() => setIsRewardedAdOpen(false)}
            />
          )}

          {/* 6. Interstitial Ad Modal (Every 10 Levels) */}
          {isInterstitialAdOpen && (
            <InterstitialAdModal
              key="modal-interstitial-ad"
              completedLevel={milestoneAdLevel}
              language={settings.language}
              onClose={handleInterstitialAdClose}
            />
          )}

          {/* 7. Word Learning Drawer */}
          {selectedWordForInfo && (
            <WordDefinitionDrawer
              key="drawer-word-definition"
              word={selectedWordForInfo}
              onClose={() => setSelectedWordForInfo(null)}
            />
          )}

          {/* 8. Onboarding Tutorial Guide */}
          {showTutorial && (
            <TutorialOverlay
              key="modal-tutorial-guide"
              onComplete={() => {
                setShowTutorial(false);
                startLevel(1);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
