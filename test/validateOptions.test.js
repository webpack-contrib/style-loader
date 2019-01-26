var loaderUtils = require('loader-utils');
var assert = require("assert");
var sinon = require('sinon');

describe('validateOptions', () => {
  var getOptionsStub;
  var validateSpy;
  var styleLoader;

  before(() => {
    delete require.cache[require.resolve('schema-utils')];
    delete require.cache[require.resolve('..')];
    require('schema-utils');
    validateSpy = sinon.spy(require.cache[require.resolve('schema-utils')], 'exports');
    styleLoader = require('..');
    getOptionsStub = sinon.stub(loaderUtils, 'getOptions');
  });

  beforeEach(() => {
    validateSpy.resetHistory();
    getOptionsStub.resetBehavior();
    getOptionsStub.resetHistory();
  });

  after(() => {
    validateSpy.restore();
    getOptionsStub.restore();
  });

  it('should not validate undefined options', () => {
    getOptionsStub.returns();
    styleLoader.pitch.call({ cacheable() {} }, 'foo');
    assert(getOptionsStub.calledOnce);
    assert(validateSpy.notCalled);
  });

  it('should validate options', () => {
    getOptionsStub.returns({ insertInto() { console.log('foo'); } });
    styleLoader.pitch.call({ cacheable() {} }, 'foo');
    assert(getOptionsStub.calledOnce);
    assert(validateSpy.calledOnce);
  });
})
