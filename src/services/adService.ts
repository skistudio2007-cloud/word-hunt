/**
 * Rewarded Ad Service Configuration and Manager
 * Allows easy configuration of Test and Production Ad Unit IDs
 */

export interface AdConfig {
  appId: string;
  rewardedAdUnitId: string;
  interstitialAdUnitId: string;
  isTestMode: boolean;
}

// Google AdMob configuration (Official User Production AdMob IDs)
export const DEFAULT_AD_CONFIG: AdConfig = {
  appId: 'ca-app-pub-2007565791914092~7531337749',
  rewardedAdUnitId: 'ca-app-pub-2007565791914092/1828806113', // User Rewarded Video Ad Unit ID
  interstitialAdUnitId: 'ca-app-pub-2007565791914092/4518161594', // User Interstitial Ad Unit ID
  isTestMode: false
};

class RewardedAdService {
  private config: AdConfig = { ...DEFAULT_AD_CONFIG };
  private isAdPlaying: boolean = false;
  private isAdAvailable: boolean = true;

  /**
   * Checks if an ad should be displayed at level milestone.
   * Starts at Level 10, then triggers every 6 levels (10, 16, 22, 28, 34, ...).
   */
  public shouldShowLevelMilestoneAd(completedLevel: number, hasRemovedAds: boolean = false): boolean {
    if (hasRemovedAds) return false;
    return completedLevel >= 10 && (completedLevel - 10) % 6 === 0;
  }

  /**
   * Set production or custom ad unit ID dynamically
   */
  public setConfig(customConfig: Partial<AdConfig>): void {
    this.config = { ...this.config, ...customConfig };
  }

  public getConfig(): AdConfig {
    return { ...this.config };
  }

  public checkIsAdAvailable(): boolean {
    return this.isAdAvailable;
  }

  public setAdAvailable(available: boolean): void {
    this.isAdAvailable = available;
  }

  public isPlaying(): boolean {
    return this.isAdPlaying;
  }

  public setPlaying(playing: boolean): void {
    this.isAdPlaying = playing;
  }
}

export const adService = new RewardedAdService();
