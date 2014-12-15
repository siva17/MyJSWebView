package com.siva4u.myjswebview.base;

import android.annotation.SuppressLint;
import android.content.Context;
import android.os.Build;
import android.util.AttributeSet;
import android.webkit.WebView;
import android.webkit.WebViewClient;

@SuppressLint({ "SetJavaScriptEnabled", "NewApi" })
public class MyJSWebView extends WebView {

	private Boolean isInitialized = false;

	private void initMyJSWebView() {
		this.getSettings().setJavaScriptEnabled(true);
		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
			WebView.setWebContentsDebuggingEnabled(true);
		}
		this.setWebViewClient(new MyJSWebViewClient());

		if (isInitialized == false) {
			this.loadUrl("javascript: window.MY=window.MY||{};MY=(function(b,c){var a={};c.invokeJSCallback=function(g,j,f){if(g){var d=a[g];if(d){if(j){delete (a[g])}var i='';try{i=JSON.parse(f)}catch(h){}if(i.callbackID){delete (i.callbackID)}d.call(null,i)}}};c.getNativeParam=function(d){if(d){if(d.callback){var f='cbID'+(+new Date);a[f]=d.callback;d.callbackID=f}try{return JSON.stringify(d)}catch(g){}}return''};return c})(window,MY);");
			isInitialized = true;
		}
	}

	private class MyJSWebViewClient extends WebViewClient {
		@Override
		public boolean shouldOverrideUrlLoading(WebView view, String url) {
			System.out
					.println("MyJSWebViewApp: shouldOverrideUrlLoading: START");

			System.out.println("MyJSWebViewApp: shouldOverrideUrlLoading: END");
			return false;
		}

		public void onPageFinished(WebView view, String url) {
			System.out.println("MyJSWebViewApp: onPageFinished: START");

			System.out.println("MyJSWebViewApp: onPageFinished: END");
		}
	}

	public MyJSWebView(Context context) {
		super(context);
		initMyJSWebView();
	}

	public MyJSWebView(Context context, AttributeSet attrs) {
		super(context, attrs);
		initMyJSWebView();
	}

	public MyJSWebView(Context context, AttributeSet attrs, int defStyle) {
		super(context, attrs, defStyle);
		initMyJSWebView();
	}

	public MyJSWebView(Context context, AttributeSet attrs, int defStyleAttr,
			int defStyleRes) {
		super(context, attrs, defStyleAttr, defStyleRes);
		initMyJSWebView();
	}

	public void registerJavaScriptAPI(MyJSBaseNativeModule instance) {
		addJavascriptInterface(instance, instance.getClass().getSimpleName());
	}
}
