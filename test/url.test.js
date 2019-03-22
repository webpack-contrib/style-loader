// Node v4 requires "use strict" to allow block scoped let & const

'use strict';

const assert = require('assert');
const sinon = require('sinon');
const loaderUtils = require('loader-utils');
const url = require('../url');

describe('url tests', () => {
  const sandbox = sinon.sandbox.create();
  let getOptions;

  beforeEach(() => {
    // Mock loaderUtils to override options
    getOptions = sandbox.stub(loaderUtils, 'getOptions');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should output HMR code by default', () => {
    assert.equal(/(module\.hot)/g.test(url.pitch()), true);
  });

  it('should NOT output HMR code when options.hmr is false', () => {
    getOptions.returns({ hmr: false });
    assert.equal(/(module\.hot)/g.test(url.pitch()), false);
  });

  it('should output HMR code when options.hmr is true', () => {
    getOptions.returns({ hmr: true });
    assert.equal(/(module\.hot)/g.test(url.pitch()), true);
  });
});
