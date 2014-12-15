package com.siva4u.myjswebview.base;

import org.json.JSONException;
import org.json.JSONObject;

import android.content.Context;

public class MyJSBaseNativeModule {
	
    protected Context webViewContext;
    protected MyJSWebView webView;
    
    protected static String getString(JSONObject obj, String forKey) {
   		try {
   			if(forKey != null) return obj.get(forKey).toString();
   			else {
   				return obj.toString();
   			}
		} catch (JSONException e) {
			e.printStackTrace();
		}
    	return null;
    }
    protected static String getString(JSONObject obj) {
    	return getString(obj, null);
    }
    protected static JSONObject getJSONObject(String str) {
    	try {
			return new JSONObject(str);
		} catch (JSONException e) {
			e.printStackTrace();
		}
    	try {
			return new JSONObject("{'data':"+str+"}");
		} catch (JSONException e) {
			e.printStackTrace();
		}
    	return new JSONObject();
    }
    
    protected String callCallback(String inJsonStr, String outJsonStr) {
    	return callCallback(getJSONObject(inJsonStr), outJsonStr);
    }
    protected String callCallback(String inJsonStr, JSONObject outJsonObj) {
    	return callCallback(getJSONObject(inJsonStr), getString(outJsonObj));
    }
    protected String callCallback(JSONObject inJsonObj, final String outJsonStr) {
    	final String callbackID = getString(inJsonObj, "callbackID");
    	if(callbackID != null) {
			webView.post(new Runnable() {
			    @Override
			    public void run() {
					webView.loadUrl("javascript: MY.invokeJSCallback('"+callbackID+"',true,'"+outJsonStr+"');");
			    }
			});
			return "";
    	}
		return outJsonStr;
    }
    
    public MyJSBaseNativeModule(Context c, MyJSWebView view) {
    	webViewContext = c;
    	webView = view;
    }    
}
