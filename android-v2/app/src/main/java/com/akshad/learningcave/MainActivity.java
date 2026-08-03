package com.akshad.learningcave;

import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.window.OnBackInvokedDispatcher;

public class MainActivity extends Activity {
    private WebView webView;

    @Override
    public void onCreate(Bundle state) {
        super.onCreate(state);

        getWindow().setStatusBarColor(Color.rgb(23, 18, 15));
        getWindow().setNavigationBarColor(Color.rgb(23, 18, 15));

        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(23, 18, 15));
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);

        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient());
        webView.loadUrl("file:///android_asset/index.html");

        if (android.os.Build.VERSION.SDK_INT >= 33) {
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
                if (result == null || result.contains("false")) {
                    finish();
                }
            }
        );
    }

    @Override
    public void onBackPressed() {
        goBackInsideApp();
    }
}
