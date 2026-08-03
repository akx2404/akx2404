package com.akshad.learningcave;

import android.app.Activity;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.window.OnBackInvokedDispatcher;

public class MainActivity extends Activity {
    private WebView webView;

    @Override
    public void onCreate(Bundle state) {
        super.onCreate(state);

        Window window = getWindow();
        window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS
                | WindowManager.LayoutParams.FLAG_TRANSLUCENT_NAVIGATION);
        window.setStatusBarColor(Color.rgb(23, 18, 15));
        window.setNavigationBarColor(Color.rgb(23, 18, 15));

        // We handle system-bar space on a native root container. This is more
        // reliable on Pixel devices than asking WebView or CSS safe-area values
        // to guess the status-bar height.
        if (Build.VERSION.SDK_INT >= 30) {
            window.setDecorFitsSystemWindows(false);
        }

        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.rgb(23, 18, 15));

        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(23, 18, 15));
        webView.setOverScrollMode(WebView.OVER_SCROLL_NEVER);
        root.addView(webView, new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
        ));
        setContentView(root);

        if (Build.VERSION.SDK_INT >= 30) {
            root.setOnApplyWindowInsetsListener((view, insets) -> {
                android.graphics.Insets bars = insets.getInsets(
                        WindowInsets.Type.statusBars()
                                | WindowInsets.Type.navigationBars()
                                | WindowInsets.Type.displayCutout()
                );
                view.setPadding(bars.left, bars.top, bars.right, bars.bottom);
                return WindowInsets.CONSUMED;
            });
            root.requestApplyInsets();
        } else if (Build.VERSION.SDK_INT >= 21) {
            root.setFitsSystemWindows(true);
        }

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setTextZoom(100);

        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient());
        webView.loadUrl("file:///android_asset/index.html");

        if (Build.VERSION.SDK_INT >= 33) {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
                    OnBackInvokedDispatcher.PRIORITY_DEFAULT,
                    this::goBackInsideApp
            );
        }
    }

    private void goBackInsideApp() {
        webView.evaluateJavascript(
                "window.caveBack ? String(window.caveBack()) : 'false'",
                result -> {
                    if (result == null || result.contains("false")) finish();
                }
        );
    }

    @Override
    public void onBackPressed() {
        goBackInsideApp();
    }
}
