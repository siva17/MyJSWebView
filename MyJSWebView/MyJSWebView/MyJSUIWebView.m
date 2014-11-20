//
//  MyJSUIWebView.m
//  MyJSWebView
//
//  Created by Siva RamaKrishna Ravuri
//  Copyright (c) 2014 www.siva4u.com. All rights reserved.
//
// The MIT License (MIT)
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
//
//

#import <objc/runtime.h>
#import "MyJSUIWebView.h"
#import "TestAPIOne.h"

@interface MyJSUIWebView()
@property(nonatomic,retain) NSMutableDictionary	*nativeModules;
@end

@implementation MyJSUIWebView

-(NSMutableDictionary *)nativeModules {
    if (!_nativeModules) {
        _nativeModules = [[NSMutableDictionary alloc] init];
    }
    return _nativeModules;
}

-(void)registerNativeModule:(NSObject *)instance jsModule:(NSString *)jsModule {
    [self.nativeModules setValue:instance forKey:jsModule];
}

-(void)injectJavaScriptAPIs {
    NSMutableString* injectJSAPI = [[NSMutableString alloc] init];
    for(id key in self.nativeModules) {
        NSObject* jsModule = [self.nativeModules objectForKey:key];
        [injectJSAPI appendFormat:@"%@%@%@",@"MY.NATIVEAPI.registerJSModule(\"",key,@"\", ["];
        unsigned int mc = 0;
        Class cls = object_getClass(jsModule);
        Method * mlist = class_copyMethodList(cls, &mc);
        for (int i = 0; i < mc; i++){
            [injectJSAPI appendFormat:@"%@%@%@",@"\"",[NSString stringWithUTF8String:sel_getName(method_getName(mlist[i]))],@"\""];
            if(i != mc - 1) [injectJSAPI appendString:@", "];
        }
        free(mlist);
        [injectJSAPI appendString:@"]);"];
    }
    [self stringByEvaluatingJavaScriptFromString:injectJSAPI];
    [self stringByEvaluatingJavaScriptFromString:@"if(MY.onDeviceReady) MY.onDeviceReady();"];
}

-(BOOL)processJSRequest:(UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType {
    NSString *requestString = [[request URL] absoluteString];
    if([requestString hasPrefix:NATIVE_API_SCHEMA]) {
        
        NSArray  *components= [requestString componentsSeparatedByString:@":"];
        NSString *obj		= (NSString*)[components objectAtIndex:1];
        NSString *method	= [(NSString*)[components objectAtIndex:2]stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
        NSString *configStr	= [(NSString*)[components objectAtIndex:3]stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
        __unsafe_unretained NSDictionary *config = [NSJSONSerialization JSONObjectWithData:[configStr dataUsingEncoding:NSUTF8StringEncoding] options:0 error:nil];
        NSObject* jsModule	= [self.nativeModules objectForKey:obj];
        
        // execute the interfacing method
        SEL selector = NSSelectorFromString(method);
        NSMethodSignature* sig = [[jsModule class] instanceMethodSignatureForSelector:selector];
        NSInvocation* invoker = [NSInvocation invocationWithMethodSignature:sig];
        invoker.selector = selector;
        invoker.target = jsModule;
        if(config) [invoker setArgument:&config atIndex:2];
        [invoker invoke];
        
        //return the value by using javascript
        if([sig methodReturnLength] > 0) {
            NSString *retValue;
            [invoker getReturnValue:&retValue];
            if(retValue) {
                retValue = (NSString *)CFBridgingRelease(CFURLCreateStringByAddingPercentEscapes(NULL,(CFStringRef) retValue, NULL, (CFStringRef)@"!*'();:@&=+$,/?%#[]", kCFStringEncodingUTF8));
                [webView stringByEvaluatingJavaScriptFromString:[@"" stringByAppendingFormat:@"MY.NATIVEAPI.retValue = \"%@;\"", retValue]];
            } else {
                [webView stringByEvaluatingJavaScriptFromString:@"MY.NATIVEAPI.retValue=null;"];
            }
        }
        config = nil;
        invoker = nil;
        return NO;
    }
    return YES;
}

-(void)webView:(UIWebView *)webView didFailLoadWithError:(NSError *)error {
}
-(void)webViewDidFinishLoad:(UIWebView *)webView {
    [self injectJavaScriptAPIs];
}
-(void)webViewDidStartLoad:(UIWebView *)webView {
}
-(BOOL)webView:(UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType {
    return [self processJSRequest:webView shouldStartLoadWithRequest:request navigationType:navigationType];
}

/*
// Only override drawRect: if you perform custom drawing.
// An empty implementation adversely affects performance during animation.
- (void)drawRect:(CGRect)rect {
    // Drawing code
}
*/

-(void)registerJavaScriptAPIs {
    [self registerNativeModule:[[TestAPIOne alloc]initWithWebView:self] jsModule:@"TestAPIOne"];
}

-(void)initializeWebView {
    
    self.delegate = self;
    
    [self registerJavaScriptAPIs];
    
    NSString *htmlContent = [[NSString alloc] initWithContentsOfFile:[[NSBundle mainBundle] pathForResource:INDEX_FILE_PATH_AND_FILE ofType:@"html"] encoding:NSUTF8StringEncoding error:NULL];
    NSURL *baseUrl = [NSURL fileURLWithPath:[[NSBundle mainBundle] bundlePath]];
    [self loadHTMLString:htmlContent baseURL:baseUrl];
}

-(void)callCallback:(NSDictionary *)config {
    if(config) {
        NSString *callbackID = [config objectForKey:@"callbackID"];
        if(callbackID) {
            NSString *removeAfterExecute = [config objectForKey:@"removeAfterExecute"];
            if(!removeAfterExecute) removeAfterExecute = @"true";
            NSData *jsonData = [NSJSONSerialization dataWithJSONObject:config options:0 error:nil];
            NSString *jsonString = [[NSString alloc] initWithBytes:[jsonData bytes] length:[jsonData length] encoding:NSUTF8StringEncoding];
            NSString* jsAPIToExecute = [NSString stringWithFormat:@"MY.NATIVEAPI.invokeJSCallback(\"%@\", %@, %@);",callbackID,removeAfterExecute,jsonString];
            [self stringByEvaluatingJavaScriptFromString:jsAPIToExecute];
        }
    }
}

@end
