package com.wordhunt.puzzle;

import android.os.Build;
import android.os.Bundle;
import android.view.Display;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        enableHighRefreshRate();
        optimizeWebView();
    }

    @Override
    public void onResume() {
        super.onResume();
        enableHighRefreshRate();
    }

    /**
     * Dynamically configures the window to match the device's highest supported
     * hardware display refresh rate (60Hz, 90Hz, 120Hz, 144Hz).
     */
    private void enableHighRefreshRate() {
        try {
            Window window = getWindow();
            if (window == null) return;

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                Display display = getDisplay();
                if (display != null) {
                    Display.Mode[] modes = display.getSupportedModes();
                    Display.Mode bestMode = null;
                    float highestRate = 60.0f;
                    for (Display.Mode mode : modes) {
                        if (mode.getRefreshRate() > highestRate) {
                            highestRate = mode.getRefreshRate();
                            bestMode = mode;
                        }
                    }
                    if (bestMode != null) {
                        WindowManager.LayoutParams params = window.getAttributes();
                        params.preferredDisplayModeId = bestMode.getModeId();
                        params.preferredRefreshRate = highestRate;
                        window.setAttributes(params);
                    }
                }
            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                Display display = getWindowManager().getDefaultDisplay();
                if (display != null) {
                    Display.Mode[] modes = display.getSupportedModes();
                    Display.Mode bestMode = null;
                    float highestRate = 60.0f;
                    for (Display.Mode mode : modes) {
                        if (mode.getRefreshRate() > highestRate) {
                            highestRate = mode.getRefreshRate();
                            bestMode = mode;
                        }
                    }
                    if (bestMode != null) {
                        WindowManager.LayoutParams params = window.getAttributes();
                        params.preferredDisplayModeId = bestMode.getModeId();
                        window.setAttributes(params);
                    }
                }
            }
        } catch (Exception ignored) {
        }
    }

    /**
     * Enables hardware acceleration layers, high render priority, and smooth rasterization
     */
    private void optimizeWebView() {
        try {
            if (this.bridge != null && this.bridge.getWebView() != null) {
                WebView webView = this.bridge.getWebView();
                webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
                
                WebSettings settings = webView.getSettings();
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    settings.setOffscreenPreRaster(true);
                }
            }
        } catch (Exception ignored) {
        }
    }
}
