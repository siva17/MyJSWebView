MyJSWebView
===========

Enable adding Javascript Interface to WebView JavaScript and have communication between JavaScript and Native Code

iOS:
====

###Communication Mechanism from Native Code to JavaScript
To run Javascript in Native Code we are using **– stringByEvaluatingJavaScriptFromString:** method.

###Communication Mechanism from JavaScript to Native Code
To communicate with Native code from JavaScript we are using **URL Schema mechanism** as follows
	native-api:<ModuleName>:<MethodName>:<JSON Object Parameter>

But above mechanisms are irrelevant to developer as MyJSWebView module will be taken care, provides you JavaScript APIs to corresponding Native APIs and vice versa.

###Adding MyJSWebView module

Check out the code from github https://github.com/siva17/MyJSWebView

Create your own xCode project with a View Controller with UIWebView in it.

**Copying required files**

Copy the folder "MyJSWebView" into your project which contains following files
. MyJSBaseNativeModule.h
. MyJSBaseNativeModule.m
. MyJSUIWebView.h
. MyJSUIWebView.m

Copy the folder "my" (JavaScript and HTML code with example) to your project which contains following files
. css\bootstrap.css	-> CSS file
. index.html		-> Index file with example code
. my.js				-> MyJS module and mandatory to include in your index.html (if different)
. my_clientdb.js	-> If need persistent memory/database, can include in your index.html
. my_test.js		-> Example JavaScript code having Native APIs mapped 

Optionally, you can copy the Example Code "ExampleAPIs" for reference. Contains following files
. TestAPIOne.h
. TestAPIOne.m

As of now, this API is registered in MyJSUIWebView.h, so please remove the respective code if your are not using the above.

**Adding required files to Project**

Objective-C Code: Drag and drop "MyJSWebView" folder on to iOS project and add as "Add folders-> Create Groups" option
JavaScript Code: Drag and drop "my" folder on to iOS project and add as "Add folders-> Create folder references" option
Example Code: Drag and drop "ExampleAPIs" folder on to iOS project and add as "Add folders-> Create Groups" option

**Adding required files to Project**
Your View Controller code should look like this by updating appropriately.

```obj-c
#import "ViewController.h"
#import "MyJSUIWebView.h"

@interface ViewController ()
@property(nonatomic,retain) IBOutlet MyJSUIWebView	*webView;
@end

@implementation ViewController
- (void)viewDidLoad {
	[super viewDidLoad];
	// Do any additional setup after loading the view, typically from a nib.
	[self.webView initializeWebView];
}
- (void)didReceiveMemoryWarning {
	[super didReceiveMemoryWarning];
	// Dispose of any resources that can be recreated.
}
@end
```

Goto your Storyboard or xib containing your View Controller and add WebView to it appropriately.
Select the WebView 
Go to Custom Class tab.
Update the Class to “MyJSUIWebView” and Restoration ID to “MyJSUIWebView”
Go to Outlets tab (last) 
You should see “webView” in Referencing Outlets (as you have defined in your View Controller).
Map it to View Controller.

Run it and you are good to go.



JSON Object from JavaScript can have callback and should have the key as **callback**
For example
```js
{
	"key1" : "key1 Value",
	"callback" : function(param) {
		console.log("CallBack Parameter : "+JSON.stringify(param);
	}
}
```




