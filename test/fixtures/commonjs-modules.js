const styles = require('./es-modules.css');

const node1 = document.createElement("DIV");

const textNode1 = document.createTextNode(`
EXPORTS:
============================
${JSON.stringify(styles, null, '\t')}
============================
`);

node1.appendChild(textNode1);

document.body.appendChild(node1);
