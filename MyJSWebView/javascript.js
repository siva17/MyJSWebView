window.MY = window.MY || {};

MY = (function(w,my){
    my.NATIVEAPI = {};
      
	var callBacksFromNative = {};
    
    var callNativeAPI = function(obj,functionName,config) {
    
        var argStr = ":";
        if(config) {
            if(config.callback) {
                var cbID = "cbID" + (+new Date);
                callBacksFromNative[cbID] = config.callback;
				config["callbackID"] = cbID;
            }
            argStr += encodeURIComponent(JSON.stringify(config));
        }      

        var iframe = document.createElement("IFRAME");
        iframe.setAttribute("src", "native-api" + ":" + obj + ":" + encodeURIComponent(functionName) + argStr);
        document.documentElement.appendChild(iframe);
        iframe.parentNode.removeChild(iframe);
        iframe = null;

        var ret = MY.NATIVEAPI.retValue;
        MY.NATIVEAPI.retValue = undefined;
        if(ret) return decodeURIComponent(ret);
    };
      
    my.NATIVEAPI.invokeJSCallback = function(cbID,removeAfterExecute,config) {
        var cb = callBacksFromNative[cbID];
        if(removeAfterExecute) delete(callBacksFromNative[cbID]);
      	if(config.callbackID) delete(config.callbackID);
        return cb.call(null, config);
    };

    my.NATIVEAPI.registerJSModule = function(obj,methods) {
        w[obj] = {};
        var jsObj = w[obj];

        for(var i=0, l=methods.length; i<l; i++) {
            (function (){
                var method = methods[i];
                var jsMethod = method.replace(new RegExp(":", "g"), "");
                jsObj[jsMethod] = function() {
                    return callNativeAPI(obj,method,arguments[0]);
                };
            })();
        }
    };
    
	return my;
})(window,MY);
