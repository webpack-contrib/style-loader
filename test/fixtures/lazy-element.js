const element = document.createElement('div');

element.id = "test-shadow";
document.body.appendChild(element);

const styles = require('./style.css').default;
const stylesOther = require('./style-other.css').default;

styles.use();
stylesOther.use();
