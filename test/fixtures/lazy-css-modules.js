import styles from './css-modules.css';

styles.use();

const node1 = document.createElement("DIV");
const textNode1 = document.createTextNode("Water");

node1.appendChild(textNode1);
node1.className = styles.locals.myClassName;

document.body.appendChild(node1);

const node2 = document.createElement("DIV");
const textNode2 = document.createTextNode("Ground");

node2.appendChild(textNode2);
node2.className = styles.locals.myComposingClass;

document.body.appendChild(node2);
