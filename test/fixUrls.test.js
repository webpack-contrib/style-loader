"use strict";

var url = require('url');

var semver = require('semver');

describe("fix urls tests", function() {
    var fixUrls = require("../lib/urls");
    var defaultUrl = "https://x.y.z/a/b.html";

    var assertUrl = function (origCss, expectedCss, specialUrl) {
        // jsdom doesn't work with location on node@6 and anode@8
        if (semver.lte(process.version, '10.0.0')) {
          expect(true).toBe(true);

          return;
        }

        Object.defineProperty(window, 'location', {
          writable: true,
          value: specialUrl ? url.parse(specialUrl) : url.parse(defaultUrl)
        });

        var resultCss = fixUrls(origCss);

        expectedCss = expectedCss || origCss;

        expect(expectedCss).toBe(resultCss);
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
          "body { background-image:url(\"https://x.y.z/a/bg.jpg\"); }",
          "https://x.y.z/a/"
      );
    });

    it("Relative url case sensitivity", function() {
        assertUrl(
            "body { background-image:URL (bg.jpg); }",
            "body { background-image:url(\"https://x.y.z/a/bg.jpg\"); }",
            "https://x.y.z/a/"
        );
    });

    it("Relative url with path", function() {
      assertUrl(
          "body { background-image:url(c/d/bg.jpg); }",
          "body { background-image:url(\"https://x.y.z/a/c/d/bg.jpg\"); }",
          "https://x.y.z/a/"
      );
    });

    it("Relative url with dot slash", function() {
      assertUrl(
          "body { background-image:url(./c/d/bg.jpg); }",
          "body { background-image:url(\"https://x.y.z/a/c/d/bg.jpg\"); }",
          "https://x.y.z/a/"
      );
    });

    it("Multiple relative urls", function() {
      assertUrl(
          "body { background-image:url(bg.jpg); }\ndiv.main { background-image:url(./c/d/bg.jpg); }",
          "body { background-image:url(\"https://x.y.z/a/bg.jpg\"); }\ndiv.main { background-image:url(\"https://x.y.z/a/c/d/bg.jpg\"); }",
          "https://x.y.z/a/"
      );
    });

    it("Relative url that looks like data-uri", function() {
      assertUrl(
          "body { background-image:url(data/image/png.base64); }",
          "body { background-image:url(\"https://x.y.z/a/data/image/png.base64\"); }",
          "https://x.y.z/a/"
      );
    });

    // urls with hashes
    it("Relative url with hash are not changed", function() {
        assertUrl("body { background-image:url(#bg.jpg); }");
    });

    // empty urls
    it("Empty url should be skipped", function() {
      assertUrl("body { background-image:url(); }");
      assertUrl("body { background-image:url( ); }");
      assertUrl("body { background-image:url(\n); }");
      assertUrl("body { background-image:url(''); }");
      assertUrl("body { background-image:url(' '); }");
      assertUrl("body { background-image:url(\"\"); }");
      assertUrl("body { background-image:url(\" \"); }");
    });

    // rooted urls
    it("Rooted url", function() {
      assertUrl(
          "body { background-image:url(/bg.jpg); }",
          "body { background-image:url(\"https://x.y.z/bg.jpg\"); }",
          "https://x.y.z"
      );
    });
    it("Rooted url with path", function() {
      assertUrl(
          "body { background-image:url(/a/b/bg.jpg); }",
          "body { background-image:url(\"https://x.y.z/a/b/bg.jpg\"); }",
          "https://x.y.z"
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
    it("Doesn't break inline SVG with HTML comment", function() {
        const svg = "url('data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22utf-8%22%3F%3E%0A%3C!--%20Comment%20--%3E%0A%3Csvg%3E%3C%2Fsvg%3E%0A')";

        assertUrl(
            "body: {  background: " + svg + " }"
        );
    });
});
