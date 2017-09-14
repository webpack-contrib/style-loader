// Node v4 requires "use strict" to allow block scoped let & const
"use strict";

var assert = require("assert");
var sinon = require('sinon');
var loaderUtils = require('loader-utils');

var url = require("../url");

describe("url tests", function () {
  var sandbox = sinon.sandbox.create();
  var getOptions;

  beforeEach(() => {
    // Mock loaderUtils to override options
    getOptions = sandbox.stub(loaderUtils, 'getOptions');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should output HMR code by default", function () {
    assert.equal(/Hot Module Replacement/g.test(url.pitch()), true);
  });

  it("should NOT output HMR code when options.hmr is false", function () {
    getOptions.returns({hmr: false});
    assert.equal(/Hot Module Replacement/g.test(url.pitch()), false);
  });

  it("should output HMR code when options.hmr is true", function () {
    getOptions.returns({hmr: true});
    assert.equal(/Hot Module Replacement/g.test(url.pitch()), true);
  });

});
