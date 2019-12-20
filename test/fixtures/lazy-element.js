const element = document.createElement('div');

element.id = "test-shadow";
document.body.appendChild(element);

let styles = require('./style.css');
let stylesOther = require('./style-other.css');

styles = styles.__esModule ? styles.default : styles;
stylesOther = stylesOther.__esModule ? stylesOther.default : stylesOther;

styles.use();
stylesOther.use();
