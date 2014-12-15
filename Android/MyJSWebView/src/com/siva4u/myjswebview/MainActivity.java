package com.siva4u.myjswebview;

import com.siva4u.myjswebview.base.MyJSWebView;
import com.siva4u.myjswebview.example.TestAPIOne;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.os.Bundle;

@SuppressLint({ "SetJavaScriptEnabled", "NewApi" }) public class MainActivity extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        MyJSWebView myWebView = (MyJSWebView)findViewById(R.id.webView);
        myWebView.registerJavaScriptAPI(new TestAPIOne(this,myWebView));
        myWebView.loadUrl("file:///android_asset/my/index.html");
    }
}
