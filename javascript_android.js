window.MY = window.MY || {};

MY = (function(w,my){
      
	var callBacksFromNative = {};
    
    my.invokeJSCallback = function(cbID,removeAfterExecute,config) {
        console.log("invokeJSCallback:1:",cbID,removeAfterExecute,config);
        if(cbID) {
            var cb = callBacksFromNative[cbID];
            console.log("invokeJSCallback:2:",cb);
            if(cb) {
                if(removeAfterExecute) delete(callBacksFromNative[cbID]);
                var retValue = '';
                try {retValue = JSON.parse(config);}catch(e){}
                cb.call(null, retValue);
            }
        }
    };

    my.getNativeParam = function(config) {
        if(config) {
            if(config.callback) {
                var cbID = 'cbID' + (+new Date);
                callBacksFromNative[cbID] = config.callback;
                config.callbackID = cbID;
            }
            try{return JSON.stringify(config);}catch(e){}
        }
        return '';
    };

	return my;
})(window,MY);
