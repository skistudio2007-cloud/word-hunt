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

export interface ShowRewardVideoResult {
  success: boolean;
  earnedReward: boolean;
  message?: string;
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
  private adSessionActive = false;
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
   * Uses the official AdMob reward event as the sole authority for earnedReward.
   */
  public async showRewardVideo(): Promise<ShowRewardVideoResult> {
    if (!Capacitor.isNativePlatform()) {
      return { success: false, earnedReward: false, message: 'web_platform' };
    }

    if (this.adSessionActive) {
      console.warn('⚠️ Rewarded ad session already active. Ignoring new request.');
      return { success: false, earnedReward: false, message: 'session_already_active' };
    }

    await this.initialize();
    this.adSessionActive = true;
    this.isAdPlaying = true;

    try {
      if (!this.isRewardedReady) {
        const ready = await this.preloadRewardVideo();
        if (!ready) {
          this.adSessionActive = false;
          this.isAdPlaying = false;
          return { success: false, earnedReward: false, message: 'ad_load_failed' };
        }
      }

      this.isRewardedReady = false;

      return await new Promise<ShowRewardVideoResult>(async (resolve) => {
        let rewardEarned = false;
        let rewardHandled = false;
        let adDidShow = false;
        let isSessionEnded = false;
        const listenerHandles: PluginListenerHandle[] = [];

        const cleanupAndFinish = async (result: ShowRewardVideoResult) => {
          if (isSessionEnded) return;
          isSessionEnded = true;

          // Remove all attached session listeners
          for (const handle of listenerHandles) {
            try {
              await handle.remove();
            } catch (e) {
              console.warn('Error removing ad listener:', e);
            }
          }

          this.adSessionActive = false;
          this.isAdPlaying = false;

          // Background preload next ad for future use
          this.preloadRewardVideo().catch(() => {});

          resolve(result);
        };

        try {
          // 1. Listen for official AdMob reward event
          const rewardSub = await AdMob.addListener(RewardAdPluginEvents.Rewarded, (rewardItem: AdMobRewardItem) => {
            console.log('🎯 AdMob RewardAdPluginEvents.Rewarded received:', rewardItem);
            rewardEarned = true;
          });
          listenerHandles.push(rewardSub);

          // 2. Listen for Ad Showed
          const showSub = await AdMob.addListener(RewardAdPluginEvents.Showed, () => {
            console.log('📺 AdMob Rewarded Ad Showed on screen');
            adDidShow = true;
          });
          listenerHandles.push(showSub);

          // 3. Listen for Failed to Show
          const failShowSub = await AdMob.addListener(RewardAdPluginEvents.FailedToShow, (err: AdMobError) => {
            console.error('❌ AdMob Rewarded Ad Failed to Show:', err);
            cleanupAndFinish({ success: false, earnedReward: false, message: 'ad_show_failed' });
          });
          listenerHandles.push(failShowSub);

          // 4. Listen for Ad Dismissed (Ad closed / skipped)
          const dismissSub = await AdMob.addListener(RewardAdPluginEvents.Dismissed, async () => {
            console.log('🚪 AdMob Rewarded Ad Dismissed');
            // Grace period: allow any in-flight asynchronous reward event or bridge resolution to settle
            await new Promise(r => setTimeout(r, 250));

            if (rewardEarned && !rewardHandled) {
              rewardHandled = true;
              console.log('✅ Ad closed with rewardEarned = true. Granting reward.');
              cleanupAndFinish({ success: true, earnedReward: true });
            } else if (!rewardHandled) {
              rewardHandled = true;
              console.log('🛑 Ad closed without rewardEarned. Early close.');
              cleanupAndFinish({ success: true, earnedReward: false, message: 'ad_closed_early' });
            }
          });
          listenerHandles.push(dismissSub);

          // 5. Invoke native showRewardVideoAd
          AdMob.showRewardVideoAd()
            .then((rewardResult) => {
              console.log('🎯 AdMob.showRewardVideoAd promise resolved:', rewardResult);
              rewardEarned = true;
            })
            .catch((showErr) => {
              console.warn('AdMob.showRewardVideoAd promise caught:', showErr);
              // If ad never showed, immediately fail
              if (!adDidShow) {
                cleanupAndFinish({ success: false, earnedReward: false, message: 'ad_show_failed' });
              }
              // If ad did show, dismissal listener will decide early close vs earned
            });

        } catch (setupError) {
          console.error('Error attaching listeners or showing ad:', setupError);
          cleanupAndFinish({ success: false, earnedReward: false, message: String(setupError) });
        }
      });
    } catch (error) {
      this.adSessionActive = false;
      this.isAdPlaying = false;
      console.error('AdMob showRewardVideo error:', error);
      this.preloadRewardVideo().catch(() => {});
      return { success: false, earnedReward: false, message: String(error) };
    }
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

  public isSessionActive(): boolean {
    return this.adSessionActive || this.isAdPlaying;
  }

  public setPlaying(playing: boolean): void {
    this.isAdPlaying = playing;
  }
}

export const adService = new AdMobService();
