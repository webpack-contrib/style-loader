

var fixUrls = require("../fixUrls");

var currentUrl = "https://x.y.z/a/b.html";

var logs = [];
var numberOfErrors = 0;

var assert = function (title, origCss, expectedCss, specialUrl) {
  var resultCss = fixUrls(origCss, specialUrl || currentUrl);
  expectedCss = expectedCss || origCss;

  if (resultCss === expectedCss) {
    logs.push("OK: " + title);
  }else{
    logs.push("\nERROR: " + title+"\nRESULT\n"+resultCss+"\nEXPECTED:\n"+expectedCss+"\n");
    numberOfErrors += 1;
  }
};

var finish = function () {
  console.log(logs.join("\n"));
  if (numberOfErrors) { throw new Error(numberOfErrors + " ERRORS"); }
};

module.exports = function () {

  // no change
  assert("Null css is not modified", null);
  assert("Blank css is not modified", "");
  assert("No url is not modified", "body { }");
  assert("Full url isn't changed (no quotes)", "body { background-image:url(http://example.com/bg.jpg); }");
  assert("Full url isn't changed (no quotes, spaces)", "body { background-image:url ( http://example.com/bg.jpg  ); }");
  assert("Full url isn't changed (double quotes)", "body { background-image:url(\"http://example.com/bg.jpg\"); }");
  assert("Full url isn't changed (double quotes, spaces)", "body { background-image:url (  \"http://example.com/bg.jpg\" ); }");
  assert("Full url isn't changed (single quotes)", "body { background-image:url('http://example.com/bg.jpg'); }");
  assert("Full url isn't changed (single quotes, spaces)", "body { background-image:url ( 'http://example.com/bg.jpg'  ); }");
  assert("Multiple full urls are not changed", "body { background-image:url(http://example.com/bg.jpg); }\ndiv.main { background-image:url ( 'https://www.anothersite.com/another.png' ); }");
  assert("Http url isn't changed", "body { background-image:url(http://example.com/bg.jpg); }");
  assert("Https url isn't changed", "body { background-image:url(https://example.com/bg.jpg); }");
  assert("HTTPS url isn't changed", "body { background-image:url(HTTPS://example.com/bg.jpg); }");
  assert("File url isn't changed", "body { background-image:url(file:///example.com/bg.jpg); }");
  assert("Image data uri url isn't changed", "body { background-image:url(data:image/png;base64,qsrwABYuwNkimqm3gAAAABJRU5ErkJggg==); }");
  assert("Font data uri url isn't changed", "body { background-image:url(data:application/x-font-woff;charset=utf-8;base64,qsrwABYuwNkimqm3gAAAABJRU5ErkJggg); }");

  // relative urls
  assert("Relative url", "body { background-image:url(bg.jpg); }", "body { background-image:url(\"https://x.y.z/a/bg.jpg\"); }");
  assert("Relative url with path", "body { background-image:url(c/d/bg.jpg); }", "body { background-image:url(\"https://x.y.z/a/c/d/bg.jpg\"); }");
  assert("Relative url with dot slash", "body { background-image:url(./c/d/bg.jpg); }", "body { background-image:url(\"https://x.y.z/a/c/d/bg.jpg\"); }");
  assert("Multiple relative urls", "body { background-image:url(bg.jpg); }\ndiv.main { background-image:url(./c/d/bg.jpg); }", "body { background-image:url(\"https://x.y.z/a/bg.jpg\"); }\ndiv.main { background-image:url(\"https://x.y.z/a/c/d/bg.jpg\"); }");
  assert("Relative url that looks like data-uri", "body { background-image:url(data/image/png.base64); }", "body { background-image:url(\"https://x.y.z/a/data/image/png.base64\"); }");

  // rooted urls
  assert("Rooted url", "body { background-image:url(/bg.jpg); }", "body { background-image:url(\"https://x.y.z/bg.jpg\"); }");
  assert("Rooted url with path", "body { background-image:url(/a/b/bg.jpg); }", "body { background-image:url(\"https://x.y.z/a/b/bg.jpg\"); }");

  // protocol-less urls are fixed
  assert("Absolute urls without protocol are fixed, http", "body { background-image:url(//example.com/s/bg.jpg); }", "body { background-image:url(\"http://example.com/s/bg.jpg\"); }", "http://someothersite.com");
  assert("Absolute urls without protocol are fixed, https", "body { background-image:url(//example.com/s/bg.jpg); }", "body { background-image:url(\"https://example.com/s/bg.jpg\"); }", "https://someothersite.com");

  //special locations
  assert("Location with no path, filename only", "body { background-image:url(bg.jpg); }", "body { background-image:url(\"http://x.y.z/bg.jpg\"); }", "http://x.y.z");
  assert("Location with no path, path with filename", "body { background-image:url(a/bg.jpg); }", "body { background-image:url(\"http://x.y.z/a/bg.jpg\"); }", "http://x.y.z");
  assert("Location with no path, rel path with filename", "body { background-image:url(./a/bg.jpg); }", "body { background-image:url(\"http://x.y.z/a/bg.jpg\"); }", "http://x.y.z");
  assert("Location with no path, root filename", "body { background-image:url(/a/bg.jpg); }", "body { background-image:url(\"http://x.y.z/a/bg.jpg\"); }", "http://x.y.z");

  //location is required
  try {
    fixUrls("", null);
    logs.push("ERROR: Current url must be required");
    numberOfErrors += 1;
  }catch(e){
    logs.push("OK: Current url is required");
  }

  // finish up
  finish();

};

