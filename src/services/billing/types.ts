export type ProductType = 'ENTITLED' | 'CONSUMABLE' | 'SUBSCRIPTION';

export type PurchaseState =
  | 'SUCCESS'
  | 'CANCELLED'
  | 'FAILED'
  | 'PENDING'
  | 'ALREADY_OWNED'
  | 'UNAVAILABLE';

export interface ProductDetails {
  productId: string;
  title: string;
  description: string;
  price: string;
  type: ProductType;
  subscriptionPeriod?: 'Monthly' | 'Annual';
}

export interface PurchaseResult {
  success: boolean;
  productId: string;
  receiptId?: string;
  userId?: string;
  state: PurchaseState;
  message?: string;
}

export interface RestorePurchasesResult {
  success: boolean;
  hasRemovedAds: boolean;
  count?: number;
  message?: string;
}

export interface IBillingProvider {
  readonly providerName: 'AMAZON' | 'GOOGLE_PLAY' | 'WEB_MOCK';
  initialize(): Promise<void>;
  getProductDetails(productIds: string[]): Promise<Map<string, ProductDetails>>;
  purchase(productId: string): Promise<PurchaseResult>;
  restorePurchases(): Promise<RestorePurchasesResult>;
  checkEntitlement(productId: string): Promise<boolean>;
  addListener?(event: string, callback: (data: any) => void): { remove: () => void } | void;
}
