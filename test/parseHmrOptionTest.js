// Node v4 requires "use strict" to allow block scoped let & const
"use strict";

var assert = require("assert");

var parseHmrOption = require("../lib/parseHmrOption");

describe("parseHmrOption tests", function () {

  it("should output same hmr value if defined", function () {
    assert.equal(parseHmrOption(true), true);
    assert.equal(parseHmrOption(false), false);
  });

  it("should output the right values if undefined", function () {
    assert.equal(parseHmrOption(), true);
    assert.equal(parseHmrOption(undefined), true);

    var originalEvent = process.env && process.env.npm_lifecycle_event;

    process.env = process.env || {};

    process.env.npm_lifecycle_event = '';
    assert.equal(parseHmrOption(), true);

    process.env.npm_lifecycle_event = 'prepublish';
    assert.equal(parseHmrOption(), false);

    process.env.npm_lifecycle_event = 'prepublishOnly';
    assert.equal(parseHmrOption(), false);

    process.env.npm_lifecycle_event = 'PREPUBLISH';
    assert.equal(parseHmrOption(), false);

    process.env.npm_lifecycle_event = 'PREPUBLISHONLY';
    assert.equal(parseHmrOption(), false);

    process.env.npm_lifecycle_event = 'dev';
    assert.equal(parseHmrOption(), true);

    process.env.npm_lifecycle_event = 'test';
    assert.equal(parseHmrOption(), true);

    process.env.npm_lifecycle_event = 'start';
    assert.equal(parseHmrOption(), true);

    process.env.npm_lifecycle_event = 'something';
    assert.equal(parseHmrOption(), true);

    if (originalEvent) {
      process.env.npm_lifecycle_event = originalEvent;
    }
  });
});
