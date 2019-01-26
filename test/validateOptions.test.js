var loaderUtils = require('loader-utils');
var assert = require("assert");
var sinon = require('sinon');

describe('validateOptions', () => {
  var getOptionsStub;
  var validateSpy;
  var styleLoader;
  var urlStyleLoader;
  var usableStyleLoader;

  afterEach(() => {
    validateSpy.resetHistory();
    getOptionsStub.resetBehavior();
    getOptionsStub.resetHistory();
  });

  after(() => {
    validateSpy.restore();
    getOptionsStub.restore();
  });

  before(() => {
    delete require.cache[require.resolve('schema-utils')];
    delete require.cache[require.resolve('..')];
    delete require.cache[require.resolve('../url')];
    delete require.cache[require.resolve('../useable')];
    require('schema-utils');
    validateSpy = sinon.spy(require.cache[require.resolve('schema-utils')], 'exports');
    styleLoader = require('..');
    urlStyleLoader = require('../url');
    usableStyleLoader = require('../useable');
    getOptionsStub = sinon.stub(loaderUtils, 'getOptions');
  });

  describe('index', () => {

    it('should not validate in normal', () => {
      styleLoader.call({ cacheable() {} }, 'foo');
      assert(getOptionsStub.notCalled);
      assert(validateSpy.notCalled);
    });

    it('should not validate undefined options', () => {
      getOptionsStub.returns();
      styleLoader.pitch.call({ cacheable() {} }, 'foo');
      assert(getOptionsStub.calledOnce);
      assert(validateSpy.notCalled);
    });

    it('should validate options.insertInto as fn', () => {
      getOptionsStub.returns({ insertInto() { } })
      styleLoader.pitch.call({ cacheable() {} }, 'foo');
      assert(getOptionsStub.calledOnce);
      assert(validateSpy.calledOnce);
    });

    it('should validate options.insertInto as str', () => {
      getOptionsStub.returns({ insertInto: 'bar' })
      styleLoader.pitch.call({ cacheable() {} }, 'foo');
      assert(getOptionsStub.calledOnce);
      assert(validateSpy.calledOnce);
    });
  });

  describe('url', () => {
    it('should not validate in normal', () => {
      urlStyleLoader.call({ cacheable() {} }, 'foo');
      assert(getOptionsStub.notCalled);
      assert(validateSpy.notCalled);
    });

    it('should not validate undefined options', () => {
      getOptionsStub.returns();
      urlStyleLoader.pitch.call({ cacheable() {} }, 'foo');
      assert(getOptionsStub.calledOnce);
      assert(validateSpy.notCalled);
    });

    it('should validate options.insertInto as fn', () => {
      getOptionsStub.returns({ insertInto() { } })
      urlStyleLoader.pitch.call({ cacheable() {} }, 'foo');
      assert(getOptionsStub.calledOnce);
      assert(validateSpy.calledOnce);
    });

    it('should validate options.insertInto as str', () => {
      getOptionsStub.returns({ insertInto: 'bar' })
      urlStyleLoader.pitch.call({ cacheable() {} }, 'foo');
      assert(getOptionsStub.calledOnce);
      assert(validateSpy.calledOnce);
    });
  });

  describe('usable', () => {
    it('should not validate in normal', () => {
      usableStyleLoader.call({ cacheable() {} }, 'foo');
      assert(getOptionsStub.notCalled);
      assert(validateSpy.notCalled);
    });

    it('should not validate undefined options', () => {
      getOptionsStub.returns();
      usableStyleLoader.pitch.call({ cacheable() {} }, 'foo');
      assert(getOptionsStub.calledOnce);
      assert(validateSpy.notCalled);
    });

    it('should validate options.insertInto as fn', () => {
      getOptionsStub.returns({ insertInto() { } })
      usableStyleLoader.pitch.call({ cacheable() {} }, 'foo');
      assert(getOptionsStub.calledOnce);
      assert(validateSpy.calledOnce);
    });

    it('should validate options.insertInto as str', () => {
      getOptionsStub.returns({ insertInto: 'bar' })
      usableStyleLoader.pitch.call({ cacheable() {} }, 'foo');
      assert(getOptionsStub.calledOnce);
      assert(validateSpy.calledOnce);
    });
  });
})
