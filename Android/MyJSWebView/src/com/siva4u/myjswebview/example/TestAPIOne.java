package com.siva4u.myjswebview.example;

import android.content.Context;
import android.widget.Toast;
import android.webkit.JavascriptInterface;

import com.siva4u.myjswebview.base.MyJSBaseNativeModule;
import com.siva4u.myjswebview.base.MyJSWebView;

public class TestAPIOne extends MyJSBaseNativeModule {
	public TestAPIOne(Context c, MyJSWebView view) {
		super(c,view);
	}
	
	@JavascriptInterface
	public void APIOne() {
		System.out.println("MyJSWebViewApp: TestAPIOne:APIOne: START");
	}
	
    @JavascriptInterface
    public void APITwo(String strParam) {
		System.out.println("MyJSWebViewApp: TestAPIOne:APITwo: START: "+strParam);
        Toast.makeText(webViewContext, strParam, Toast.LENGTH_SHORT).show();
    }
    
    @JavascriptInterface
    public void APIThree(String strJson) {
		System.out.println("MyJSWebViewApp: TestAPIOne:APIThree: START: Str: "+strJson);
		System.out.println("MyJSWebViewApp: TestAPIOne:APIThree: START: Object: "+getJSONObject(strJson));
        Toast.makeText(webViewContext, strJson, Toast.LENGTH_SHORT).show();
    }
    
    @JavascriptInterface
    public String APIFour(String strJson) {
		System.out.println("MyJSWebViewApp: TestAPIOne:APIFour: START: Str: "+strJson);
		System.out.println("MyJSWebViewApp: TestAPIOne:APIFour: START: Object: "+getJSONObject(strJson));
        Toast.makeText(webViewContext, strJson, Toast.LENGTH_SHORT).show();
        return "Returned Value from APIFour...";
    }
    
    @JavascriptInterface
    public String APIFive(String strJson) {
		System.out.println("MyJSWebViewApp: TestAPIOne:APIFive: START: Str: "+strJson);
		System.out.println("MyJSWebViewApp: TestAPIOne:APIFive: START: Object: "+getJSONObject(strJson));
        Toast.makeText(webViewContext, strJson, Toast.LENGTH_SHORT).show();
        return "Returned JSON String:"+strJson;
    }

    @JavascriptInterface
    public void APISix(String strJson) {
		System.out.println("MyJSWebViewApp: TestAPIOne:APISix: START: Str: "+strJson);
		System.out.println("MyJSWebViewApp: TestAPIOne:APISix: START: Object: "+getJSONObject(strJson));
		Toast.makeText(webViewContext, strJson, Toast.LENGTH_SHORT).show();
        callCallback(strJson,strJson);
    }

    @JavascriptInterface
    public String APISeven(String strJson) {
		System.out.println("MyJSWebViewApp: TestAPIOne:APISeven: START: Str: "+strJson);
		System.out.println("MyJSWebViewApp: TestAPIOne:APISeven: START: Object: "+getJSONObject(strJson));
		Toast.makeText(webViewContext, strJson, Toast.LENGTH_SHORT).show();
        callCallback(strJson,strJson);
        return "Returned value from APISeven..."+strJson;
    }
}
