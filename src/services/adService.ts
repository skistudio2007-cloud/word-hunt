/**
 * Real Google AdMob Service for WORD HUNT
 * Supports Native Android (via @capacitor-community/admob) with Web Fallback.
 * Features background ad preloading for zero-latency playback.
 */

import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import { 
  AdMob, 
  AdMobInitializationOptions, 
  RewardAdPluginEvents, 
  AdMobRewardItem,
  AdMobError 
} from '@capacitor-community/admob';

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
  private initPromise: Promise<void> | null = null;

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
        console.log('✅ Google AdMob initialized successfully');

        // Preload ads in background for instant display
        this.preloadRewardVideo().catch(() => {});
        this.preloadInterstitial().catch(() => {});
      } catch (error) {
        console.warn('⚠️ AdMob.initialize warning:', error);
      }
    })();

    return this.initPromise;
  }

  /**
   * Pre-loads a real Google AdMob rewarded video ad in memory.
   * Strictly uses the real production ad unit ID.
   */
  public async preloadRewardVideo(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return false;
    try {
      console.log('🔄 Requesting Real AdMob Rewarded Video:', this.config.rewardedAdUnitId);
      await AdMob.prepareRewardVideoAd({
        adId: this.config.rewardedAdUnitId
      });
      this.isRewardedReady = true;
      console.log('✅ Real AdMob Rewarded Video preloaded successfully');
      return true;
    } catch (err) {
      console.warn('⚠️ Real AdMob Rewarded Video failed to prepare:', err);
      this.isRewardedReady = false;
      return false;
    }
  }

  /**
   * Shows a real Google AdMob Rewarded Video.
   * Resolves ONLY when the user finishes viewing and the real AdMob reward callback is received.
   * Never gives a reward on early close, dismiss without reward, load failure, or show failure.
   */
  public async showRewardVideo(): Promise<{ success: boolean; earnedReward: boolean; message?: string }> {
    if (!Capacitor.isNativePlatform()) {
      return { success: false, earnedReward: false, message: 'web_platform' };
    }

    // Prevent concurrent ad requests
    if (this.isAdPlaying) {
      console.warn('⚠️ Rewarded Ad is already in progress');
      return { success: false, earnedReward: false, message: 'ad_in_progress' };
    }

    await this.initialize();
    this.isAdPlaying = true;

    return new Promise<{ success: boolean; earnedReward: boolean; message?: string }>(async (resolve) => {
      // Per-attempt state & duplicate protection guards
      let earnedReward = false;
      let isSettled = false;
      const listeners: PluginListenerHandle[] = [];

      // Safe cleanup function for all listeners and state
      const cleanup = async () => {
        this.isAdPlaying = false;
        this.isRewardedReady = false;

        for (const listener of listeners) {
          try {
            await listener.remove();
          } catch (err) {
            console.warn('⚠️ Error removing ad listener:', err);
          }
        }
        listeners.length = 0;

        // Preload next ad in background for subsequent requests
        this.preloadRewardVideo().catch(() => {});
      };

      // Single-execution resolver: guarantees exact 1 resolution per attempt
      const settle = async (result: { success: boolean; earnedReward: boolean; message?: string }) => {
        if (isSettled) return;
        isSettled = true;
        await cleanup();
        resolve(result);
      };

      try {
        // Step 1: Ensure ad is loaded/ready
        if (!this.isRewardedReady) {
          const ready = await this.preloadRewardVideo();
          if (!ready) {
            await settle({ success: false, earnedReward: false, message: 'ad_load_failed' });
            return;
          }
        }

        // Step 2: Register AdMob event listeners BEFORE showing the ad

        // Event A: Real Reward Earned from AdMob SDK
        const rewardListener = await AdMob.addListener(
          RewardAdPluginEvents.Rewarded,
          (rewardItem: AdMobRewardItem) => {
            console.log('🎉 AdMob Rewarded event received from Google SDK:', rewardItem);
            earnedReward = true;
          }
        );
        listeners.push(rewardListener);

        // Event B: Ad Dismissed / Closed by user
        const dismissListener = await AdMob.addListener(
          RewardAdPluginEvents.Dismissed,
          () => {
            console.log('ℹ️ AdMob Rewarded Ad dismissed. earnedReward status:', earnedReward);
            // Brief tick (60ms) to allow any queued Rewarded event to process
            setTimeout(() => {
              if (earnedReward) {
                // User completed ad and received real AdMob reward
                settle({ success: true, earnedReward: true });
              } else {
                // User closed early or no reward event was received
                settle({ success: false, earnedReward: false, message: 'ad_closed_early' });
              }
            }, 60);
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

        // Step 3: Show the loaded ad
        this.isRewardedReady = false;
        AdMob.showRewardVideoAd().then((rewardItem) => {
          // If the native plugin resolves onUserEarnedReward
          if (rewardItem) {
            console.log('🎉 showRewardVideoAd promise resolved with reward:', rewardItem);
            earnedReward = true;
          }
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
   * Pre-loads a real Google AdMob interstitial ad in memory.
   * Strictly uses the real production ad unit ID.
   */
  public async preloadInterstitial(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return false;
    try {
      console.log('🔄 Requesting Real AdMob Interstitial:', this.config.interstitialAdUnitId);
      await AdMob.prepareInterstitial({
        adId: this.config.interstitialAdUnitId
      });
      this.isInterstitialReady = true;
      console.log('✅ Real AdMob Interstitial preloaded successfully');
      return true;
    } catch (err) {
      console.warn('⚠️ Real AdMob Interstitial failed to prepare:', err);
      this.isInterstitialReady = false;
      return false;
    }
  }

  /**
   * Shows a real Google AdMob Interstitial ad.
   */
  public async showInterstitial(): Promise<{ success: boolean; message?: string }> {
    if (!Capacitor.isNativePlatform()) {
      return { success: false, message: 'web_platform' };
    }

    await this.initialize();
    this.isAdPlaying = true;

    try {
      if (!this.isInterstitialReady) {
        const ready = await this.preloadInterstitial();
        if (!ready) {
          this.isAdPlaying = false;
          return { success: false, message: 'ad_load_failed' };
        }
      }

      this.isInterstitialReady = false;
      await AdMob.showInterstitial();
      this.isAdPlaying = false;

      // Preload next ad in background
      this.preloadInterstitial().catch(() => {});

      return { success: true };
    } catch (error) {
      this.isAdPlaying = false;
      console.error('AdMob showInterstitial error:', error);
      this.preloadInterstitial().catch(() => {});
      return { success: false, message: String(error) };
    }
  }

  /**
   * Checks if an ad should be displayed at level milestone.
   * Starts after Level 10 with a 6-level gap: Level 16, 22, 28, 34, 40, ...
   */
  public shouldShowLevelMilestoneAd(completedLevel: number, hasRemovedAds: boolean = false): boolean {
    if (hasRemovedAds) return false;
    return completedLevel >= 16 && (completedLevel - 10) % 6 === 0;
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
}

export const adService = new AdMobService();
