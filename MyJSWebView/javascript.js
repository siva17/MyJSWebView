/*
 * MY software version 0.1.0
 *
 * (The MIT License)
 *
 * Copyright (c) 2014 Siva Rama Krishna Ravuri (Individual)
 * http://my.siva4u.com/
 *
 * All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * 'Software'), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * my.js
 *
 */

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
