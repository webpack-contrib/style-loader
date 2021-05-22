import defaultImport, * as allImports from './es-modules.css';

const node1 = document.createElement("DIV");

const textNode1 = document.createTextNode(`
EXPORTED defaultImport:
============================
${JSON.stringify(defaultImport, null, '\t')}
============================
EXPORTED allImports:
============================
${JSON.stringify(allImports, null, '\t')}
============================
`);

node1.appendChild(textNode1);

document.body.appendChild(node1);
