"use strict";

var assert = require("assert");
var sinon = require('sinon');
var loaderUtils = require('loader-utils');

var useable = require("../src/useable");

describe("useable tests", function () {
  var sandbox = sinon.sandbox.create();
  var getOptions;

  beforeEach(() => {
    // Mock loaderUtils to override options
    getOptions = sandbox.stub(loaderUtils, 'getOptions');
  });

  afterEach(() => {
    sandbox.restore();
  });

  test("should output HMR code by default", function () {
    assert.equal(/Hot Module Replacement/g.test(useable.pitch()), true);
  });

  test("should NOT output HMR code when options.hmr is false", function () {
    getOptions.returns({hmr: false});
    assert.equal(/Hot Module Replacement/g.test(useable.pitch()), false);
  });

  test("should output HMR code when options.hmr is true", function () {
    getOptions.returns({hmr: true});
    assert.equal(/Hot Module Replacement/g.test(useable.pitch()), true);
  });
});
