var path = require("path");

var utils = {
  exists: function (fileSystem, filename) {
    var exists = false;
    try {
      exists = fileSystem.statSync(filename).isFile();
    } catch (err) {
      if (err.code !== "ENOENT") throw err;
    }
  
    return exists;
  },
  
  findPackage: function (fileSystem, start) {
    var file = path.join(start, "package.json");
    if (utils.exists(fileSystem, file)) {
      return require(file);
    }
  
    var up = path.dirname(start);
  
    // Reached root
    if (up !== start) {
      return utils.findPackage(fileSystem, up);
    }
    return null;
  },
  
  addAttrs: function (element, attrs) {
    Object.keys(attrs).forEach(function (key) {
      element.setAttribute(key, attrs[key]);
    });
  },
};

module.exports = utils;



