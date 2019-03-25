"use strict";

var loaderUtils = require('loader-utils');

var url = require("../url");

describe("url tests", function () {
  var getOptions;

  beforeEach(() => {
    getOptions = jest.fn();

    // Mock loaderUtils to override options
    loaderUtils.getOptions = getOptions;
  });

  it("should output HMR code by default", function () {
    expect(/(module\.hot)/g.test(url.pitch())).toBe(true);
  });

  it("should NOT output HMR code when options.hmr is false", function () {
    getOptions.mockReturnValue({ hmr: false });

    expect(/(module\.hot)/g.test(url.pitch())).toBe(false);
  });

  it("should output HMR code when options.hmr is true", function () {
    getOptions.mockReturnValue({ hmr: true });

    expect(/(module\.hot)/g.test(url.pitch())).toBe(true);
  });
});
