import { Capacitor, registerPlugin } from '@capacitor/core';
import {
  IBillingProvider,
  ProductDetails,
  PurchaseResult,
  RestorePurchasesResult
} from './types';

interface AmazonIapPluginNative {
  initialize(): Promise<{ success: boolean; sdkVersion?: string; hasRemovedAds?: boolean; message?: string }>;
  getProductData(options: { skus: string[] }): Promise<{ success: boolean; products?: ProductDetails[]; message?: string }>;
  purchase(options: { sku: string }): Promise<{
    success: boolean;
    state: string;
    productId?: string;
    receiptId?: string;
    message?: string;
  }>;
  getPurchaseUpdates(options?: { reset?: boolean }): Promise<{
    success: boolean;
    hasRemovedAds: boolean;
    count?: number;
    message?: string;
  }>;
  checkEntitlement(): Promise<{ success: boolean; hasRemovedAds: boolean }>;
  addListener(eventName: string, listenerFunc: (data: any) => void): Promise<{ remove: () => void }>;
}

const AmazonIapNative = registerPlugin<AmazonIapPluginNative>('AmazonIap');

export class AmazonBillingProvider implements IBillingProvider {
  public readonly providerName = 'AMAZON' as const;
  private isInitialized = false;

  public async initialize(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      console.log('🌐 AmazonBillingProvider: Running in Web fallback mode');
      this.isInitialized = true;
      return;
    }

    try {
      const res = await AmazonIapNative.initialize();
      this.isInitialized = res.success;
      console.log('🛒 Amazon IAP initialized successfully:', res);
    } catch (e) {
      console.warn('⚠️ Amazon IAP initialize error:', e);
      this.isInitialized = false;
    }
  }

  public async getProductDetails(productIds: string[]): Promise<Map<string, ProductDetails>> {
    const map = new Map<string, ProductDetails>();

    if (!Capacitor.isNativePlatform()) {
      for (const id of productIds) {
        map.set(id, {
          productId: id,
          title: 'Remove Ads',
          description: 'Ad-free monthly subscription for Word Hunter ($1.99/mo)',
          price: '$1.99 / mo',
          type: 'SUBSCRIPTION',
          subscriptionPeriod: 'Monthly'
        });
      }
      return map;
    }

    try {
      const res = await AmazonIapNative.getProductData({ skus: productIds });
      if (res.success && res.products) {
        for (const p of res.products) {
          map.set(p.productId, {
            ...p,
            type: 'SUBSCRIPTION',
            subscriptionPeriod: 'Monthly'
          });
        }
      }
    } catch (e) {
      console.warn('⚠️ Amazon getProductDetails error:', e);
    }

    // Fallback if network or offline
    for (const id of productIds) {
      if (!map.has(id)) {
        map.set(id, {
          productId: id,
          title: 'Remove Ads',
          description: 'Ad-free monthly subscription for Word Hunter ($1.99/mo)',
          price: '$1.99 / mo',
          type: 'SUBSCRIPTION',
          subscriptionPeriod: 'Monthly'
        });
      }
    }

    return map;
  }

  public async purchase(productId: string): Promise<PurchaseResult> {
    if (!Capacitor.isNativePlatform()) {
      console.log('🌐 AmazonBillingProvider: Simulated Web purchase for', productId);
      return {
        success: true,
        productId,
        state: 'SUCCESS',
        message: 'Web simulated purchase success'
      };
    }

    try {
      const res = await AmazonIapNative.purchase({ sku: productId });
      return {
        success: res.success,
        productId,
        receiptId: res.receiptId,
        state: (res.state as any) || (res.success ? 'SUCCESS' : 'FAILED'),
        message: res.message
      };
    } catch (e: any) {
      console.error('Amazon purchase error:', e);
      return {
        success: false,
        productId,
        state: 'FAILED',
        message: e?.message || 'Purchase failed'
      };
    }
  }

  public async restorePurchases(): Promise<RestorePurchasesResult> {
    if (!Capacitor.isNativePlatform()) {
      return {
        success: true,
        hasRemovedAds: false,
        message: 'Web preview: No native purchases to restore'
      };
    }

    try {
      const res = await AmazonIapNative.getPurchaseUpdates({ reset: true });
      return {
        success: res.success,
        hasRemovedAds: res.hasRemovedAds,
        count: res.count,
        message: res.message
      };
    } catch (e: any) {
      console.error('Amazon restorePurchases error:', e);
      return {
        success: false,
        hasRemovedAds: false,
        message: e?.message || 'Failed to restore purchases'
      };
    }
  }

  public async checkEntitlement(productId: string): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      return false;
    }

    try {
      const res = await AmazonIapNative.checkEntitlement();
      return res.hasRemovedAds;
    } catch (e) {
      console.warn('Amazon checkEntitlement error:', e);
      return false;
    }
  }

  public addListener(event: string, callback: (data: any) => void) {
    if (!Capacitor.isNativePlatform()) return;
    try {
      AmazonIapNative.addListener(event, callback);
    } catch (e) {
      console.warn('Amazon addListener warning:', e);
    }
  }
}
