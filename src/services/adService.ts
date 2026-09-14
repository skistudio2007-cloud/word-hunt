/**
 * Real Google AdMob Service for WORD HUNT
 * Supports Native Android (via @capacitor-community/admob) with Web Fallback.
 * Features background ad preloading for zero-latency playback.
 */

import { Capacitor } from '@capacitor/core';
import { AdMob, AdMobInitializationOptions } from '@capacitor-community/admob';

export interface AdConfig {
  appId: string;
  rewardedAdUnitId: string;
  interstitialAdUnitId: string;
  isTestMode: boolean;
}

// Google's Official Test Ad Unit IDs (used as safety fallback if real ad has no-fill)
const GOOGLE_TEST_REWARDED_ID = 'ca-app-pub-3940256099942544/5224354917';
const GOOGLE_TEST_INTERSTITIAL_ID = 'ca-app-pub-3940256099942544/1033173712';

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
   */
  public async preloadRewardVideo(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return false;
    try {
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
   * Resolves when the user completes watching and earns the reward.
   */
  public async showRewardVideo(): Promise<{ success: boolean; earnedReward: boolean; message?: string }> {
    if (!Capacitor.isNativePlatform()) {
      return { success: false, earnedReward: false, message: 'web_platform' };
    }

    await this.initialize();
    this.isAdPlaying = true;

    try {
      if (!this.isRewardedReady) {
        const ready = await this.preloadRewardVideo();
        if (!ready) {
          this.isAdPlaying = false;
          return { success: false, earnedReward: false, message: 'ad_load_failed' };
        }
      }

      this.isRewardedReady = false;
      const result = await AdMob.showRewardVideoAd();
      this.isAdPlaying = false;

      // Preload next ad in background
      this.preloadRewardVideo().catch(() => {});

      return { success: true, earnedReward: true };
    } catch (error) {
      this.isAdPlaying = false;
      console.error('AdMob showRewardVideoAd error:', error);
      // Preload next ad in background
      this.preloadRewardVideo().catch(() => {});
      return { success: false, earnedReward: false, message: String(error) };
    }
  }

  /**
   * Pre-loads a real Google AdMob interstitial ad in memory.
   */
  public async preloadInterstitial(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return false;
    try {
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
   * Starts at Level 10, then triggers every 6 levels (10, 16, 22, 28, 34, ...).
   */
  public shouldShowLevelMilestoneAd(completedLevel: number, hasRemovedAds: boolean = false): boolean {
    if (hasRemovedAds) return false;
    return completedLevel >= 10 && (completedLevel - 10) % 6 === 0;
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
