import * as mod from './es-modules.css';

const node1 = document.createElement("DIV");

const textNode1 = document.createTextNode(`
============================
EXPORTS:
============================
${JSON.stringify(mod, null, '\t')}
============================
`);

node1.appendChild(textNode1);

document.body.appendChild(node1);
