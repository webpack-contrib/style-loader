function listToStyles (list, options) {
  var styles = [];
  var newStyles = {};

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var css = item[1];
    var media = item[2];
    var sourceMap = item[3];
    var part = {css: css, media: media, sourceMap: sourceMap};

    if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
    else newStyles[id].parts.push(part);
  }

  return styles;
}

module.exports = listToStyles;
