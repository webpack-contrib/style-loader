const element = document.createElement('div');

element.id = "test-shadow";
document.body.appendChild(element);

const styles = require('./style.css');
const stylesOther = require('./style-other.css');

styles.use();
stylesOther.use();
