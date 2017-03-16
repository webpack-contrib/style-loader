// Node v4 requires "use strict" to allow block scoped let & const
"use strict";
var assert = require("assert");
var url = require('url');

describe("fix urls tests", function() {
    var fixUrls = require("../fixUrls");
    var defaultUrl = "https://x.y.z/a/b.html";

    beforeEach(function() {
        global.window = {
            location: url.parse(defaultUrl)
        };
    });

    var assertUrl = function (origCss, expectedCss, specialUrl) {
        if (specialUrl) {
            global.window = {
                location: url.parse(specialUrl)
            };
        }
        var resultCss = fixUrls(origCss, specialUrl || defaultUrl);
        expectedCss = expectedCss || origCss;

        assert.equal(expectedCss, resultCss);
    };

    // no change
    it("Null css is not modified", function() {
      assertUrl(null)
    });

    it("Blank css is not modified", function() { assertUrl("") });

    it("No url is not modified", function () { assertUrl("body { }") });

    it("Full url isn't changed (no quotes)", function() {
      assertUrl("body { background-image:url(http://example.com/bg.jpg); }")
    });

    it("Full url isn't changed (no quotes, spaces)", function() {
      assertUrl("body { background-image:url ( http://example.com/bg.jpg  ); }");
    });

    it("Full url isn't changed (double quotes)", function() {
      assertUrl("body { background-image:url(\"http://example.com/bg.jpg\"); }")
    });

    it("Full url isn't changed (double quotes, spaces)", function() {
      assertUrl("body { background-image:url (  \"http://example.com/bg.jpg\" ); }")
    });

    it("Full url isn't changed (single quotes)", function() {
      assertUrl("body { background-image:url('http://example.com/bg.jpg'); }")
    });

    it("Full url isn't changed (single quotes, spaces)", function() {
      assertUrl("body { background-image:url ( 'http://example.com/bg.jpg'  ); }")
    });

    it("Multiple full urls are not changed", function() {
      assertUrl(
          "body { background-image:url(http://example.com/bg.jpg); }\ndiv.main { background-image:url ( 'https://www.anothersite.com/another.png' ); }"
      );
    });

    it("Http url isn't changed", function() {
      assertUrl("body { background-image:url(http://example.com/bg.jpg); }");
    });

    it("Https url isn't changed", function() {
      assertUrl("body { background-image:url(https://example.com/bg.jpg); }");
    });

    it("HTTPS url isn't changed", function() {
      assertUrl("body { background-image:url(HTTPS://example.com/bg.jpg); }")
    });

    it("File url isn't changed", function() {
      assertUrl("body { background-image:url(file:///example.com/bg.jpg); }")
    });

    it("Double slash url isn't changed", function() {
      assertUrl(
          "body { background-image:url(//example.com/bg.jpg); }",
          "body { background-image:url(\"//example.com/bg.jpg\"); }"
      )
    });

    it("Image data uri url isn't changed", function() {
      assertUrl("body { background-image:url(data:image/png;base64,qsrwABYuwNkimqm3gAAAABJRU5ErkJggg==); }")
    });

    it("Font data uri url isn't changed", function() {
      assertUrl(
          "body { background-image:url(data:application/x-font-woff;charset=utf-8;base64,qsrwABYuwNkimqm3gAAAABJRU5ErkJggg); }"
      );
    });

    // relative urls
    it("Relative url", function() {
      assertUrl(
          "body { background-image:url (bg.jpg); }",
          "body { background-image:url(\"https://x.y.z/a/bg.jpg\"); }"
      );
    });

    it("Relative url case sensitivity", function() {
        assertUrl(
            "body { background-image:URL (bg.jpg); }",
            "body { background-image:url(\"https://x.y.z/a/bg.jpg\"); }"
        );
    });

    it("Relative url with path", function() {
      assertUrl(
          "body { background-image:url(c/d/bg.jpg); }",
          "body { background-image:url(\"https://x.y.z/a/c/d/bg.jpg\"); }"
      );
    });
    it("Relative url with dot slash", function() {
      assertUrl(
          "body { background-image:url(./c/d/bg.jpg); }",
          "body { background-image:url(\"https://x.y.z/a/c/d/bg.jpg\"); }"
      );
    });

    it("Multiple relative urls", function() {
      assertUrl(
          "body { background-image:url(bg.jpg); }\ndiv.main { background-image:url(./c/d/bg.jpg); }",
          "body { background-image:url(\"https://x.y.z/a/bg.jpg\"); }\ndiv.main { background-image:url(\"https://x.y.z/a/c/d/bg.jpg\"); }"
      );
    });
    it("Relative url that looks like data-uri", function() {
      assertUrl(
          "body { background-image:url(data/image/png.base64); }",
          "body { background-image:url(\"https://x.y.z/a/data/image/png.base64\"); }"
      );
    });

    // urls with hashes
    it("Relative url with hash are not changed", function() {
        assertUrl("body { background-image:url(#bg.jpg); }");
    });

    // rooted urls
    it("Rooted url", function() {
      assertUrl(
          "body { background-image:url(/bg.jpg); }",
          "body { background-image:url(\"https://x.y.z/bg.jpg\"); }"
      );
    });
    it("Rooted url with path", function() {
      assertUrl(
          "body { background-image:url(/a/b/bg.jpg); }",
          "body { background-image:url(\"https://x.y.z/a/b/bg.jpg\"); }"
      );
    });

    //special locations
    it("Location with no path, filename only", function() {
      assertUrl(
          "body { background-image:url(bg.jpg); }",
          "body { background-image:url(\"http://x.y.z/bg.jpg\"); }",
          "http://x.y.z"
      );
    });

    it("Location with no path, path with filename", function() {
      assertUrl(
          "body { background-image:url(a/bg.jpg); }",
          "body { background-image:url(\"http://x.y.z/a/bg.jpg\"); }",
          "http://x.y.z"
      );
    });
    it("Location with no path, rel path with filename", function() {
      assertUrl(
          "body { background-image:url(./a/bg.jpg); }",
          "body { background-image:url(\"http://x.y.z/a/bg.jpg\"); }",
          "http://x.y.z"
      );
    });
    it("Location with no path, root filename", function() {
      assertUrl(
          "body { background-image:url(/a/bg.jpg); }",
          "body { background-image:url(\"http://x.y.z/a/bg.jpg\"); }",
          "http://x.y.z"
      );
    });

    it("Doesn't break inline SVG", function() {
        const svg = "url('data:image/svg+xml;charset=utf-8,<svg><feFlood flood-color=\"rgba(0,0,0,0.5)\" /></svg>')";

        assertUrl(
            "body: {  background: " + svg + " }"
        );
    });
});
