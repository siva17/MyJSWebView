MyJSWebView
===========

Enable Javascript Interface to WebView JavaScript and have communication between JavaScript and Native Code

iOS:
====

###Communication Mechanism from Native Code to JavaScript
To run Javascript in Native Code we are using **– stringByEvaluatingJavaScriptFromString:** method.

###Communication Mechanism from JavaScript to Native Code
To communicate with Native code from JavaScript we are using **URL Schema mechanism**
* native-api:ModuleName:MethodName:JSON Object Parameter

But above mechanisms are irrelevant to developer as MyJSWebView module will be taken care, provides you JavaScript APIs to corresponding Native APIs and vice versa.

###Adding MyJSWebView module

Check out the code from github https://github.com/siva17/MyJSWebView

Create your own xCode project with a View Controller with UIWebView in it.

**Copying required files**

Copy the folder "MyJSWebView" into your project which contains following files
* MyJSBaseNativeModule.h
* MyJSBaseNativeModule.m
* MyJSUIWebView.h
* MyJSUIWebView.m

Copy the folder "my" (JavaScript and HTML code with example) to your project which contains following files
* css\bootstrap.css	-> CSS file
* index.html		-> Index file with example code
* js\test.js		-> Example JavaScript code having Native APIs mapped 

If your index.html file is in different place, please make sure to change the name of the file (with out .html extension) in MyJSUIWebView\MyJSUIWebView\MyJSUIWebView.h file as shown below. You can also change the URL schema according to your requirement. As of now it is defined as 'native-api' as shown below.

```obj-c
// Should be with out .html extension
#define INDEX_FILE_PATH_AND_FILE    @"my/index"
//Case insensitive
#define NATIVE_API_SCHEMA           @"native-api"
```

Optionally, you can copy the Example Code "ExampleAPIs" for reference Contains following files if you are using my\js\test.js file
* TestAPIOne.h
* TestAPIOne.m

As of now, this API (TestAPIOne) is registered in MyJSUIWebView.h, so please remove the respective registration code if your are not using the above.

**Adding required files to Project**

* **Objective-C Code:** Drag and drop "MyJSWebView" folder on to iOS project and add as "Add folders -> Create Groups" option
* **JavaScript Code:** Drag and drop "my" folder on to iOS project and add as "Add folders -> Create folder references" option
* **Example Code:** Drag and drop "ExampleAPIs" folder on to iOS project and add as "Add folders -> Create Groups" option

**Here is the required update in your Project and is simple**

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

* Goto your Storyboard or xib containing your View Controller and add WebView to it appropriately. Select the WebView 
* Go to Custom Class tab and update the Class to “MyJSUIWebView” and Restoration ID to “MyJSUIWebView”
* Go to Outlets tab (last) and you should see “webView” in Referencing Outlets (as you have defined in your View Controller). Map it to View Controller.

Run it and you are good to go.

###Adding Native Modules (like Example **TestAPIOne**)

Add new Objective-C Class (say Example) inheriting from **MyJSBaseNativeModule**, then you should see

**Example.h file**
```obj-c
#import "MyJSBaseNativeModule.h"
@interface Example : MyJSBaseNativeModule

@end
```

**Example.m file**
```obj-c
#import "example.h"

@implementation Example

-(void)APIOne {
    NSLog(@"Called APIOne. Function with No Config Parameter and no return value");
}

-(void)APITwo:(NSDictionary *)config {
    NSLog(@"Called APITwo. Function with Config Parameter and no return value");
    NSLog(@"Config : %@",config);
}

-(void)APIThree:(NSDictionary *)config {
    NSLog(@"Called APIFour. Function with Config Parameter with call back and no return value");
    NSLog(@"Config : %@",config);
    [self.myWebView callCallback:config];
}

-(void)APIFour:(NSDictionary *)config {
	NSLog(@"Called APIFour. Function with Config Parameter with call back and no return value");
	NSLog(@"Config : %@",config);
    NSMutableDictionary *returnConfig = [[NSMutableDictionary alloc]initWithDictionary:config];
    [returnConfig setObject:@"Returned Value" forKey:@"returned"];
    [self.myWebView callCallback:returnConfig];
}

@end
```

Goto MyJSUIWebView.m file and look for **registerJavaScriptAPIs** methond. Add following line of code to register your module
```obj-c
[self registerNativeModule:[[Example alloc]initWithWebView:self] jsModule:@"Example"];
```

Now you can have all the Native APIs accessible in JavaScript as
```js
// API with no parameters
Example.APIOne();

// API with parameters and no call back
Example.APITwo(MY.getNativeParam({
	"key1" : "key1 Value",
	"key2" : "key2 Value"
});

// API with parameters and call back
Example.APIThree(MY.getNativeParam({
    "key1" : "key1 Value",
	"key2" : "key2 Value",
    "callback" : function(param) {
        console.log("CallBack Parameter : "+JSON.stringify(param);
    }
});

// API with parameters and call back with added returned value
Example.APIFour(MY.getNativeParam({
    "key1" : "key1 Value",
    "key2" : "key2 Value",
    "callback" : function(param) {
        console.log("CallBack Parameter : "+JSON.stringify(param);
    }
}));
```

###Please note:
* If the API needs to pass parameter, then it should be the return value of MY.getNativeParam() as shown above
* If API needs to have callback function then JSON Object parameter should have the key as **callback**
* Native APIs can return only string type (NSString which will translate to string in JavaScript)
* Check out ExampleAPIs->TestAPIOne.m file for more possible options



Credits: Concept is copied from github (https://github.com/andiradulescu/EasyJSWebView) and modified to my way of API (with config as parameter).

