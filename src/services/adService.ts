/**
 * Professional Game Ad Engine for WORD HUNT
 * Supports Native Android (via @capacitor-community/admob) with graceful Interactive Fallback.
 * Features:
 * - Intelligent background preloading with exponential backoff retry
 * - Network reconnection & app lifecycle auto-recovery
 * - Audio-safe ad playback (auto-pauses/resumes ambient sound)
 * - Pacing & frequency capping for interstitials (35s minimum cooldown)
 * - Dual-layer reward verification + bridge buffer protection
 * - 100% reliable hint granting guarantee
 */

import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import { 
  AdMob, 
  AdMobInitializationOptions, 
  RewardAdPluginEvents, 
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
  private isPreloadingRewarded = false;
  private isPreloadingInterstitial = false;
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
   */
  public async preloadRewardVideo(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return false;
    if (this.isRewardedReady) return true;
    if (this.isPreloadingRewarded) return false;

    this.isPreloadingRewarded = true;
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
      this.isPreloadingRewarded = false;
    }
  }

  /**
   * Shows a real Google AdMob Rewarded Video.
   * If not cached, attempts a quick 3.5s fast-load.
   * Features dual-event verification (native event + show promise),
   * bridge buffer, and clean audio management.
   */
  public async showRewardVideo(): Promise<{ success: boolean; earnedReward: boolean; message?: string }> {
    if (!Capacitor.isNativePlatform()) {
      return { success: false, earnedReward: false, message: 'web_platform' };
    }

    if (this.isAdPlaying) {
      console.warn('⚠️ Rewarded Ad is already playing');
      return { success: false, earnedReward: false, message: 'ad_in_progress' };
    }

    await this.initialize();

    // Fast-load if not yet cached (wait up to 3500ms)
    if (!this.isRewardedReady) {
      console.log('⏳ Ad not cached yet, attempting fast load...');
      const fastLoadPromise = this.preloadRewardVideo();
      const timeoutPromise = new Promise<boolean>(res => setTimeout(() => res(false), 3500));
      const loaded = await Promise.race([fastLoadPromise, timeoutPromise]);
      if (!loaded && !this.isRewardedReady) {
        return { success: false, earnedReward: false, message: 'ad_load_failed' };
      }
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
              console.log('ℹ️ Reward earned and 6s elapsed without dismiss event; auto-settling reward');
              settle({ success: true, earnedReward: true });
            }, 6000);
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
              }, 1000);
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
   */
  public async preloadInterstitial(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return false;
    if (this.isInterstitialReady) return true;
    if (this.isPreloadingInterstitial) return false;

    this.isPreloadingInterstitial = true;
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
      this.isPreloadingInterstitial = false;
    }
  }

  /**
   * Shows a real Google AdMob Interstitial ad.
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
      const fastLoad = this.preloadInterstitial();
      const timeout = new Promise<boolean>(res => setTimeout(() => res(false), 3000));
      const loaded = await Promise.race([fastLoad, timeout]);
      if (!loaded && !this.isInterstitialReady) {
        return { success: false, message: 'ad_load_failed' };
      }
    }

    this.isAdPlaying = true;
    soundManager.stopAmbientMusic();

    try {
      this.isInterstitialReady = false;
      await AdMob.showInterstitial({
        adId: this.config.interstitialAdUnitId
      });
      this.lastAdShowTimestamp = Date.now();
      return { success: true };
    } catch (error) {
      console.error('AdMob showInterstitial error:', error);
      return { success: false, message: String(error) };
    } finally {
      this.isAdPlaying = false;
      try {
        soundManager.startAmbientMusic();
      } catch {}
      // Preload next ad in background
      this.preloadInterstitial().catch(() => {});
    }
  }

  /**
   * Checks if an ad should be displayed at level milestone with professional pacing.
   * Starts after Level 10 with a 6-level gap: Level 16, 22, 28, 34, 40, ...
   * Enforces a 35-second cooldown so players are never spammed.
   */
  public shouldShowLevelMilestoneAd(completedLevel: number, hasRemovedAds: boolean = false): boolean {
    if (hasRemovedAds) return false;
    const isMilestone = completedLevel >= 16 && (completedLevel - 10) % 6 === 0;
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
