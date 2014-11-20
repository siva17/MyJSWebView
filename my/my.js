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

//Case insensitive
MY.NATIVE_API_SCHEMA = "native-api";

// Defines
MY.CMN = {
    VERSION         : "0.1.0",

    NULL_STRING     : "",
    DATA_TYPE_NULL  : 0,

    NAME : {
        EVENT   : "eventName",
        MESSAGE : "Message",
    },
    
    KEY : {
        STATUS  : "status",
        VALUE   : "value",
    },
    
    NET : {
        CONN_STATUS : {
            UNKNOWN : "UnKnown",
            ONLINE  : "Online",
            OFFLINE : "Offline"
        },
        
        CONN_STATE : {
            INIT            : "init",
            LOADING         : "loading",
            LOADED          : "loaded",
            INPROGRESS      : "inProgress",
            COMPLETED       : "completed",
            TIMEOUT         : "timeoout",
            FAIL            : "fail",
            COMPLETED_ALL   : "completedAll",
        },
        
        HTTP_CODE : {
            NO_MEMORY       : 1000,
            ABORT_CLIENT    : 1001,
            UNSUPPORTED_REQ : 1002,
            NOT_ABLE_TO_PROCESS : 1003,
        },
    },
    
    VAL : {
        
        REQ : {
            HTTP_METHOD : {
                GET : "GET",
                POST: "POST"
            },
            STORE_TYPE : {
                GET             : "G",
                STORE           : "S",
                STORE_AND_GET   : "SG"
            },
            HEADERS : {
                CONTENT_TYPE    : "Content-Type",
                ACCEPT          : "Accept"
            }
        },
        
        RSP : {
            STATUS : {
                FAIL        : "fail",
                SUCCESS     : "success",
                CANCEL      : "cancel",
                TIMEOUT     : "timeout",
                NO_NETWORK  : "noNetwork",
                NO_RSP      : "noResponse",
            }
        },
        
        MSG : {
            TIMEOUT                     : "Request timed out. Please try again later.",
            NO_MATCHED_ADDRESS          : "No matched address found",
            CONNECTION_ERROR            : "Connection Error.",
            INVALID_EMAIL_OR_PASSWORD   : "Invalid Email or Password, Please check",
        },
    }    
};
/******************************************************************************
 * Base JavaScript Extension functions - End
 *****************************************************************************/
/******************************************************************************
 * MY Basic Functions - Begin
 *****************************************************************************/
MY = (function(my) {
    var ArrayProto     = Array.prototype;
    var slice          = ArrayProto.slice;
    var nativeForEach  = ArrayProto.forEach;
    var each = my.each = function(obj, iterator, context) {
        if (obj == null) return obj;
        if (nativeForEach && obj.forEach === nativeForEach) {
            obj.forEach(iterator, context);
        } else if (obj.length === +obj.length) {
            for (var i = 0, length = obj.length; i < length; i++) {
                if (iterator.call(context, obj[i], i, obj) === breaker) return;
            }
        } else {
            var keys = _.keys(obj);
            for (var i = 0, length = keys.length; i < length; i++) {
                if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
            }
        }
        return obj;
    };
    
    // Extend a given object with all the properties in passed-in object(s).
    my.extend = function(obj) {
        each(slice.call(arguments, 1), function(source) {
            if (source) for (var prop in source) obj[prop] = source[prop];
        });
        return obj;
    };

    my.getAllValues = function(src) {
		var values = [], prop;
		for(prop in src) values.push(src[prop]);
		return values;
    };
    
	my.getKeyOfValue = function(src, value) {
		var prop;
		for(prop in src) if(src[prop] === value) return prop;
		return null;
	};
      
    my.isNULL = function(obj) {return (obj == null) || (obj == MY.CMN.NULL_STRING);};
    my.isArray = ('isArray' in Array) ? Array.isArray : function(value){return toString.call(value) === '[object Array]';};
    my.isFunction = function(fun) {return typeof fun === "function";};
    my.emptyFunction = function emptyFunction(){/*do nothing*/};
    my.isEmpty = function(value, allowEmptyString) {
    	return (value === null) || (value === undefined) || (!allowEmptyString ? value === '' : false) || (my.isArray(value) && value.length === 0);
    };

	my.toNumber = function(value) {
		value = parseInt(value || 0, 10);
		if (isNaN(value)){ value = 0;}
		return value;
	};
	my.validateEmail = function validateEmail(email) {
    	var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    	return emailPattern.test(email);
    };

    my.createAsyncCallBack = function(scope,fn){
    	return function(){fn.apply(scope, arguments);};
    };
	my.callAsyncCallBack = function(cb,data,timeout) {
		return setTimeout(function(){if(cb)cb(data);},((timeout)?(timeout):(0))); // Making Asynch and breaking the call stack.
	};
      
    my.getJSONObject = function(srcData) {
		try {
			return JSON.parse(srcData);
		} catch(e) {
			MY.Log.error("getJSONObject: Invalid JSON");
		}
		return null;
    };
    
    my.getJSONString = function(jsonData) {
    	try {
    		return JSON.stringify(jsonData);
    	} catch(e) {
    		MY.Log.error("getJSONString: Invalid JSON");
		}
		return null;
    };
    
    return my;
})(MY);
/******************************************************************************
 * MY Basic Functions - End
 *****************************************************************************/
/******************************************************************************
 * MY LOG APIs - Begin
 *****************************************************************************/
MY = (function(w,my){
    var strLogLevel = {};
    var NONE  = 0,
        EXCEP = 0x01,
        ERROR = 0x02,
        WARN  = 0x04,
        INFO  = 0x08,
        FLOW  = 0x10;
    strLogLevel[EXCEP]= "EXCEP";
    strLogLevel[ERROR]= "ERROR";
    strLogLevel[WARN] = "WARN";
    strLogLevel[INFO] = "INFO";
    strLogLevel[FLOW] = "FLOW";

    // Creating or initializing the hybrid log buffer
    w.javaScriptLogBuffer   = "";
    w.javaScriptLogEnable   = false;
    var logLevel    = 0;
    var buildType   = 1;

    var setUpLogCleanup = function() {
        if(buildType == 1)      logLevel = (EXCEP|ERROR|WARN|INFO|FLOW);
        else if(buildType == 2) logLevel = (EXCEP|ERROR|WARN|INFO);
        else if(buildType == 3) logLevel = (EXCEP|ERROR|WARN);
        else if(buildType == 4) logLevel = (EXCEP|ERROR);
        if(w.javaScriptLogEnable) {
            // Clean up every 10 secs if not logged using xCode or OS.
            // Minimum bytes should be 10K to avoid any wrong cleanup.
            setInterval(function(){
                if((javaScriptLogBuffer) && (javaScriptLogBuffer.length > 10000)) javaScriptLogBuffer = "";
            },10000);
        }
    };
    setUpLogCleanup();
    
    var log = function(inLoglevel, msg) {
        if((logLevel & inLoglevel) > 0) {
            msg = "["+strLogLevel[inLoglevel]+"] "+msg;
            if(inLoglevel == EXCEP) w.console.error(msg);
            else if(inLoglevel == ERROR) w.console.error(msg);
            else if(inLoglevel == WARN) w.console.warn(msg);
            else if(inLoglevel == INFO) w.console.info(msg);
            else w.console.log(msg);
            if(w.javaScriptLogEnable) w.javaScriptLogBuffer += (msg + "\n");
        }
    };

    my.Log = {};
    my.Log.config = function(c) {
        if(c) {
            w.javaScriptLogEnable = ((c.logInBuffer)?((c.logInBuffer)?(true):(false)):(w.javaScriptLogEnable));
            if((c.buildType) && ((c.buildType) < 5)) buildType = c.buildType;
            setUpLogCleanup();
            if((c.logLevel) && ((c.logLevel) < 5)) logLevel = c.logLevel; // Overwriting if applied any LogLevl
        }
    };
    my.Log.clear    = function() { if(w.javaScriptLogBuffer) w.javaScriptLogBuffer = "";};
    my.Log.flow     = function(msg) { log(FLOW,msg); };
    my.Log.info     = function(msg) { log(INFO,msg); };
    my.Log.warn     = function(msg) { log(WARN,msg); };
    my.Log.error    = function(msg) { log(ERROR,msg); };
    my.Log.exception= function(e,msg) { log(EXCEP,msg+" -> Exception:"+e);};

    return my;
})(window,MY);
/******************************************************************************
 * MY LOG APIs - End
 *****************************************************************************/
/******************************************************************************
 * App Cahce Related changes - Begin
 *****************************************************************************/
MY = (function(w,my){
    var config = {};
    my.Cache = {
        available   : false,
        config      : function(c) { if(c) config = MY.extend(config,c);}
    };
    if(w.applicationCache) {

        var cacheError = function() {
            if(!!window.navigator.onLine) {
                MY.Log.exception("AppCache","Couldn't load the application properly, try reloading.");
                if(config.cacheError) config.cacheError();
            }
        };

        var cacheUpdate = function() {
            applicationCache.swapCache();
            if((((config.cacheUpdate) && (config.cacheUpdate()))?(false):(true)) &&
                (confirm("Application has been updated, would you like to reload now?"))) {
                location.reload();
            }
        };

        var cacheChecking = function(e) {
            // document.getElementById("cacheProgressBarMainID").style.display = "block";
            if(config.cacheChecking) config.cacheChecking(e);
        };

        var cacheInprogres = function(e) {
            // var percentage = parseInt((e.loaded*100)/e.total) + "%";
            // document.getElementById("cacheProgressBarID").style.width = percentage;
            // document.getElementById("cacheProgressValueID").innerHTML = percentage;
            if(config.cacheInprogres) config.cacheInprogres(e);
        };

        var cacheComplete = function(e) {
            // document.getElementById("cacheProgressBarMainID").style.display = "none";
            if(config.cacheComplete) config.cacheComplete(e);
        };

        var appCache = w.applicationCache;
        appCache.addEventListener("checking",   cacheChecking,false);
        appCache.addEventListener("noupdate",   cacheComplete,false);
//            appCache.addEventListener("downloading",logEvent,false);
        appCache.addEventListener("progress",   cacheInprogres,false);
        appCache.addEventListener("cached",     cacheComplete,false);
        appCache.addEventListener("updateready",cacheUpdate,false);
//            appCache.addEventListener("obsolete",   logEvent,false);
        appCache.addEventListener("error",      cacheError,false);

        my.Cache.available = true;

    } else {
        MY.Log.error("Application Cache is not suppported");
    }
    return my;
})(window,MY);
/******************************************************************************
 * App Cahce Related changes - Begin
 *****************************************************************************/
/******************************************************************************
 * Connection - Begin
 *****************************************************************************/
MY.Connection = function() {
    var MAX_CONNECTION_TIMEOUT = 30000; // 30 Seconds
    var connHandle;
    if(window.XMLHttpRequest) connHandle = new XMLHttpRequest();   // code for IE7+, Firefox, Chrome, Opera, Safari
    else connHandle = new ActiveXObject("Microsoft.XMLHTTP");      // code for IE6, IE5
    
    this.sendRequest = function(config) {
        if(connHandle) {
            connHandle.urlVal      = ((config.url != null)?(config.url):(""));
            connHandle.methodVal   = ((config.httpMethod != null)?(config.httpMethod):("GET"));
            connHandle.postDataVal = ((config.postData != null)?(config.postData):(null));
            if(config.headers) {
                var headers = config.headers;
                var keys = Object.keys(headers);
                var numOfHeaders = keys.length;
                for(var i=0; i<numOfHeaders; i++) {
                    var headerKey = keys[i];
                    var headerValue = headers[headerKey];
                    connHandle.setRequestHeader(headerKey,headerValue);
                }
            }
            connHandle.cb          = [];
            connHandle.cb[0]       = config.onUnInit;    // Not guaranteed
            connHandle.cb[1]       = config.onLoading;   // Not guaranteed
            connHandle.cb[2]       = config.onLoaded;    // Not guaranteed
            connHandle.cb[3]       = config.onProgress;  // Not guaranteed
            connHandle.cb[4]       = config.onComplete;  // Guarenteed
            connHandle.timeOutCB   = config.onTimeOut;   // Guarenteed
            connHandle.timeOut     = ((config.timeOut)?(config.timeOut):(MAX_CONNECTION_TIMEOUT));
            connHandle.onreadystatechange = function() {
                var connState   = this.readyState;
                var connStatus  = (connState == 4);
                if(connStatus) clearTimeout(this.timeOutTimer);
                var cb = this.cb[connState];
                if(cb) MY.callAsyncCallBack(cb,{response: this.responseText,state:connState,httpCode:((connStatus)?(this.status):(0))});
            };
            // Restarting the timer
            clearTimeout(connHandle.timeOutTimer);
            connHandle.timeOutTimer = MY.callAsyncCallBack(connHandle.timeOutCB,{response: "Timeout",state:5,httpCode:0},connHandle.timeOut);
            connHandle.open(connHandle.methodVal, connHandle.urlVal, true);
            connHandle.send(connHandle.postDataVal);
        }
    };
};
/******************************************************************************
 * Connection - End
 *****************************************************************************/
/******************************************************************************
 * Device/Browser Detect mechanism - Begin
 *****************************************************************************/
MY = (function(w,my){
    
    var MyVersion = function(version){this.init(version)};
    MyVersion.prototype = {
        init : function(version) {
            if (typeof(version) === "string") {
                var toNumber = MY.toNumber;
                this.version = this.shortVersion = String(version).toLowerCase().replace(/_/g, '.').replace(/[\-+]/g, '');
                var releaseStartIndex = this.version.search(/([^\d\.])/);
                if (releaseStartIndex !== -1) {
                    this.release = this.version.substr(releaseStartIndex, version.length);
                    this.shortVersion = this.version.substr(0, releaseStartIndex);
                }
                this.shortVersion = this.shortVersion.replace(/[^\d]/g, '');
                var parts = this.version.split('.');
                this.major = toNumber(parts.shift());
                this.minor = toNumber(parts.shift());
                this.patch = toNumber(parts.shift());
                this.build = toNumber(parts.shift());
            }
        }
    };

    var MyBrowser = function(w){this.init(w);};
    MyBrowser.prototype = {
        statics : {
            browserNames: {
                ie: 'IE',
                firefox: 'Firefox',
                safari: 'Safari',
                chrome: 'Chrome',
                opera: 'Opera',
                dolfin: 'Dolfin',
                webosbrowser: 'webOSBrowser',
                chromeMobile: 'ChromeMobile',
                chromeiOS: 'ChromeiOS',
                silk: 'Silk',
                other: 'Other'
            },
            engineNames: {
                webkit: 'WebKit',
                gecko: 'Gecko',
                presto: 'Presto',
                trident: 'Trident',
                other: 'Other'
            },
            enginePrefixes: {
                webkit: 'AppleWebKit/',
                gecko: 'Gecko/',
                presto: 'Presto/',
                trident: 'Trident/'
            },
            browserPrefixes: {
                ie: 'MSIE ',
                firefox: 'Firefox/',
                chrome: 'Chrome/',
                safari: 'Version/',
                opera: 'OPR/',
                dolfin: 'Dolfin/',
                webosbrowser: 'wOSBrowser/',
                chromeMobile: 'CrMo/',
                chromeiOS: 'CriOS/',
                silk: 'Silk/'
            }
        },
        styleDashPrefixes : {
            WebKit: '-webkit-',
            Gecko: '-moz-',
            Trident: '-ms-',
            Presto: '-o-',
            Other: ''
        },
        stylePrefixes : {
            WebKit: 'Webkit',
            Gecko: 'Moz',
            Trident: 'ms',
            Presto: 'O',
            Other: ''
        },
        propertyPrefixes : {
            WebKit: 'webkit',
            Gecko: 'moz',
            Trident: 'ms',
            Presto: 'o',
            Other: ''
        },

        is : {},

        setBrowsersFlag : function(name, value) {
            if(typeof value == 'undefined'){value = true;}
            this.is[name] = value;
            this.is[name.toLowerCase()] = value;
        },

        init : function(w) {
            var userAgent       = w.navigator.userAgent;
            var statics         = this.statics;
            var browserMatch    = userAgent.match(new RegExp('((?:' + MY.getAllValues(statics.browserPrefixes).join(')|(?:') + '))([\\w\\._]+)'));
            var engineMatch     = userAgent.match(new RegExp('((?:' + MY.getAllValues(statics.enginePrefixes).join(')|(?:') + '))([\\w\\._]+)'));
            var browserNames    = statics.browserNames;
            var browserName     = browserNames.other;
            var engineNames     = statics.engineNames;
            var engineName      = engineNames.other;
            var browserVersion  = '';
            var engineVersion   = '';
            var isWebView       = false;
            var i, name;

            if (browserMatch) {
                browserName = browserNames[MY.getKeyOfValue(statics.browserPrefixes,browserMatch[1])];
                browserVersion = new MyVersion(browserMatch[2]);
            }

            if (engineMatch) {
                engineName = engineNames[MY.getKeyOfValue(statics.enginePrefixes,engineMatch[1])];
                engineVersion = new MyVersion(engineMatch[2]);
            }

            if (engineName == 'Trident' && browserName != 'IE') {
                browserName = 'IE';
                var version = userAgent.match(/.*rv:(\d+.\d+)/);
                if (version && version.length) {
                    version = version[1];
                    browserVersion = new MyVersion(version);
                }
            }

            // Facebook changes the userAgent when you view a website within their iOS app. For some reason, the strip out information
            // about the browser, so we have to detect that and fake it...
            if (userAgent.match(/FB/) && browserName == "Other") {
                browserName = browserNames.safari;
                engineName = engineNames.webkit;
            }

            if (userAgent.match(/Android.*Chrome/g)) {
                browserName = 'ChromeMobile';
            }

            if (userAgent.match(/OPR/)) {
                browserName = 'Opera';
                browserMatch = userAgent.match(/OPR\/(\d+.\d+)/);
                browserVersion = new MyVersion(browserMatch[1]);
            }

            this.browserName    = browserName;
            this.browserVersion = browserVersion;
            this.engineName     = engineName;
            this.engineVersion  = engineVersion;

            this.setBrowsersFlag(browserName);

            if (browserVersion) {
                this.setBrowsersFlag(browserName + (browserVersion.major || ''));
                this.setBrowsersFlag(browserName + browserVersion.shortVersion);
            }

            for (i in browserNames) {
                if (browserNames.hasOwnProperty(i)) {
                    name = browserNames[i];
                    this.setBrowsersFlag(name, browserName === name);
                }
            }

            this.setBrowsersFlag(name);

            if (engineVersion) {
                this.setBrowsersFlag(engineName + (engineVersion.major || ''));
                this.setBrowsersFlag(engineName + engineVersion.shortVersion);
            }

            for (i in engineNames) {
                if (engineNames.hasOwnProperty(i)) {
                    name = engineNames[i];
                    this.setBrowsersFlag(name, engineName === name);
                }
            }

            this.setBrowsersFlag('Standalone', !!navigator.standalone);

            this.setBrowsersFlag('Ripple', !!document.getElementById("tinyhippos-injected") && !MY.isEmpty(w.top.ripple));
            this.setBrowsersFlag('WebWorks', !!w.blackberry);

            if (typeof w.PhoneGap != 'undefined' || typeof w.Cordova != 'undefined' || typeof w.cordova != 'undefined') {
                isWebView = true;
                this.setBrowsersFlag('PhoneGap');
                this.setBrowsersFlag('Cordova');
            } else if (!!w.isNK) {
                isWebView = true;
                this.setBrowsersFlag('Sencha');
            }

            // Check if running in UIWebView
            if (/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)(?!.*FBAN)/i.test(userAgent)) {
                isWebView = true;
            }

            this.setBrowsersFlag('WebView', isWebView); // Flag to check if it we are in the WebView
            this.isStrict = document.compatMode == "CSS1Compat";
            this.isSecure = /^https/i.test(w.location.protocol);
        }
    };

    var MyDevice = function(w){this.init(w);}
    MyDevice.prototype = {
        statics: {
            names: {
                ios: 'iOS',
                android: 'Android',
                windowsPhone: 'WindowsPhone',
                webos: 'webOS',
                blackberry: 'BlackBerry',
                rimTablet: 'RIMTablet',
                mac: 'MacOS',
                win: 'Windows',
                tizen: 'Tizen',
                linux: 'Linux',
                bada: 'Bada',
                chrome: 'ChromeOS',
                other: 'Other'
            },
            prefixes: {
                tizen: '(Tizen )',
                ios: 'i(?:Pad|Phone|Pod)(?:.*)CPU(?: iPhone)? OS ',
                android: '(Android |HTC_|Silk/)', // Some HTC devices ship with an OSX userAgent by default, so we need to add a direct check for HTC_
                windowsPhone: 'Windows Phone ',
                blackberry: '(?:BlackBerry|BB)(?:.*)Version\/',
                rimTablet: 'RIM Tablet OS ',
                webos: '(?:webOS|hpwOS)\/',
                bada: 'Bada\/',
                chrome: 'CrOS '
            }
        },

        is : {},

        setDevicesFlag : function(name, value) {
            if (typeof value == 'undefined'){value = true;}
            this.is[name] = value;
            this.is[name.toLowerCase()] = value;
        },

        init : function(w) {
            var nav             = w.navigator;
            var userAgent       = nav.userAgent;
            var platform        = nav.platform;
            var browserScope    = new MyBrowser(w);
            var statics         = this.statics;
            var names           = statics.names;
            var prefixes        = statics.prefixes;
            var version         = '';
            var name, i, prefix, match, item, is, match1;

            for (i in prefixes) {
                if (prefixes.hasOwnProperty(i)) {
                    prefix = prefixes[i];
                    match = userAgent.match(new RegExp('(?:'+prefix+')([^\\s;]+)'));
                    if (match) {
                        name = names[i];
                        match1 = match[1];
                        // This is here because some HTC android devices show an OSX Snow Leopard userAgent by default.
                        // And the Kindle Fire doesn't have any indicator of Android as the OS in its User Agent
                        if (match1 && match1 == "HTC_") {
                            version = new MyVersion("2.3");
                        } else if (match1 && match1 == "Silk/") {
                            version = new MyVersion("2.3");
                        } else {
                            version = new MyVersion(match[match.length - 1]);
                        }
                        break;
                    }
                }
            }

            if (!name) {
                name = names[(userAgent.toLowerCase().match(/mac|win|linux/) || ['other'])[0]];
                version = new MyVersion('');
            }

            this.osName     = name;
            this.osVersion  = version;

            if (platform) {
                this.setDevicesFlag(platform.replace(/ simulator$/i, ''));
            }

            this.setDevicesFlag(name);

            if (version) {
                this.setDevicesFlag(name + (version.major || ''));
                this.setDevicesFlag(name + version.shortVersion);
            }

            for (i in names) {
                if (names.hasOwnProperty(i)) {
                    item = names[i];
                    if (!this.is.hasOwnProperty(name)) {
                        this.setDevicesFlag(item, (name === item));
                    }
                }
            }

            // Detect if the device is the iPhone 5.
            if (this.osName == "iOS" && w.screen.height == 568) {
                this.setDevicesFlag('iPhone5');
            }

            if (browserScope.is.Safari || browserScope.is.Silk) {
                // browserScope.browserVersion.shortVersion == 501 is for debugging off device
                if (this.is.Android2 || this.is.Android3 || browserScope.browserVersion.shortVersion == 501) {
                    browserScope.setBrowsersFlag("AndroidStock");
                    browserScope.setBrowsersFlag("AndroidStock2");
                }
                if (this.is.Android4) {
                    browserScope.setBrowsersFlag("AndroidStock");
                    browserScope.setBrowsersFlag("AndroidStock4");
                }
            }

            var deviceType;
            var search = w.location.search.match(/deviceType=(Tablet|Phone)/),
            nativeDeviceType = w.deviceType;
            if (search && search[1]) {
                deviceType = search[1];
            } else if (nativeDeviceType === 'iPhone') {
                deviceType = 'Phone';
            } else if (nativeDeviceType === 'iPad') {
                deviceType = 'Tablet';
            } else {
                if (!this.is.Android && !this.is.iOS && !this.is.WindowsPhone && /Windows|Linux|MacOS/.test(this.osName)) {
                    deviceType = 'Desktop';
                    // always set it to false when you are on a desktop not using Ripple Emulation
                    browserScope.is.WebView = browserScope.is.Ripple ? true : false;
                } else if (this.is.iPad || this.is.RIMTablet || this.is.Android3 || browserScope.is.Silk || (this.is.Android4 && userAgent.search(/mobile/i) == -1)) {
                    deviceType = 'Tablet';
                } else {
                    deviceType = 'Phone';
                }
            }
            this.setDevicesFlag(deviceType, true);
            this.deviceType = deviceType;
            this.browserName = browserScope.browserName;
            this.is.runningInHybrid = ((document.URL.indexOf("http://") === -1)&&(document.URL.indexOf("https://") === -1));
        }
    };

    my.BrowserDetails = new MyDevice(w);
    
    return my;
})(window,MY);
/******************************************************************************
 * Device/Browser Detect mechanism - End
 *****************************************************************************/
/******************************************************************************
 * DOM Manipulation - Begin
 *****************************************************************************/
MY = (function(w,my){
      
	my.addEvent = function(obj,strEvent,fnHandler,allowBubbling) {
		if (obj.addEventListener) {
      		obj.addEventListener(strEvent,fnHandler,allowBubbling);
		} else if (obj.attachEvent) {
			obj.attachEvent("on"+strEvent,fnHandle);
        } else {
			alert("addEvent: Browser is not supporting adding an Event");
		}
	};
      
	my.createDomElement = function(elConfig) {
		var el = document.createElement(elConfig.type);
		try {
			if(elConfig.id) el.id = elConfig.id;
			if(elConfig.className) el.className = elConfig.className;
			if(elConfig.content) el.innerHTML = elConfig.content;
			else if(elConfig.content == "") el.innerHTML = "";
			if(elConfig.add) {
				if(elConfig.parent) elConfig.parent.appendChild(el);
				else document.body.appendChild(el); // add element to body
			}
		} catch(e) {
			MY.Log.exception(e,"createDomElement");
		}
		return el;
	};
      
	my.addStyleTagToHead = function(src) {
		try {
			var cssNode  = document.createElement("link");
			cssNode.type = "text/css";
			cssNode.rel  = "stylesheet";
            cssNode.href = src;
			document.getElementsByTagName("head")[0].appendChild(cssNode);
		} catch(e) {
			MY.Log.exception(e,"addStyleTagToHead");
		}
	};
      
	my.addScriptTagToHead = function(src) {
		try {
			var newScript   = document.createElement("script");
			newScript.type  = "text/javascript";
			newScript.src	= src;
			document.getElementsByTagName("head")[0].appendChild(newScript);
		} catch(e) {
			MY.Log.exception(e,"addScriptTagToHead");
		}
	};
      
    my.setAppIcon = function(src) {
        try {
            if(src == null) src = "appicon.png";
            var headID      = document.getElementsByTagName("head")[0];
            var iconNode    = document.createElement("link");
            iconNode.type   = "image/png";
            // use "apple-touch-icon" for icon without gloss effect
            iconNode.rel    = "apple-touch-icon-precomposed";
            iconNode.href   = src;
            headID.appendChild(iconNode);
        } catch(e) {
            MY.Log.exception(e,"setAppIcon");
        }
    };

	return my;
})(window,MY);
/******************************************************************************
 * DOM Manipulation - End
 *****************************************************************************/
/******************************************************************************
 * Loading Spinner - Begin
 *****************************************************************************/
MY = (function(w,my){
    
    var style = document.createElement("style");
    style.innerHTML = '.spinnerWrapper{z-index: 1;position:fixed;width:66px;height:66px;top:50%;left:50%;margin-left:-33px;margin-top:-33px;}';
    style.innerHTML+= '.hideSpinner{display:none;}';
    style.innerHTML+= 'div.loadingSpinner, div.loadingSpinnerWhite {position:relative;width:100%;height:100%;}';
    style.innerHTML+= 'div.loadingSpinner div, div.loadingSpinnerWhite div {position:absolute;width:12%;height:26%;background:#222;left:44.5%;top:37%;opacity:0;-webkit-animation: fade 1s linear infinite;-webkit-border-radius: 50px;-webkit-box-shadow: 0 0 3px rgba(0,0,0,0.2);}';
    style.innerHTML+= 'div.loadingSpinnerWhite div {background:white;}';
    style.innerHTML+= 'div.loadingSpinner div.bar1, div.loadingSpinnerWhite div.bar1 {-webkit-transform:rotate(0deg) translate(0, -142%); -webkit-animation-delay: 0s;}';
    style.innerHTML+= 'div.loadingSpinner div.bar2, div.loadingSpinnerWhite div.bar2 {-webkit-transform:rotate(30deg) translate(0, -142%); -webkit-animation-delay: -0.9167s;}';
    style.innerHTML+= 'div.loadingSpinner div.bar3, div.loadingSpinnerWhite div.bar3 {-webkit-transform:rotate(60deg) translate(0, -142%); -webkit-animation-delay: -0.833s;}';
    style.innerHTML+= 'div.loadingSpinner div.bar4, div.loadingSpinnerWhite div.bar4 {-webkit-transform:rotate(90deg) translate(0, -142%); -webkit-animation-delay: -0.75s;}';
    style.innerHTML+= 'div.loadingSpinner div.bar5, div.loadingSpinnerWhite div.bar5 {-webkit-transform:rotate(120deg) translate(0, -142%); -webkit-animation-delay: -0.667s;}';
    style.innerHTML+= 'div.loadingSpinner div.bar6, div.loadingSpinnerWhite div.bar6 {-webkit-transform:rotate(150deg) translate(0, -142%); -webkit-animation-delay: -0.5833s;}';
    style.innerHTML+= 'div.loadingSpinner div.bar7, div.loadingSpinnerWhite div.bar7 {-webkit-transform:rotate(180deg) translate(0, -142%); -webkit-animation-delay: -0.5s;}';
    style.innerHTML+= 'div.loadingSpinner div.bar8, div.loadingSpinnerWhite div.bar8 {-webkit-transform:rotate(210deg) translate(0, -142%); -webkit-animation-delay: -0.41667s;}';
    style.innerHTML+= 'div.loadingSpinner div.bar9, div.loadingSpinnerWhite div.bar9 {-webkit-transform:rotate(240deg) translate(0, -142%); -webkit-animation-delay: -0.333s;}';
    style.innerHTML+= 'div.loadingSpinner div.bar10, div.loadingSpinnerWhite div.bar10 {-webkit-transform:rotate(270deg) translate(0, -142%); -webkit-animation-delay: -0.25s;}';
    style.innerHTML+= 'div.loadingSpinner div.bar11, div.loadingSpinnerWhite div.bar11 {-webkit-transform:rotate(300deg) translate(0, -142%); -webkit-animation-delay: -0.1667s;}';
    style.innerHTML+= 'div.loadingSpinner div.bar12, div.loadingSpinnerWhite div.bar12 {-webkit-transform:rotate(330deg) translate(0, -142%); -webkit-animation-delay: -0.0833s;}';
    style.innerHTML+= '@-webkit-keyframes fade {from {opacity:1;} to {opacity:0.25;}}';

    document.head.appendChild(style);

	var spinWrapper = document.createElement("div");
    spinWrapper.innerHTML = '<div id="globalSpinner" class="hideSpinner"><div class="loadingSpinner"><div class="bar1"></div><div class="bar2"></div><div class="bar3"></div><div class="bar4"></div><div class="bar5"></div><div class="bar6"></div><div class="bar7"></div><div class="bar8"></div><div class="bar9"></div><div class="bar10"></div><div class="bar11"></div><div class="bar12"></div></div></div>';
	document.body.insertBefore(spinWrapper.firstChild, document.body.childNodes[0]);
      
	var utilSpinnerStatus = false;
	my.toggleSpinner = function(isWhite,state) {
		var spinnerEl = document.getElementById("globalSpinner");
      	if(spinnerEl) {
			if(state !== undefined) utilSpinnerStatus = !state;
      
			var className = "hideSpinner";
			if(utilSpinnerStatus == false) {
				className = "spinnerWrapper";
				utilSpinnerStatus = true;
				spinnerEl.childNodes[0].className = ((isWhite)?("loadingSpinnerWhite"):("loadingSpinner"));
            } else {
				utilSpinnerStatus = false;
      		}
			spinnerEl.className = className;
		}
	};
      
	return my;
})(window,MY);
/******************************************************************************
 * Loading Spinner - End
 *****************************************************************************/
/******************************************************************************
 * Native APIs Interface - Begin
 *****************************************************************************/
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
        iframe.setAttribute("src", MY.NATIVE_API_SCHEMA + ":" + obj + ":" + encodeURIComponent(functionName) + argStr);
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
/******************************************************************************
 * Native APIs Interface - End
 *****************************************************************************/
/******************************************************************************
 * Information about device - Begin
 *****************************************************************************/
MY = (function(w,my){
    var myDevice = MY.BrowserDetails;
    // ATHS -> Add to home screen
    var ATHS = {
        bubbleIconID        : "addHomeScreenBubbleIconID",
        addToIconFileName   : "addtohomescreen.png",
    }
    my.Information = {
        browserDetails      : myDevice,
        deviceID            : 123456789,
        deviceType          : myDevice.deviceType,
        osName              : myDevice.osName,
        isStandAloneMode    : !!w.navigator.standalone,

        isRunningInHybrid   : myDevice.is.runningInHybrid,
        isIPhone5           : myDevice.is.iphone5,
        isIPhoneOrIPod      : (myDevice.is.ipod || myDevice.is.iphone),
        isIPad              : myDevice.is.ipad,
        isIOSDevice         : (myDevice.osName == "iOS"),

        appImagesPath       : "images/",
        addToHomeScreen     : ATHS,
    };

    my.setAddToHomeScreenIcon = function(imgSrc) {
        try {
            var bubbleIcon = document.getElementById(MY.Information.addToHomeScreen.bubbleIconID);
            if (!!bubbleIcon) {
                bubbleIcon.style.background = '#fff url(' + imgSrc + ') no-repeat -1px -1px';
                return true;
            } else {
                // Lazy load and so checking every 100 msec
                setTimeout(MY.setAddToHomeScreenIcon,100,imgSrc);
            }
        } catch(e) {
            MY.Log.exception(e,"setAddToHomeScreenIcon");
        }
        return false;
    };

    return my;
})(window,MY);
/******************************************************************************
 * Information about device - End
 *****************************************************************************/
/******************************************************************************
 * Client DB - Begin
 *****************************************************************************/
MY = (function(w,my){
	try {
		my.DB = new ClientDB();
    } catch(e) {
		MY.Log.exception(e,"ClientDB is not included i.e. my_clientdb.js file");
	}
	return my;
})(window,MY);
/******************************************************************************
 * Client DB - End
 *****************************************************************************/
/******************************************************************************
 * Utils - Begin
 *****************************************************************************/
MY = (function(w,my){
    my.sizeof = function(_1){
        /*
         * sizeof.js
         * A function to calculate the approximate memory usage of objects
         * Created by Stephen Morley - http://code.stephenmorley.org/ - and released under
         * the terms of the CC0 1.0 Universal legal code:
         * http://creativecommons.org/publicdomain/zero/1.0/legalcode
         */
        var _2=[_1];
        var _3=0;
        for(var _4=0;_4<_2.length;_4++){
            switch(typeof _2[_4]){
                case "boolean"	: _3+=4; break;
                case "number"	: _3+=8; break;
                case "string"	: _3+=2*_2[_4].length; break;
                case "object"	: {
                    if(Object.prototype.toString.call(_2[_4])!="[object Array]"){
                        for(var _5 in _2[_4]){
                            _3+=2*_5.length;
                        }
                    }
                    for(var _5 in _2[_4]){
                        var _6=false;
                        for(var _7=0;_7<_2.length;_7++){
                            if(_2[_7]===_2[_4][_5]){
                                _6=true;
                                break;
                            }
                        }
                        if(!_6){
                            _2.push(_2[_4][_5]);
                        }
					}
                }
            }
        }
        return _3;
    };
    
	return my;
})(window,MY);
/******************************************************************************
 * Utils - Begin
 *****************************************************************************/
