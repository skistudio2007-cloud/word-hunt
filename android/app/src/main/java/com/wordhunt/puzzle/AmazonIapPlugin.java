package com.wordhunt.puzzle;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import com.amazon.device.iap.PurchasingListener;
import com.amazon.device.iap.PurchasingService;
import com.amazon.device.iap.model.FulfillmentResult;
import com.amazon.device.iap.model.Product;
import com.amazon.device.iap.model.ProductDataResponse;
import com.amazon.device.iap.model.PurchaseResponse;
import com.amazon.device.iap.model.PurchaseUpdatesResponse;
import com.amazon.device.iap.model.Receipt;
import com.amazon.device.iap.model.RequestId;
import com.amazon.device.iap.model.UserData;
import com.amazon.device.iap.model.UserDataResponse;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONException;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@CapacitorPlugin(name = "AmazonIap")
public class AmazonIapPlugin extends Plugin implements PurchasingListener {
    private static final String TAG = "AmazonIapPlugin";
    private static final String PREFS_NAME = "wordhunter_amazon_iap_prefs";
    private static final String KEY_HAS_REMOVED_ADS = "has_removed_ads_entitled";
    public static final String SKU_REMOVE_ADS = "wordhunter_remove_ads";

    private boolean isInitialized = false;
    private String currentUserId = null;
    private String currentMarketplace = null;

    // Track active requests by RequestId
    private final Map<RequestId, PluginCall> pendingCalls = new ConcurrentHashMap<>();
    private final Handler mainHandler = new Handler(Looper.getMainLooper());

    @Override
    public void load() {
        super.load();
        initAmazonIap();
    }

    private synchronized void initAmazonIap() {
        if (isInitialized) return;
        try {
            Context ctx = getContext();
            if (ctx != null) {
                PurchasingService.registerListener(ctx, this);
                PurchasingService.getUserData();
                isInitialized = true;
                Log.d(TAG, "Amazon PurchasingService registered with SDK version: " + PurchasingService.SDK_VERSION);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error initializing Amazon IAP listener", e);
        }
    }

    @PluginMethod
    public void initialize(PluginCall call) {
        try {
            initAmazonIap();
            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("sdkVersion", PurchasingService.SDK_VERSION);
            ret.put("hasRemovedAds", hasLocalEntitlement());
            call.resolve(ret);
        } catch (Exception e) {
            Log.e(TAG, "initialize failed", e);
            JSObject ret = new JSObject();
            ret.put("success", false);
            ret.put("message", e.getMessage());
            ret.put("hasRemovedAds", hasLocalEntitlement());
            call.resolve(ret);
        }
    }

    @PluginMethod
    public void getProductData(PluginCall call) {
        try {
            initAmazonIap();
            JSArray skusArray = call.getArray("skus");
            if (skusArray == null || skusArray.length() == 0) {
                call.reject("Must provide 'skus' array");
                return;
            }

            Set<String> skuSet = new HashSet<>();
            for (int i = 0; i < skusArray.length(); i++) {
                skuSet.add(skusArray.getString(i));
            }

            RequestId reqId = PurchasingService.getProductData(skuSet);
            pendingCalls.put(reqId, call);

            // Timeout safety: 15 seconds
            mainHandler.postDelayed(() -> {
                PluginCall pending = pendingCalls.remove(reqId);
                if (pending != null) {
                    JSObject fallback = new JSObject();
                    fallback.put("success", false);
                    fallback.put("message", "Product data request timed out");
                    pending.resolve(fallback);
                }
            }, 15000);

        } catch (Exception e) {
            Log.e(TAG, "getProductData error", e);
            call.reject("Failed to request product data: " + e.getMessage());
        }
    }

    @PluginMethod
    public void purchase(PluginCall call) {
        try {
            initAmazonIap();
            String sku = call.getString("sku");
            if (sku == null || sku.isEmpty()) {
                call.reject("Must provide 'sku' parameter");
                return;
            }

            // If already permanently entitled, verify and return
            if (SKU_REMOVE_ADS.equals(sku) && hasLocalEntitlement()) {
                JSObject already = new JSObject();
                already.put("success", true);
                already.put("state", "ALREADY_OWNED");
                already.put("sku", sku);
                already.put("message", "Item already owned");
                call.resolve(already);
                return;
            }

            Log.d(TAG, "Initiating purchase for SKU: " + sku);
            RequestId reqId = PurchasingService.purchase(sku);
            pendingCalls.put(reqId, call);

            // Timeout safety: 45 seconds for purchase dialog
            mainHandler.postDelayed(() -> {
                PluginCall pending = pendingCalls.remove(reqId);
                if (pending != null) {
                    JSObject timeout = new JSObject();
                    timeout.put("success", false);
                    timeout.put("state", "FAILED");
                    timeout.put("message", "Purchase request timed out");
                    pending.resolve(timeout);
                }
            }, 45000);

        } catch (Exception e) {
            Log.e(TAG, "purchase error", e);
            JSObject err = new JSObject();
            err.put("success", false);
            err.put("state", "FAILED");
            err.put("message", e.getMessage());
            call.resolve(err);
        }
    }

    @PluginMethod
    public void getPurchaseUpdates(PluginCall call) {
        try {
            initAmazonIap();
            boolean reset = call.getBoolean("reset", true);
            RequestId reqId = PurchasingService.getPurchaseUpdates(reset);
            pendingCalls.put(reqId, call);

            // Timeout safety: 15 seconds
            mainHandler.postDelayed(() -> {
                PluginCall pending = pendingCalls.remove(reqId);
                if (pending != null) {
                    JSObject timeout = new JSObject();
                    timeout.put("success", true);
                    timeout.put("hasRemovedAds", hasLocalEntitlement());
                    timeout.put("message", "Purchase updates sync completed via cached state");
                    pending.resolve(timeout);
                }
            }, 15000);

        } catch (Exception e) {
            Log.e(TAG, "getPurchaseUpdates error", e);
            JSObject fallback = new JSObject();
            fallback.put("success", false);
            fallback.put("hasRemovedAds", hasLocalEntitlement());
            fallback.put("message", e.getMessage());
            call.resolve(fallback);
        }
    }

    @PluginMethod
    public void checkEntitlement(PluginCall call) {
        try {
            boolean entitled = hasLocalEntitlement();
            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("hasRemovedAds", entitled);
            call.resolve(ret);
        } catch (Exception e) {
            JSObject ret = new JSObject();
            ret.put("success", false);
            ret.put("hasRemovedAds", false);
            call.resolve(ret);
        }
    }

    // =========================================================================
    // PurchasingListener Callbacks
    // =========================================================================

    @Override
    public void onUserDataResponse(UserDataResponse userDataResponse) {
        Log.d(TAG, "onUserDataResponse: " + userDataResponse.getRequestStatus());
        if (userDataResponse.getRequestStatus() == UserDataResponse.RequestStatus.SUCCESSFUL) {
            UserData userData = userDataResponse.getUserData();
            if (userData != null) {
                currentUserId = userData.getUserId();
                currentMarketplace = userData.getMarketplace();
                Log.d(TAG, "Amazon User: " + currentUserId + " in " + currentMarketplace);
            }
        }
    }

    @Override
    public void onProductDataResponse(ProductDataResponse productDataResponse) {
        RequestId reqId = productDataResponse.getRequestId();
        Log.d(TAG, "onProductDataResponse for reqId: " + reqId + " status: " + productDataResponse.getRequestStatus());

        PluginCall call = pendingCalls.remove(reqId);
        if (call == null) return;

        if (productDataResponse.getRequestStatus() == ProductDataResponse.RequestStatus.SUCCESSFUL) {
            Map<String, Product> productMap = productDataResponse.getProductData();
            JSObject ret = new JSObject();
            ret.put("success", true);

            JSArray productsArr = new JSArray();
            if (productMap != null) {
                for (Map.Entry<String, Product> entry : productMap.entrySet()) {
                    Product p = entry.getValue();
                    JSObject prodObj = new JSObject();
                    prodObj.put("productId", p.getSku());
                    prodObj.put("title", p.getTitle());
                    prodObj.put("description", p.getDescription());
                    prodObj.put("price", p.getPrice());
                    prodObj.put("type", p.getProductType() != null ? p.getProductType().name() : "ENTITLED");
                    productsArr.put(prodObj);
                }
            }
            ret.put("products", productsArr);
            call.resolve(ret);
        } else {
            JSObject ret = new JSObject();
            ret.put("success", false);
            ret.put("message", "ProductData request failed: " + productDataResponse.getRequestStatus());
            call.resolve(ret);
        }
    }

    private boolean isSubscriptionActive(Receipt receipt) {
        if (receipt == null) return false;
        if (receipt.isCanceled()) return false;
        java.util.Date cancelDate = receipt.getCancelDate();
        if (cancelDate != null && cancelDate.before(new java.util.Date())) {
            return false; // Expired or cancelled
        }
        return true;
    }

    @Override
    public void onPurchaseResponse(PurchaseResponse purchaseResponse) {
        RequestId reqId = purchaseResponse.getRequestId();
        PurchaseResponse.RequestStatus status = purchaseResponse.getRequestStatus();
        Log.d(TAG, "onPurchaseResponse for reqId: " + reqId + " status: " + status);

        PluginCall call = pendingCalls.remove(reqId);

        switch (status) {
            case SUCCESSFUL:
                Receipt receipt = purchaseResponse.getReceipt();
                if (receipt != null && isSubscriptionActive(receipt)) {
                    String sku = receipt.getSku();
                    Log.d(TAG, "Subscription purchase SUCCESSFUL for SKU: " + sku + ", receiptId: " + receipt.getReceiptId());

                    // Notify Amazon Appstore of fulfillment
                    PurchasingService.notifyFulfillment(receipt.getReceiptId(), FulfillmentResult.FULFILLED);

                    if (SKU_REMOVE_ADS.equals(sku)) {
                        setLocalEntitlement(true);
                    }

                    JSObject event = new JSObject();
                    event.put("productId", sku);
                    event.put("hasRemovedAds", true);
                    notifyListeners("entitlementUpdated", event);

                    if (call != null) {
                        JSObject success = new JSObject();
                        success.put("success", true);
                        success.put("state", "SUCCESS");
                        success.put("productId", sku);
                        success.put("receiptId", receipt.getReceiptId());
                        call.resolve(success);
                    }
                } else {
                    if (call != null) {
                        JSObject failed = new JSObject();
                        failed.put("success", false);
                        failed.put("state", "FAILED");
                        failed.put("message", "Subscription receipt was null, cancelled or expired");
                        call.resolve(failed);
                    }
                }
                break;

            case ALREADY_PURCHASED:
                Receipt existingReceipt = purchaseResponse.getReceipt();
                String ownedSku = existingReceipt != null ? existingReceipt.getSku() : SKU_REMOVE_ADS;
                boolean active = isSubscriptionActive(existingReceipt);
                Log.d(TAG, "Subscription ALREADY_PURCHASED: " + ownedSku + " active=" + active);

                if (existingReceipt != null && active) {
                    PurchasingService.notifyFulfillment(existingReceipt.getReceiptId(), FulfillmentResult.FULFILLED);
                }
                if (SKU_REMOVE_ADS.equals(ownedSku)) {
                    setLocalEntitlement(active);
                }

                JSObject event = new JSObject();
                event.put("productId", ownedSku);
                event.put("hasRemovedAds", active);
                notifyListeners("entitlementUpdated", event);

                if (call != null) {
                    JSObject already = new JSObject();
                    already.put("success", active);
                    already.put("state", active ? "ALREADY_OWNED" : "CANCELLED");
                    already.put("productId", ownedSku);
                    already.put("message", active ? "Subscription already active" : "Subscription expired");
                    call.resolve(already);
                }
                break;

            case INVALID_SKU:
                Log.w(TAG, "Purchase failed: INVALID_SKU");
                if (call != null) {
                    JSObject invalid = new JSObject();
                    invalid.put("success", false);
                    invalid.put("state", "UNAVAILABLE");
                    invalid.put("message", "Invalid product SKU");
                    call.resolve(invalid);
                }
                break;

            case NOT_SUPPORTED:
                Log.w(TAG, "Purchase failed: NOT_SUPPORTED");
                if (call != null) {
                    JSObject notSupp = new JSObject();
                    notSupp.put("success", false);
                    notSupp.put("state", "UNAVAILABLE");
                    notSupp.put("message", "In-App Purchasing not supported on this device");
                    call.resolve(notSupp);
                }
                break;

            case FAILED:
            default:
                Log.w(TAG, "Purchase failed with status: " + status);
                if (call != null) {
                    JSObject failed = new JSObject();
                    failed.put("success", false);
                    failed.put("state", "FAILED");
                    failed.put("message", "Purchase was canceled or failed");
                    call.resolve(failed);
                }
                break;
        }
    }

    @Override
    public void onPurchaseUpdatesResponse(PurchaseUpdatesResponse purchaseUpdatesResponse) {
        RequestId reqId = purchaseUpdatesResponse.getRequestId();
        PurchaseUpdatesResponse.RequestStatus status = purchaseUpdatesResponse.getRequestStatus();
        Log.d(TAG, "onPurchaseUpdatesResponse: " + status);

        PluginCall call = pendingCalls.remove(reqId);
        boolean foundRemoveAds = false;

        if (status == PurchaseUpdatesResponse.RequestStatus.SUCCESSFUL) {
            List<Receipt> receipts = purchaseUpdatesResponse.getReceipts();
            if (receipts != null) {
                for (Receipt r : receipts) {
                    if (SKU_REMOVE_ADS.equals(r.getSku())) {
                        if (isSubscriptionActive(r)) {
                            foundRemoveAds = true;
                            PurchasingService.notifyFulfillment(r.getReceiptId(), FulfillmentResult.FULFILLED);
                            Log.d(TAG, "Active subscription verified: " + r.getSku());
                        } else {
                            Log.d(TAG, "Subscription was canceled or expired: " + r.getSku());
                        }
                    }
                }
            }

            // If subscription expired or was cancelled, revokes entitlement and reactivates ads!
            setLocalEntitlement(foundRemoveAds);

            JSObject event = new JSObject();
            event.put("hasRemovedAds", foundRemoveAds);
            notifyListeners("entitlementUpdated", event);

            if (call != null) {
                JSObject ret = new JSObject();
                ret.put("success", true);
                ret.put("hasRemovedAds", foundRemoveAds);
                ret.put("count", receipts != null ? receipts.size() : 0);
                call.resolve(ret);
            }
        } else {
            if (call != null) {
                JSObject ret = new JSObject();
                ret.put("success", false);
                ret.put("hasRemovedAds", hasLocalEntitlement());
                ret.put("message", "Purchase updates query returned status: " + status);
                call.resolve(ret);
            }
        }
    }

    // =========================================================================
    // Local Verified Storage Helper
    // =========================================================================

    private boolean hasLocalEntitlement() {
        try {
            Context ctx = getContext();
            if (ctx == null) return false;
            SharedPreferences prefs = ctx.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            return prefs.getBoolean(KEY_HAS_REMOVED_ADS, false);
        } catch (Exception e) {
            return false;
        }
    }

    private void setLocalEntitlement(boolean entitled) {
        try {
            Context ctx = getContext();
            if (ctx == null) return;
            SharedPreferences prefs = ctx.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            prefs.edit().putBoolean(KEY_HAS_REMOVED_ADS, entitled).apply();
        } catch (Exception ignored) {
        }
    }
}
