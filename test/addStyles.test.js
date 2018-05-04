"use strict";
var assert = require("assert");
var url = require('url');

describe("addStyles update transform function", function() {
  var originalCSSLike = '.validCSS.required {}';
  var updatedCSSLike = '.updatedCSS.required {}';
  var emptyCSSLike = '';
  var window;

  var originalList = [['module_path', originalCSSLike, '']];
  var updatedList = [['module_path', updatedCSSLike, '']];
  var emptyList = [['module_path', emptyCSSLike, '']];

  // a lot of internal mutation
  var addStylesEntry = require("../lib/addStyles");

  var utils = require("./utils"),
              runDOMTest = utils.runDOMTest;

  var jsdomHtml = [
    "<html>",
    "<head>",
    "</head>",
    "<body>",
    "<div class='target'>",
    "</div>",
    "</body>",
    "</html>"
  ].join("\n");  

  afterEach(function() {
    window = undefined;
  }); 

  // With pain, mutate the global window object 
  it("should verify basic transform capability during HMR", function(done) {
    var oneShot = 1;
    var styleLoaderOptions = {};
    styleLoaderOptions.transform = function(css) {
      return oneShot-- && css;
    };

    function applyUpdate() {

      //Mutate global scope as the addStyles code expects it
      global.window = window = this;
      global.document = this.document;
      // Unfortunately getElement internally memoizes at mutuates at the module level so we
      // can't test with it. This gets us around the issue
      styleLoaderOptions.insertInto = function() {
        return window.document.head;
      };

      var updateFn = addStylesEntry.call(window, originalList, styleLoaderOptions);
      // After the initial load, we should have a style node
      assert(this.document.querySelectorAll('style').length);

      updateFn.call(window, updatedList);
      // After the update, the transform returns falsey we should remove it
      const numStyleNodes = this.document.querySelectorAll('style').length;

      // force it to clean up the stylesInDom
      updateFn.call(window);

      return numStyleNodes;
    }

    runDOMTest(
      jsdomHtml,
      undefined,
      0,
      done,
      applyUpdate
    )
   });

  // See issue #324, place holder for a future test once that issue is fixed
  it.skip("should load the css if the transform function returns data during HMR");

  it("should receive the updated css in the transform function during HMR", function(done) {
    function applyUpdate(){

      //Mutate global scope as the addStyles code expects it
      global.window = window = this;
      global.document = this.document;
      
      var lastCapturedCSSToTransform;
      var styleLoaderOptions = {};
      styleLoaderOptions.transform = function(css) {
        lastCapturedCSSToTransform = css;
        return css;
      };
      // Unfortunately getElement internally memoizes at mutuates at the module level so we
      // can't test with it. This gets us around the issue
      styleLoaderOptions.insertInto = function() {
        return window.document.head;
      };

      var updateFn = addStylesEntry.call(window, originalList, styleLoaderOptions);
      updateFn.call(window, updatedList);

      // force it to clean up the stylesInDom
      updateFn.call(window);

      //Return the CSS passed to the transform function for comparison
      return lastCapturedCSSToTransform;
    }

    runDOMTest(
      jsdomHtml,
      undefined,
      updatedCSSLike,
      done,
      applyUpdate
    )
  });

  it("should load the transformed css returned by the transform function during HMR", function(done) {
    var transform = require('./transforms/transform');
    function applyUpdate(){

      //Mutate global scope as the addStyles code expects it
      global.window = window = this;
      global.document = this.document;

      var styleLoaderOptions = {transform: transform};
      // Unfortunately getElement internally memoizes at mutuates at the module level so we
      // can't test with it. This gets us around the issue
      styleLoaderOptions.insertInto = function() {
        return window.document.head;
      };

      var updateFn = addStylesEntry.call(window, originalList, styleLoaderOptions);
      updateFn.call(window, updatedList);
      //assert(this.document.querySelectorAll('style').length);
      var updatedStyles = window.document.querySelectorAll('style')[0].innerHTML;

      // force it to clean up the stylesInDom
      updateFn.call(window);

      //Return the CSS passed to the transform function for comparison
      return updatedStyles;
    }

    runDOMTest(
      jsdomHtml,
      undefined,
      transform(updatedCSSLike),
      done,
      applyUpdate
    )
  });
});
