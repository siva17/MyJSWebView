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
 * my_test.js
 *
 */
function testLogCallBack(c) {
    console.log("Callback Param: "+JSON.stringify(c));
    document.getElementById("responseID1").innerText = JSON.stringify(c);
}
function testUpdateRequest(str) {
    console.log("Request: "+str);
    str = ((str)?(str):(""));
    document.getElementById("requestID").innerText = str;
    document.getElementById("responseID1").innerText = "";
    document.getElementById("responseID2").innerText = "";
}
function testUpdateReturnValue(str) {
    console.log("Returned Value: "+str);
    str = ((str)?(str):(""));
	document.getElementById("responseID2").innerText = str;
}
function testOne() {
    testUpdateRequest('TestAPIOne.APIOne()');
    TestAPIOne.APIOne();
}
function testTwo() {
    testUpdateRequest('TestAPIOne.APITwo("String Parameter")');
    testUpdateReturnValue(TestAPIOne.APITwo("String Parameter"));
}
function testThree() {
    testUpdateRequest('TestAPIOne.APIThree(MY.getNativeParam({"t1":"t1 Value"}))');
    testUpdateReturnValue(TestAPIOne.APIThree(MY.getNativeParam({"t1":"t1 Value"})));
}
function testFour() {
    testUpdateRequest('TestAPIOne.APIFour(MY.getNativeParam({"t1":"t1 Value"})))');
    testUpdateReturnValue(TestAPIOne.APIFour(MY.getNativeParam({"t1":"t1 Value"})));
}
function testFive() {
    testUpdateRequest('TestAPIOne.APIFive(MY.getNativeParam({"t1":"t1 Value"}))');
    testUpdateReturnValue(TestAPIOne.APIFive(MY.getNativeParam({"t1":"t1 Value"})));
}
function testSix() {
    testUpdateRequest('TestAPIOne.APISix(MY.getNativeParam({"t1":"t1 Value","alert":"This is Alert String","callback":testLogCallBack}))');
    testUpdateReturnValue(TestAPIOne.APISix(MY.getNativeParam({"t1":"t1 Value","alert":"This is Alert String","callback":testLogCallBack})));
}
function testSeven() {
    testUpdateRequest('TestAPIOne.APISeven(MY.getNativeParam({"t1":"t1 Value","alert":"This is Alert String","callback":testLogCallBack}))');
    testUpdateReturnValue(TestAPIOne.APISeven(MY.getNativeParam({"t1":"t1 Value","alert":"This is Alert String","callback":testLogCallBack})));
}
