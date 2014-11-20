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
 * my_clientdb.js
 *
 */
/*
 *
 * This DB works on KEY/VALUE Pairs and no other complex structures/tables
 *
 * Support the browsers as follows
 * C - Chrome            Version >= 15.0
 * S - Safari            Version >=  5.1
 * O - Opera             Version >= 11.0
 * F - Firefox           Version >=  7.0
 * I - Internet Explorer Version >=  9.0
 *--------------------------------
 * Database API     C  S  O  F  I
 *--------------------------------
 * indexedDB        N  N  N  N  N
 * mozIndexedDB     N  N  N  Y  N
 * webkitIndexedDB  Y  N  N  N  N
 * openDatabase     Y  Y  Y  N  N
 * localStorage     Y  Y  Y  Y  Y
 *--------------------------------
 */
/***********************************************
 * Client DB Details constants -> Begin
 **********************************************/
var DB_TYPE_SQLITE              = "SQLite";
var DB_TYPE_INDEXEDDB           = "IDB";
var DB_TYPE_LOCALSTORAGE        = "LS";

var DB_MAX_SIZE_SQLITE          = 50000000; // 50 Mb (Actual value is 52,428,800, but rounded to be on safe side)
var DB_MAX_SIZE_INDEXEDDB       = 50000000; // 50 Mb (Actual value is 52,428,800, but rounded to be on safe side)
var DB_MAX_SIZE_LOCALSTORAGE    = 5000000;  // 05 Mb (Actual value is 05,242,880, but rounded to be on safe side)
/***********************************************
 * Client DB Details constants -> End
 **********************************************/

var DBDetails=function(){};
DBDetails.prototype={
    dbType          : null,
    dbMaxSize       : 0,
    dbOpen          : null,
    dbName          : null,
    dbTable         : null,
    dbVersion       : null,
    dbObject        : null,
    
    initSQLite : function(callback) {
        try {
            var cdObject = this;
            if((cdObject.dbObject = openDatabase(cdObject.dbName, cdObject.dbVersion, "DataBase "+cdObject.dbName, cdObject.dbMaxSize))) {
                cdObject.dbObject.transaction(function(txn){
                    txn.executeSql(
                        "CREATE TABLE IF NOT EXISTS "+cdObject.dbTable+"(key TEXT NOT NULL PRIMARY KEY, value TEXT);",
                        [],
                        function(txnSuccess,results) {
                            if(callback) callback({status : true});
                        },
                        function(txnFailure,results) {
                            MY.Log.error("SQLite DB is Failed to create");
                            if(callback) {
                                callback({
                                    status       : false,
                                    errorCode    : results.code,
                                    errorMessage : results.message
                                });
                            }
                        }
                    );
                });
                return true;
            }
        } catch(e) {
            if(e==2) {
                MY.Log.exception(e,"ClientDB.initSQLite:Version Mismatch in SQLite DB Creation");
            } else {
                MY.Log.exception(e,"ClientDB.initSQLite:Error in SQLite DB Creation");
            }
        }
        return false;
    },
    
    initIndexedDB : function(callback) {
        try {
            var cdObject = this;
            var request = cdObject.dbOpen.open(cdObject.dbName);
            if(request) {
                request.onsuccess = function(event) {
                    try {
                        cdObject.dbObject = event.target.result;
                        var ver = cdObject.dbVersion;
                        var db  = cdObject.dbObject;
                        // We can only create Object stores in a setVersion transaction;
                        if (ver != db.version) {
                            var setVrequest = db.setVersion(ver);
                            // onsuccess is the only place we can create Object Stores
                            setVrequest.onsuccess = function(event) {
                                try {
                                    // On setting new version, delete the old Database and create new one
                                    if(db.objectStoreNames.contains(cdObject.dbName)) {
                                        db.deleteObjectStore(cdObject.dbName);
                                    }
                                    var store = db.createObjectStore(cdObject.dbName,{keyPath:"key"});
                                    // Send the success as database is created
                                    if(callback) callback({status : true});
                                } catch(e) {
                                    MY.Log.exception(e,"ClientDB.initIndexedDB.SetVersion.onsuccess");
                                }
                            };
                            setVrequest.onerror = function(event) {
                                try {
                                    MY.Log.error("ClientDB.initIndexedDB.SetVersion");
                                    // send the failure as data is not created
                                    if(callback) callback({status : false});
                                } catch(e) {
                                    MY.Log.exception(e,"ClientDB.initIndexedDB.SetVersion.onerror");
                                }
                            };
                        } else {
                            // Same Version and so send the success as database is created
                            if(callback) callback({status : true});
                        }
                    } catch(e) {
                        MY.Log.exception(e,"ClientDB.initIndexedDB.onsuccess");
                    }
                };
                request.onerror = function(event) {
                    try {
                        MY.Log.error("ClientDB.initIndexedDB.onerror:Indexed DB is Failed to Open");
                        // send the failure as data is not created
                        if(callback) callback({status : false});
                    } catch(e) {
                        MY.Log.exception(e,"ClientDB.initIndexedDB.onerror");
                    }
                };
                return true;
            }
        } catch(e) {
            MY.Log.exception(e,"ClientDB.initIndexedDB:Error in IndexedDB Creation");
        }
        return false;
    },
    
    init : function(callback) {
        try {
            var type     = DB_TYPE_INDEXEDDB;
            var maxSize  = DB_MAX_SIZE_INDEXEDDB;
            var openFunc = null;
            
            if("openDatabase" in window) {
                type     = DB_TYPE_SQLITE
                maxSize  = DB_MAX_SIZE_SQLITE;
                openFunc = window.openDatabase;
            } else if("webkitIndexedDB" in window) {
                window.IDBTransaction = window.webkitIDBTransaction;
                window.IDBKeyRange    = window.webkitIDBKeyRange;
                openFunc  = window.webkitIndexedDB;
            } else if("mozIndexedDB" in window) {
                openFunc  = window.mozIndexedDB;
            } else if("indexedDB" in window) {
                openFunc  = window.indexedDB;
            } else if("oIndexedDB" in window) {
                openFunc  = window.oIndexedDB;
            } else if("msIndexedDB" in window) {
                openFunc  = window.msIndexedDB;
            } else if("localStorage" in window) {
                type      = DB_TYPE_LOCALSTORAGE;
                maxSize   = DB_MAX_SIZE_LOCALSTORAGE;
                openFunc  = window.localStorage;
            } else {
                type    = null;
                maxSize = 0;
                openFunc  = null;
                MY.Log.exception("UnSupported:","Browser doesn't support Client DataBase");
            }
            
            if(type != null) {
                this.dbType        = type,
                this.dbMaxSize     = maxSize,
                this.dbOpen        = openFunc,
                this.dbName        = CMN.DB_NAME+"DB";
                this.dbTable       = CMN.DB_NAME+"Table";
                this.dbVersion     = CMN.DB_VERSION;
                
                if(type == DB_TYPE_INDEXEDDB) {
                    return this.initIndexedDB(callback);
                } else if(type == DB_TYPE_SQLITE) {
                    return this.initSQLite(callback);
                } else if(type == DB_TYPE_LOCALSTORAGE) {
                    // Nothing to initialize
                    MY.Log.info("Local Storage DB is created");
                    if(callback) callback({status : true});
                    return true;
                } else {
                    MY.Log.exception("UnSupported:","Browser doesn't support Client DataBase");
                }
            }
        } catch(e) {
            MY.Log.exception(e,"DBDetails.init");
        }
        
        dbType          = null;
        dbMaxSize       = 0;
        dbOpen          = null;
        dbName          = null;
        dbTable         = null;
        dbVersion       = null;
        dbObject        = null;
        return false;
    }
};

var ClientDB = function(dbOwner){this.init(dbOwner);};
ClientDB.prototype = {
    
    // Public Members - Begin
    setValue    : null,
    getValue    : null,
    getKeys     : null,
    deleteValue : null,
    deleteSet   : null,
    clientDBOwner : null,
    // Public Members - End
    
    // Private Functions - Begin
    init : function(dbOwner) {
        try {
            var thisObject = this;
            
            if(dbOwner) {
                thisObject.clientDBOwner = dbOwner;
            } else {
                thisObject.clientDBOwner = new DBDetails();
                thisObject.clientDBOwner.init(null);
            }
            
            var dbType = thisObject.clientDBOwner.dbType;
            
            if(dbType == DB_TYPE_INDEXEDDB) {
                thisObject.setValue     = thisObject.setValueIndexedDB;
                thisObject.getValue     = thisObject.getValueIndexedDB;
                thisObject.getKeys      = thisObject.getKeysIndexedDB;
                thisObject.deleteValue  = function(data){thisObject.deleteKeyInIndexedDB(data,true);};
                thisObject.deleteSet    = function(data){thisObject.deleteKeyInIndexedDB(data,false);};
            } else if(dbType == DB_TYPE_SQLITE) {
                thisObject.setValue     = thisObject.setValueSQLite;
                thisObject.getValue     = thisObject.getValueSQLite;
                thisObject.getKeys      = thisObject.getKeysSQLite;
                thisObject.deleteValue  = function(data){thisObject.deleteKeyInSQLite(data,true);};
                thisObject.deleteSet    = function(data){thisObject.deleteKeyInSQLite(data,false);};
            } else if(dbType == DB_TYPE_LOCALSTORAGE) {
                thisObject.setValue     = thisObject.setValueLocalStorage;
                thisObject.getValue     = thisObject.getValueLocalStorage;
                thisObject.getKeys      = thisObject.getKeysLocalStorage;
                thisObject.deleteValue  = function(data){thisObject.deleteKeyInLocalStorage(data,true);};
                thisObject.deleteSet    = function(data){thisObject.deleteKeyInLocalStorage(data,false);};
            }
            
        } catch(e) {
            MY.Log.exception(e,"ClientDB.init");
        }
    },
    
    /*
     * SQLite Related functions
     */
    setValueSQLite : function(setInput) {
        try {
            var cdObject = this.clientDBOwner;
            cdObject.dbObject.transaction(function(txn){
                txn.executeSql(
                    "REPLACE INTO "+cdObject.dbTable+" VALUES (?,?)",
                    [setInput.key, setInput.value],
                    function(txnSuccess,results) {
                        if(setInput.callback) {
                            setInput.callback({
                                status       : true,
                                writeStatus  : results.rowsAffected
                            });
                        }
                    },
                    function(txnFailure,results) {
                        if(setInput.callback) {
                            setInput.callback({
                                status       : false,
                                errorCode    : results.code,
                                errorMessage : results.message
                            });
                        }
                    }
                );
            });
            return true;
        } catch(e) {
            MY.Log.exception(e,"ClientDB.setValueSQLite");
        }
        return false;
    },
    
    getValueSQLite : function(getInput) {
        try {
            var cdObject = this.clientDBOwner;
            cdObject.dbObject.transaction(function(txn){
                txn.executeSql(
                    'SELECT value FROM '+cdObject.dbTable+' WHERE key LIKE "'+getInput.key+'"',
                    [],
                    function(txnSuccess,results) {
                        if(getInput.callback) {
                            if(results.rows.length > 0) {
                                getInput.callback({
                                    status       : true,
                                    value        : results.rows.item(0).value,
                                });
                            } else {
                                getInput.callback({
                                    status       : false,
                                    errorCode    : 5,
                                    errorMessage : "No Data"
                                });
                            }
                        }
                    },
                    function(txnFailure,results) {
                        if(getInput.callback) {
                            getInput.callback({
                                status       : false,
                                errorCode    : results.code,
                                errorMessage : results.message
                            });
                        }
                    }
                );
            });
            return true;
        } catch(e) {
            MY.Log.exception(e,"ClientDB.getValueSQLite");
        }
        return null;
    },
    
    getKeysSQLite : function(getInput) {
        try {
            var cdObject = this.clientDBOwner;
            cdObject.dbObject.transaction(function(txn){
                txn.executeSql(
                    'SELECT key FROM '+cdObject.dbTable+' WHERE key LIKE "'+getInput.key+'%"',
                    [],
                    function(txnSuccess,results) {
                        if(getInput.callback) {
                            var count = results.rows.length;
                            if(count > 0) {
                                var returnValue = new Array();
                                for(var index=0;index < count; index++) {
                                    returnValue.push(results.rows.item(index).key);
                                }
                                getInput.callback({
                                    status       : true,
                                    value        : returnValue,
                                });
                            } else {
                                getInput.callback({
                                    status       : false,
                                    errorCode    : 5,
                                    errorMessage : "No Data"
                                });
                            }
                        }
                    },
                    function(txnFailure,results) {
                        if(getInput.callback) {
                            getInput.callback({
                                status       : false,
                                errorCode    : results.code,
                                errorMessage : results.message
                            });
                        }
                    }
                );
            });
            return true;
        } catch(e) {
            MY.Log.exception(e,"ClientDB.getKeysSQLite");
        }
        return null;
    },
    
    deleteKeyInSQLite : function(deleteInput,valueOrSet) {
        try {
            var cdObject = this.clientDBOwner;
            cdObject.dbObject.transaction(function(txn){
                txn.executeSql(
                    'DELETE FROM '+cdObject.dbTable+' WHERE key LIKE "'+deleteInput.key+((valueOrSet==true)?('"'):('%"')),
                    [],
                    function(txnSuccess,results) {
                        if(deleteInput.callback) {
                            deleteInput.callback({status:(results.rowsAffected > 0)});
                        }
                    },
                    function(txnFailure,results) {
                        if(deleteInput.callback) {
                            deleteInput.callback({
                                status       : false,
                                errorCode    : results.code,
                                errorMessage : results.message
                            });
                        }
                    }
                );
            });
            return true;
        } catch(e) {
            MY.Log.exception(e,"ClientDB.deleteKeyInSQLite");
        }
        return null;
    },
    
    /*
     * IndexedDB Related functions
     */
    setValueIndexedDB : function(setInput) {
        try {
            var cdObject = this.clientDBOwner;
            if(cdObject.dbObject) {
                var db = cdObject.dbObject;
                var trans = db.transaction([cdObject.dbName], IDBTransaction.READ_WRITE);
                trans.oncomplete = function(event) {
                    //MY.Log.info("setValueIndexedDB:Transaction:All done!");
                };
                trans.onerror = function(event) {
                    //MY.Log.error("setValueIndexedDB:Transaction:Error");
                };
                var store = trans.objectStore(cdObject.dbName);
                var request = store.put({"key":setInput.key,"value":setInput.value});
                
                request.onsuccess = function(event) {
                    if(setInput.callback) {
                        setInput.callback({status:true,writeStatus:1});
                    }
                };
                
                request.onerror = function(event) {
                    if(setInput.callback) {
                        setInput.callback({
                            status       : false,
                            errorCode    : 5,
                            errorMessage : "No Data"
                        });
                    }
                };
                
                return true;
            }
        } catch(e) {
            MY.Log.exception(e,"ClientDB.setValueIndexedDB");
        }
        return false;
    },
    
    getValueIndexedDB : function(getInput) {
        try {
            var cdObject = this.clientDBOwner;
            if(cdObject.dbObject) {
                var db = cdObject.dbObject;
                var trans = db.transaction([cdObject.dbName], IDBTransaction.READ_WRITE);
                var store = trans.objectStore(cdObject.dbName);
                
                // Get the data for the specified Key
                var request = store.get(getInput.key);
                
                request.onsuccess = function(event) {
                    if(getInput.callback) {
                        var returnResult = request.result;
                        var returnStatus = ((returnResult)?(true):(false));
                        if(returnStatus) {
                            getInput.callback({
                                status       : returnStatus,
                                value        : returnResult.value,
                            });
                        } else {
                            getInput.callback({
                                status       : false,
                                errorCode    : 5,
                                errorMessage : "No Data"
                            });
                        }
                    }
                };
                
                request.onerror = function(event) {
                    if(getInput.callback) {
                        getInput.callback({
                            status       : false,
                            errorCode    : 5,
                            errorMessage : "No Data"
                        });
                    }
                };
                
                return true;
            }
            
        } catch(e) {
            MY.Log.exception(e,"ClientDB.getValueIndexedDB");
        }
        return null;
    },
    
    getKeysIndexedDB : function(getKeysInput) {
        try {
            var thisObject = this;
            var cdObject = thisObject.clientDBOwner;
            if(cdObject.dbObject) {
                var db = cdObject.dbObject;
                var trans = db.transaction([cdObject.dbName], IDBTransaction.READ_WRITE);
                var store = trans.objectStore(cdObject.dbName);
                // Get all the Keys and Values
                // !!!Warning, might take too much memory as value will also be there, so releae ASAP
                var request = store.getAll();
                request.onsuccess = function(event) {
                    if(getKeysInput.callback) {
                        var keysCount  = request.result.length;
                        var keyToMatch = getKeysInput.key;
                        var keyLenght  = getKeysInput.key.length;
                        var keysArray  = new Array();
                        for(var index = 0; index < keysCount; index++) {
                            var gotKeyValue = request.result[index].key;
                            if(gotKeyValue.substring(0,keyLenght) == keyToMatch) {
                                keysArray.push(gotKeyValue);
                            }
                        }
                        request.result = null; // making null so that we save memory;
                        getKeysInput.callback({status:true,value:keysArray});
                    }
                };
                
                request.onerror = function(event) {
                    if(getKeysInput.callback) {
                        getKeysInput.callback({
                            status       : false,
                            errorCode    : 5,
                            errorMessage : "No Data"
                        });
                    }
                };
                
                return true;
            }
        } catch(e) {
            MY.Log.exception(e,"ClientDB.getKeysIndexedDB");
        }
        return null;
    },
    
    deleteSetIndexedDB : function(keysList,currentIndex,totalKeys,deleteInput) {
        try {
            var thisObject = this;
            
            var cdObject = thisObject.clientDBOwner;
            var db = cdObject.dbObject;
            var trans = db.transaction([cdObject.dbName], IDBTransaction.READ_WRITE);
            var store = trans.objectStore(cdObject.dbName);
            
            //this will not work --> requestToDelete = store.delete(keysList[currentIndex]);
            //some browsers give parse error as "delete" is a key word
            //so do it the other  way
            var deleteFun = store["delete"];
            requestToDelete = deleteFun.apply(store,[ keysList[currentIndex] ]);
            
            currentIndex++;
            requestToDelete.onsuccess = function(event) {
                if(currentIndex < totalKeys) {
                    thisObject.deleteSetIndexedDB(keysList,currentIndex,totalKeys,deleteInput);
                } else {
                    if(deleteInput.callback) {
                        deleteInput.callback({status:true});
                    }
                }
            };
            requestToDelete.onerror = function(event) {
                if(currentIndex < totalKeys) {
                    thisObject.deleteSetIndexedDB(keysList,currentIndex,totalKeys,deleteInput);
                } else {
                    if(deleteInput.callback) {
                        deleteInput.callback({
                            status       : false,
                            errorCode    : 5,
                            errorMessage : "No Data"
                        });
                    }
                }
            };
        } catch(e) {
            MY.Log.exception(e,"ClientDB.deleteSetIndexedDB");
        }
    },
    
    deleteKeyInIndexedDB : function(deleteInput,valueOrSet) {
        try {
            var thisObject = this;
            var cdObject = thisObject.clientDBOwner;
            if(cdObject.dbObject) {
                var db = cdObject.dbObject;
                var trans = db.transaction([cdObject.dbName], IDBTransaction.READ_WRITE);
                var store = trans.objectStore(cdObject.dbName);
                var request;
                if(valueOrSet == true) {
                    //this will not work --> request = store.delete(deleteInput.key);
                    //some browsers give parse error as "delete" is a key word
                    //so do it the other  way
                    var deleteFun = store["delete"];
                    request = deleteFun.apply(store,[ deleteInput.key ]);
                } else {
                    // Get all the Keys and Values
                    // !!!Warning, might take too much memory as value will also be there, so releae ASAP
                    request = store.getAll();
                }
                request.onsuccess = function(event) {
                    if(valueOrSet == false) {
                        var keysCount  = request.result.length;
                        var keyToMatch = deleteInput.key;
                        var keyLenght  = deleteInput.key.length;
                        var keysArray  = new Array();
                        for(var index = 0; index < keysCount; index++) {
                            var gotKeyValue = request.result[index].key;
                            if(gotKeyValue.substring(0,keyLenght) == keyToMatch) {
                                keysArray.push(gotKeyValue);
                            }
                        }
                        request.result = null; // making null so that we save memory;
                        thisObject.deleteSetIndexedDB(keysArray,0,keysArray.length,deleteInput);
                    } else {
                        if(deleteInput.callback) deleteInput.callback({status:true});
                    }
                };
                
                request.onerror = function(event) {
                    if(deleteInput.callback) {
                        deleteInput.callback({
                            status       : false,
                            errorCode    : 5,
                            errorMessage : "No Data"
                        });
                    }
                };
                
                return true;
            }
        } catch(e) {
            MY.Log.exception(e,"ClientDB.deleteKeyInIndexedDB");
        }
        return null;
    },
    
    /*
     * Local Storage Related functions
     */
    setValueLocalStorage : function(setInput) {
        try {
            localStorage.setItem(this.clientDBOwner.dbName+"DB."+setInput.key,setInput.value);
            if(setInput.callback) {
                setTimeout(function(){
                    setInput.callback({status:true,writeStatus:null});
                },0.0);
            }
            return true;
        } catch(e) {
            if (e == QUOTA_EXCEEDED_ERR) {
                //data wasn't successfully saved due to quota exceed so throw an error
                MY.Log.error("setValueLocalStorage:Fail");
                if(setInput.callback) {
                    setTimeout(function(){
                        setInput.callback({
                            status       : false,
                            errorCode    : null,
                            errorMessage : null
                        });
                    },0.0);
                }
            }
            MY.Log.exception(e,"ClientDB.setValueLocalStorage");
        }
        return false;
    },
    
    getValueLocalStorage : function(getInput) {
        try {
            var value = localStorage.getItem(this.clientDBOwner.dbName+"DB."+getInput.key);
            if(getInput.callback) {
                setTimeout(function() {
                    getInput.callback({status:true,value:value,});
                },0.0);
            }
            return true;
        } catch(e) {
            MY.Log.exception(e,"ClientDB.getValueLocalStorage");
        }
        return null;
    },
    
    getKeysLocalStorage : function(getKeysInput) {
        try {
            if(getKeysInput.callback) {
                var keyToGet  = this.clientDBOwner.dbName+"DB."+getKeysInput.key
                var keysCount = localStorage.length;
                var keyLenght = keyToGet.length;
                var keysArray = new Array();
                for(var index = 0; index < keysCount; index++) {
                    var gotKeyValue = localStorage.key(index);
                    if(gotKeyValue.substring(0,keyLenght) == keyToGet) {
                        keysArray.push(gotKeyValue);
                    }
                }
                setTimeout(function() {
                    getKeysInput.callback({status:true,value:keysArray});
                },0.0);
            }
            return true;
        } catch(e) {
            MY.Log.exception(e,"ClientDB.getKeysLocalStorage");
        }
        return null;
    },
    
    deleteKeyInLocalStorage : function(deleteInput,valueOrSet) {
        try {
            var keyToDelete = this.clientDBOwner.dbName+"DB."+deleteInput.key
            if(valueOrSet) {
                localStorage.removeItem(keyToDelete);
            } else {
                var keysCount = localStorage.length;
                var keyLenght = keyToDelete.length;
                var keysArray = new Array();
                for(var index = 0; index < keysCount; index++) {
                    var gotKeyValue = localStorage.key(index);
                    if(gotKeyValue.substring(0,keyLenght) == keyToDelete) {
                        keysArray.push(gotKeyValue);
                    }
                }
                keysCount = keysArray.length;
                for(var index = 0; index < keysCount; index++) {
                    localStorage.removeItem(keysArray[index]);
                }
            }
            if(deleteInput.callback) {
                setTimeout(function() {deleteInput.callback({status : true});},0.0);
            }
            return true;
        } catch(e) {
            MY.Log.exception(e,"ClientDB.deleteKeyInLocalStorage");
        }
        return null;
    }
    // Private Functions - End
};
