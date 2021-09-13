var styles = [];

// eslint-disable-next-line no-multi-assign
exports = module.exports = function () {
  return styles.join("\n");
};

exports.add = function (content) {
  styles.push(content);
};
