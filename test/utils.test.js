var assert = require("assert");
var fs = require("fs");
var path = require("path");
var jsdom = require('jsdom');
var utils = require("../lib/utils");

var exists = utils.exists;
var findPackage = utils.findPackage;
var addAttrs = utils.addAttrs;

describe('Utils Test', () => {
  it("exist", function(done) {
    assert.equal(exists(fs, path.join(__dirname, 'basic.test.js')), true);
    done();
  });

  it('not exist', function(done) {
    assert.equal(exists(fs, path.join(__dirname, 'xx.js')), false);
    done();
  });

  it('findPackage', function(done) {
    assert.equal(findPackage(fs, __dirname).name, 'style-loader');
    done();
  });

  it('findPackage null', function(done) {
    assert.equal(findPackage(fs, '/'), null);
    done();
  });

  it('addAttrs', function(done) {
    jsdom.env(
      '<p></p>',
      [],
      function (err, window) {
        var doc = window.document;
        var ele = doc.createElement('div');
        var attrs = {
          id: 'div',
          width: '100px'
        };
        addAttrs(ele, attrs);
        assert.equal(ele.id, 'div');
        assert.equal(ele.getAttribute('width'), '100px');
        window.close();
        done();
      }
    );
  });
});
