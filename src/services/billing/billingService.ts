import { AmazonBillingProvider } from './amazonBilling';
import { GooglePlayBillingProvider } from './googlePlayBilling';
import {
  IBillingProvider,
  ProductDetails,
  PurchaseResult,
  RestorePurchasesResult
} from './types';

/**
 * Official Amazon Appstore Product SKU for Remove Ads
 */
export const AMAZON_SKU_REMOVE_ADS = 'wordhunter_remove_ads';

/**
 * Unified BillingService for Word Hunter
 * 
 * Communicates with the active store provider (Amazon Appstore currently,
 * Google Play Store in future) through the clean IBillingProvider abstraction.
 */
class UnifiedBillingService {
  private activeProvider: IBillingProvider;
  private cachedProduct: ProductDetails | null = null;
  private isInitialized = false;
  private entitlementListeners: ((hasRemovedAds: boolean) => void)[] = [];

  constructor() {
    // Current target store: Amazon Appstore
    this.activeProvider = new AmazonBillingProvider();
  }

  /**
   * Allows switching provider dynamically if multi-store targeting is used.
   */
  public setProvider(provider: IBillingProvider) {
    this.activeProvider = provider;
    this.isInitialized = false;
    this.cachedProduct = null;
  }

  public getProviderName(): string {
    return this.activeProvider.providerName;
  }

  /**
   * Initializes the active billing provider and registers listeners.
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.activeProvider.initialize();
      this.isInitialized = true;

      // Register listener for external entitlement updates
      if (this.activeProvider.addListener) {
        this.activeProvider.addListener('entitlementUpdated', (data: any) => {
          console.log('🔔 BillingService: entitlementUpdated event received:', data);
          const hasRemovedAds = !!data?.hasRemovedAds;
          this.notifyEntitlementChanged(hasRemovedAds);
        });
      }

      // Pre-fetch product details in background
      this.getRemoveAdsProduct().catch(() => {});
    } catch (e) {
      console.warn('⚠️ BillingService initialize warning:', e);
    }
  }

  /**
   * Loads product information for the Remove Ads product (price, title, etc.)
   */
  public async getRemoveAdsProduct(): Promise<ProductDetails | null> {
    if (this.cachedProduct) return this.cachedProduct;

    try {
      const map = await this.activeProvider.getProductDetails([AMAZON_SKU_REMOVE_ADS]);
      const product = map.get(AMAZON_SKU_REMOVE_ADS);
      if (product) {
        this.cachedProduct = product;
        return product;
      }
    } catch (e) {
      console.warn('⚠️ Failed to load Remove Ads product details:', e);
    }

    // Default static fallback while loading or offline
    return {
      productId: AMAZON_SKU_REMOVE_ADS,
      title: 'Remove Ads',
      description: 'Pure ad-free offline gameplay',
      price: '₹199',
      type: 'ENTITLED'
    };
  }

  /**
   * Initiates the store purchase flow for Remove Ads.
   * Only unlocks if the store confirms SUCCESS or ALREADY_OWNED.
   */
  public async purchaseRemoveAds(): Promise<PurchaseResult> {
    try {
      await this.initialize();
      console.log('🛒 BillingService: Requesting purchase for SKU:', AMAZON_SKU_REMOVE_ADS);
      const result = await this.activeProvider.purchase(AMAZON_SKU_REMOVE_ADS);

      if (result.success) {
        this.notifyEntitlementChanged(true);
      }

      return result;
    } catch (e: any) {
      console.error('BillingService purchaseRemoveAds error:', e);
      return {
        success: false,
        productId: AMAZON_SKU_REMOVE_ADS,
        state: 'FAILED',
        message: e?.message || 'Purchase failed'
      };
    }
  }

  /**
   * Queries store purchase updates and restores previously purchased entitlements.
   */
  public async restorePurchases(): Promise<RestorePurchasesResult> {
    try {
      await this.initialize();
      console.log('🔄 BillingService: Restoring purchases from store...');
      const result = await this.activeProvider.restorePurchases();

      if (result.hasRemovedAds) {
        this.notifyEntitlementChanged(true);
      }

      return result;
    } catch (e: any) {
      console.error('BillingService restorePurchases error:', e);
      return {
        success: false,
        hasRemovedAds: false,
        message: e?.message || 'Failed to restore purchases'
      };
    }
  }

  /**
   * Verifies entitlement status on application startup.
   * Checks both store purchase records and verified local receipt cache.
   */
  public async checkEntitlementsOnStartup(): Promise<boolean> {
    try {
      await this.initialize();
      // Check native verified storage first (instant O(1))
      const hasEntitlement = await this.activeProvider.checkEntitlement(AMAZON_SKU_REMOVE_ADS);
      if (hasEntitlement) {
        return true;
      }

      // Also trigger purchase updates to sync with Amazon cloud
      const updateResult = await this.activeProvider.restorePurchases();
      return updateResult.hasRemovedAds;
    } catch (e) {
      console.warn('BillingService checkEntitlementsOnStartup error:', e);
      return false;
    }
  }

  public onEntitlementChanged(callback: (hasRemovedAds: boolean) => void): () => void {
    this.entitlementListeners.push(callback);
    return () => {
      this.entitlementListeners = this.entitlementListeners.filter(l => l !== callback);
    };
  }

  private notifyEntitlementChanged(hasRemovedAds: boolean) {
    for (const listener of this.entitlementListeners) {
      try {
        listener(hasRemovedAds);
      } catch (e) {
        console.error('Error in entitlement listener:', e);
      }
    }
  }
}

export const billingService = new UnifiedBillingService();
export * from './types';
