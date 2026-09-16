import {
  IBillingProvider,
  ProductDetails,
  PurchaseResult,
  RestorePurchasesResult
} from './types';

/**
 * GooglePlayBillingProvider (Future Extension)
 * 
 * Implements IBillingProvider.
 * When publishing Word Hunter to the Google Play Store in the future,
 * the Google Play Billing client plugin can be plugged in here
 * without modifying any game UI or core gameplay logic.
 */
export class GooglePlayBillingProvider implements IBillingProvider {
  public readonly providerName = 'GOOGLE_PLAY' as const;

  public async initialize(): Promise<void> {
    console.log('GooglePlayBillingProvider: Placeholder initialized (ready for future Google Play release)');
  }

  public async getProductDetails(productIds: string[]): Promise<Map<string, ProductDetails>> {
    const map = new Map<string, ProductDetails>();
    for (const id of productIds) {
      map.set(id, {
        productId: id,
        title: 'Remove Ads',
        description: 'Pure ad-free gameplay',
        price: '₹199',
        type: 'ENTITLED'
      });
    }
    return map;
  }

  public async purchase(productId: string): Promise<PurchaseResult> {
    return {
      success: false,
      productId,
      state: 'UNAVAILABLE',
      message: 'Google Play Billing is not active for this build target (Amazon Appstore build).'
    };
  }

  public async restorePurchases(): Promise<RestorePurchasesResult> {
    return {
      success: false,
      hasRemovedAds: false,
      message: 'Google Play Billing is not active for this build target.'
    };
  }

  public async checkEntitlement(_productId: string): Promise<boolean> {
    return false;
  }
}
