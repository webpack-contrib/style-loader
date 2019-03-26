const loaderUtils = require('loader-utils');

const url = require('../url');

describe('url tests', () => {
  let getOptions;

  beforeEach(() => {
    getOptions = jest.fn();

    // Mock loaderUtils to override options
    loaderUtils.getOptions = getOptions;
  });

  it('should output HMR code by default', () => {
    expect(/(module\.hot)/g.test(url.pitch())).toBe(true);
  });

  it('should NOT output HMR code when options.hmr is false', () => {
    getOptions.mockReturnValue({ hmr: false });

    expect(/(module\.hot)/g.test(url.pitch())).toBe(false);
  });

  it('should output HMR code when options.hmr is true', () => {
    getOptions.mockReturnValue({ hmr: true });

    expect(/(module\.hot)/g.test(url.pitch())).toBe(true);
  });
});
