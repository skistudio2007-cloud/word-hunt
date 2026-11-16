/**
 * Professional Game Ad Engine for WORD HUNT
 * Supports Native Android (via @capacitor-community/admob).
 * Features:
 * - Intelligent background preloading with promise pooling & exponential backoff retry
 * - Network reconnection & app lifecycle auto-recovery
 * - Audio-safe ad playback (auto-pauses and resumes ambient sound strictly on ad dismiss)
 * - Pacing & frequency capping for interstitials (35s minimum cooldown, milestones at Lvl 3, 6, 9...)
 * - Dual-layer reward verification + bridge buffer protection
 * - 100% reliable hint granting guarantee
 */

import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import { 
  AdMob, 
  AdMobInitializationOptions, 
  RewardAdPluginEvents, 
  InterstitialAdPluginEvents,
  AdMobRewardItem,
  AdMobError 
} from '@capacitor-community/admob';
import { soundManager } from './sound';

export interface AdConfig {
  appId: string;
  rewardedAdUnitId: string;
  interstitialAdUnitId: string;
  isTestMode: boolean;
}

// Official User Production AdMob IDs
export const DEFAULT_AD_CONFIG: AdConfig = {
  appId: 'ca-app-pub-2007565791914092~7531337749',
  rewardedAdUnitId: 'ca-app-pub-2007565791914092/1828806113', // User Rewarded Video Ad Unit ID
  interstitialAdUnitId: 'ca-app-pub-2007565791914092/4518161594', // User Interstitial Ad Unit ID
  isTestMode: false
};

class AdMobService {
  private config: AdConfig = { ...DEFAULT_AD_CONFIG };
  private isInitialized = false;
  private isAdPlaying = false;
  private isRewardedReady = false;
  private isInterstitialReady = false;

  // Active in-flight preload promises to avoid redundant/competing requests
  private rewardedPreloadPromise: Promise<boolean> | null = null;
  private interstitialPreloadPromise: Promise<boolean> | null = null;

  private rewardedRetryTimeout: ReturnType<typeof setTimeout> | null = null;
  private interstitialRetryTimeout: ReturnType<typeof setTimeout> | null = null;
  private rewardedRetryDelay = 5000;
  private interstitialRetryDelay = 5000;
  private readonly MAX_RETRY_DELAY = 60000;

  private lastAdShowTimestamp = 0;
  private readonly MIN_INTERSTITIAL_INTERVAL_MS = 35000; // 35 seconds cooldown
  private initPromise: Promise<void> | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Auto-recovery: when device comes online, retry preloading ads immediately
      window.addEventListener('online', () => {
        console.log('📶 Internet reconnected. Checking ad inventory...');
        if (!this.isRewardedReady) this.preloadRewardVideo().catch(() => {});
        if (!this.isInterstitialReady) this.preloadInterstitial().catch(() => {});
      });

      // Auto-recovery: when app regains focus from background
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && this.isInitialized && !this.isAdPlaying) {
          if (!this.isRewardedReady) this.preloadRewardVideo().catch(() => {});
          if (!this.isInterstitialReady) this.preloadInterstitial().catch(() => {});
        }
      });
    }
  }

  /**
   * Initializes the Google Mobile Ads SDK on native platforms.
   */
  public async initialize(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        const options: AdMobInitializationOptions = {
          initializeForTesting: this.config.isTestMode
        };
        await AdMob.initialize(options);
        this.isInitialized = true;
        console.log('✅ Google AdMob SDK initialized successfully');

        // Warm up ad cache in background
        this.preloadRewardVideo().catch(() => {});
        this.preloadInterstitial().catch(() => {});
      } catch (error) {
        console.warn('⚠️ AdMob.initialize warning:', error);
        // Allow a later call to initialize() to retry after transient failure
        this.initPromise = null;
        this.isInitialized = false;
      }
    })();

    return this.initPromise;
  }

  /**
   * Pre-loads a real Google AdMob rewarded video ad in memory with exponential backoff retry.
   * Leverages promise pooling so concurrent callers share the in-flight request.
   */
  public async preloadRewardVideo(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return false;
    if (this.isRewardedReady) return true;
    if (this.rewardedPreloadPromise) return this.rewardedPreloadPromise;

    this.rewardedPreloadPromise = (async () => {
      try {
        console.log('🔄 Requesting Real AdMob Rewarded Video:', this.config.rewardedAdUnitId);
        await AdMob.prepareRewardVideoAd({
          adId: this.config.rewardedAdUnitId
        });
        this.isRewardedReady = true;
        this.rewardedRetryDelay = 5000; // Reset retry delay
        if (this.rewardedRetryTimeout) {
          clearTimeout(this.rewardedRetryTimeout);
          this.rewardedRetryTimeout = null;
        }
        console.log('✅ Real AdMob Rewarded Video preloaded and ready in cache');
        return true;
      } catch (err) {
        console.warn(`⚠️ Real AdMob Rewarded Video load failed. Retrying in ${this.rewardedRetryDelay / 1000}s:`, err);
        this.isRewardedReady = false;

        // Schedule background retry with exponential backoff
        if (this.rewardedRetryTimeout) clearTimeout(this.rewardedRetryTimeout);
        this.rewardedRetryTimeout = setTimeout(() => {
          this.preloadRewardVideo().catch(() => {});
        }, this.rewardedRetryDelay);
        this.rewardedRetryDelay = Math.min(this.rewardedRetryDelay * 2, this.MAX_RETRY_DELAY);

        return false;
      } finally {
        this.rewardedPreloadPromise = null;
      }
    })();

    return this.rewardedPreloadPromise;
  }

  /**
   * Shows a real Google AdMob Rewarded Video.
   * If not cached, initiates a fast-load with promise pooling.
   * Features dual-event verification (native event + show promise),
   * bridge buffer, and clean audio management.
   */
  public async showRewardVideo(): Promise<{ success: boolean; earnedReward: boolean; message?: string }> {
    if (!Capacitor.isNativePlatform()) {
      return { success: false, earnedReward: false, message: 'web_platform' };
    }

    if (this.isAdPlaying) {
      console.warn('⚠️ Ad is already playing');
      return { success: false, earnedReward: false, message: 'ad_in_progress' };
    }

    await this.initialize();

    // Ensure rewarded ad is available
    if (!this.isRewardedReady) {
      console.log('⏳ Rewarded ad is not ready. Loading/waiting up to 7s...');
      const loaded = await Promise.race([
        this.preloadRewardVideo(),
        new Promise<boolean>(res => setTimeout(() => res(false), 7000))
      ]);

      if (!loaded && !this.isRewardedReady) {
        console.warn('❌ Rewarded ad is still not ready after waiting.');
        return {
          success: false,
          earnedReward: false,
          message: 'ad_load_failed'
        };
      }
      console.log('✅ Rewarded ad is ready. Showing now.');
    }

    this.isAdPlaying = true;
    soundManager.stopAmbientMusic(); // Silence music during ad playback

    return new Promise<{ success: boolean; earnedReward: boolean; message?: string }>(async (resolve) => {
      let earnedReward = false;
      let isSettled = false;
      let safetyTimeout: ReturnType<typeof setTimeout> | null = null;
      let dismissGraceTimeout: ReturnType<typeof setTimeout> | null = null;
      let rewardFallbackTimeout: ReturnType<typeof setTimeout> | null = null;
      const listeners: PluginListenerHandle[] = [];

      const cleanup = async () => {
        if (safetyTimeout) {
          clearTimeout(safetyTimeout);
          safetyTimeout = null;
        }
        if (dismissGraceTimeout) {
          clearTimeout(dismissGraceTimeout);
          dismissGraceTimeout = null;
        }
        if (rewardFallbackTimeout) {
          clearTimeout(rewardFallbackTimeout);
          rewardFallbackTimeout = null;
        }
        this.isAdPlaying = false;
        this.isRewardedReady = false;
        this.lastAdShowTimestamp = Date.now();

        // Resume ambient music
        try {
          soundManager.startAmbientMusic();
        } catch {}

        for (const listener of listeners) {
          try {
            await listener.remove();
          } catch (err) {
            console.warn('⚠️ Error removing ad listener:', err);
          }
        }
        listeners.length = 0;

        // Immediately warm up the next ad in background
        this.preloadRewardVideo().catch(() => {});
      };

      const settle = async (result: { success: boolean; earnedReward: boolean; message?: string }) => {
        if (isSettled) return;
        isSettled = true;
        await cleanup();
        resolve(result);
      };

      // 120-second safety timeout in case the native ad is killed abruptly
      safetyTimeout = setTimeout(() => {
        console.warn('⚠️ AdMob Rewarded Ad timed out without dismiss event');
        settle({ success: false, earnedReward: false, message: 'ad_timeout' });
      }, 120000);

      try {
        const markRewardEarned = () => {
          console.log('🎉 AdMob Reward confirmed earned from Google SDK!');
          earnedReward = true;
          if (dismissGraceTimeout) {
            clearTimeout(dismissGraceTimeout);
            dismissGraceTimeout = null;
            settle({ success: true, earnedReward: true });
          } else if (!rewardFallbackTimeout) {
            rewardFallbackTimeout = setTimeout(() => {
              console.log('ℹ️ Reward earned and 5s elapsed without dismiss event; auto-settling reward');
              settle({ success: true, earnedReward: true });
            }, 5000);
          }
        };

        // Event A: Reward Event from native AdMob SDK
        const rewardListener = await AdMob.addListener(
          RewardAdPluginEvents.Rewarded,
          (rewardItem: AdMobRewardItem) => {
            console.log('🎉 AdMob Rewarded event received from Google SDK:', rewardItem);
            markRewardEarned();
          }
        );
        listeners.push(rewardListener);

        // Event B: Ad Dismissed / Closed
        const dismissListener = await AdMob.addListener(
          RewardAdPluginEvents.Dismissed,
          () => {
            console.log('ℹ️ AdMob Rewarded Ad dismissed. earnedReward status:', earnedReward);
            if (earnedReward) {
              settle({ success: true, earnedReward: true });
            } else {
              // Grace period for in-flight reward events across the Android WebView bridge
              dismissGraceTimeout = setTimeout(() => {
                if (earnedReward) {
                  settle({ success: true, earnedReward: true });
                } else {
                  console.log('ℹ️ No reward confirmed after dismiss grace period - user closed early');
                  settle({ success: false, earnedReward: false, message: 'ad_closed_early' });
                }
              }, 1500);
            }
          }
        );
        listeners.push(dismissListener);

        // Event C: Ad Failed To Show
        const failedToShowListener = await AdMob.addListener(
          RewardAdPluginEvents.FailedToShow,
          (error: AdMobError) => {
            console.warn('⚠️ AdMob Rewarded Ad failed to show:', error);
            settle({ success: false, earnedReward: false, message: 'ad_show_failed' });
          }
        );
        listeners.push(failedToShowListener);

        // Step: Show loaded ad
        this.isRewardedReady = false;
        AdMob.showRewardVideoAd({
          adId: this.config.rewardedAdUnitId
        }).then((rewardItem: AdMobRewardItem) => {
          console.log('🎉 AdMob.showRewardVideoAd promise resolved:', rewardItem);
          markRewardEarned();
        }).catch((showError) => {
          console.warn('⚠️ AdMob.showRewardVideoAd call error:', showError);
          settle({ success: false, earnedReward: false, message: String(showError) });
        });

      } catch (err) {
        console.error('⚠️ Unexpected error in showRewardVideo:', err);
        settle({ success: false, earnedReward: false, message: String(err) });
      }
    });
  }

  /**
   * Pre-loads a real Google AdMob interstitial ad in memory with exponential backoff retry.
   * Leverages promise pooling so concurrent callers share the in-flight request.
   */
  public async preloadInterstitial(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return false;
    if (this.isInterstitialReady) return true;
    if (this.interstitialPreloadPromise) return this.interstitialPreloadPromise;

    this.interstitialPreloadPromise = (async () => {
      try {
        console.log('🔄 Requesting Real AdMob Interstitial:', this.config.interstitialAdUnitId);
        await AdMob.prepareInterstitial({
          adId: this.config.interstitialAdUnitId
        });
        this.isInterstitialReady = true;
        this.interstitialRetryDelay = 5000;
        if (this.interstitialRetryTimeout) {
          clearTimeout(this.interstitialRetryTimeout);
          this.interstitialRetryTimeout = null;
        }
        console.log('✅ Real AdMob Interstitial preloaded and ready in cache');
        return true;
      } catch (err) {
        console.warn(`⚠️ Real AdMob Interstitial load failed. Retrying in ${this.interstitialRetryDelay / 1000}s:`, err);
        this.isInterstitialReady = false;

        if (this.interstitialRetryTimeout) clearTimeout(this.interstitialRetryTimeout);
        this.interstitialRetryTimeout = setTimeout(() => {
          this.preloadInterstitial().catch(() => {});
        }, this.interstitialRetryDelay);
        this.interstitialRetryDelay = Math.min(this.interstitialRetryDelay * 2, this.MAX_RETRY_DELAY);

        return false;
      } finally {
        this.interstitialPreloadPromise = null;
      }
    })();

    return this.interstitialPreloadPromise;
  }

  /**
   * Shows a real Google AdMob Interstitial ad.
   * Listens for ad dismissal to ensure background music remains muted
   * throughout ad display and only resumes once the player closes the ad.
   */
  public async showInterstitial(): Promise<{ success: boolean; message?: string }> {
    if (!Capacitor.isNativePlatform()) {
      return { success: false, message: 'web_platform' };
    }

    if (this.isAdPlaying) {
      console.warn('⚠️ Interstitial Ad is already in progress');
      return { success: false, message: 'ad_in_progress' };
    }

    await this.initialize();

    // Fast-load if not ready
    if (!this.isInterstitialReady) {
      console.log('⏳ Interstitial ad is not ready. Loading/waiting up to 6s...');
      const loaded = await Promise.race([
        this.preloadInterstitial(),
        new Promise<boolean>(res => setTimeout(() => res(false), 6000))
      ]);
      if (!loaded && !this.isInterstitialReady) {
        console.warn('❌ Interstitial ad load failed or timed out.');
        return { success: false, message: 'ad_load_failed' };
      }
    }

    this.isAdPlaying = true;
    soundManager.stopAmbientMusic();

    return new Promise<{ success: boolean; message?: string }>(async (resolve) => {
      let isSettled = false;
      let safetyTimeout: ReturnType<typeof setTimeout> | null = null;
      const listeners: PluginListenerHandle[] = [];

      const cleanup = async () => {
        if (safetyTimeout) {
          clearTimeout(safetyTimeout);
          safetyTimeout = null;
        }
        this.isAdPlaying = false;
        this.isInterstitialReady = false;
        this.lastAdShowTimestamp = Date.now();

        try {
          soundManager.startAmbientMusic();
        } catch {}

        for (const listener of listeners) {
          try {
            await listener.remove();
          } catch (err) {
            console.warn('⚠️ Error removing interstitial listener:', err);
          }
        }
        listeners.length = 0;

        // Preload next ad in background
        this.preloadInterstitial().catch(() => {});
      };

      const settle = async (res: { success: boolean; message?: string }) => {
        if (isSettled) return;
        isSettled = true;
        await cleanup();
        resolve(res);
      };

      safetyTimeout = setTimeout(() => {
        console.warn('⚠️ AdMob Interstitial timed out without dismiss event');
        settle({ success: false, message: 'ad_timeout' });
      }, 120000);

      try {
        const dismissListener = await AdMob.addListener(
          InterstitialAdPluginEvents.Dismissed,
          () => {
            console.log('ℹ️ AdMob Interstitial dismissed by user.');
            settle({ success: true });
          }
        );
        listeners.push(dismissListener);

        const failedToShowListener = await AdMob.addListener(
          InterstitialAdPluginEvents.FailedToShow,
          (err: AdMobError) => {
            console.warn('⚠️ AdMob Interstitial failed to show:', err);
            settle({ success: false, message: err?.message || 'ad_show_failed' });
          }
        );
        listeners.push(failedToShowListener);

        this.isInterstitialReady = false;
        await AdMob.showInterstitial({
          adId: this.config.interstitialAdUnitId
        });
      } catch (error) {
        console.error('AdMob showInterstitial error:', error);
        settle({ success: false, message: String(error) });
      }
    });
  }

  /**
   * Checks if an ad should be displayed at level milestone with professional pacing.
   * Starts after Level 3 with a 3-level frequency: Level 3, 6, 9, 12, 15, 18, 21, ...
   * Enforces a 35-second cooldown so players are never spammed.
   */
  public shouldShowLevelMilestoneAd(completedLevel: number, hasRemovedAds: boolean = false): boolean {
    if (hasRemovedAds) return false;
    const isMilestone = completedLevel >= 3 && completedLevel % 3 === 0;
    if (!isMilestone) return false;

    // Pacing cooldown: Ensure at least 35s since the last ad
    const timeSinceLastAd = Date.now() - this.lastAdShowTimestamp;
    if (timeSinceLastAd < this.MIN_INTERSTITIAL_INTERVAL_MS) {
      console.log(`⏱️ Interstitial skipped due to pacing cooldown (${Math.round(timeSinceLastAd / 1000)}s / 35s)`);
      return false;
    }

    return true;
  }

  public setConfig(customConfig: Partial<AdConfig>): void {
    this.config = { ...this.config, ...customConfig };
  }

  public getConfig(): AdConfig {
    return { ...this.config };
  }

  public isPlaying(): boolean {
    return this.isAdPlaying;
  }

  public setPlaying(playing: boolean): void {
    this.isAdPlaying = playing;
  }

  public isRewardedAvailable(): boolean {
    return this.isRewardedReady;
  }

  public isInterstitialAvailable(): boolean {
    return this.isInterstitialReady;
  }
}

export const adService = new AdMobService();
