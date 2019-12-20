let css = require('./style.css');

css = css.__esModule ? css.default : css;

// ref still 0
css.unuse();
// ref 1
css.use();
