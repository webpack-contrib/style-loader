/* eslint-env browser */
/* eslint-disable no-console */
import './style.css';
import './other-style.scss';
import component from './component.module.css';
import styleLazy from './style.lazy.css';
import useUnse from './use-unuse.lazy.css';
import otherStyleLazy from './other-style.lazy.scss';
import componentLazy from './component.lazy.module.css';
import './style.link.css';
import './order.css';
import './custom-square';

console.log('___LOCALS___');
console.log(component);

console.log('___LOCALS_LAZY___');
console.log(componentLazy);

styleLazy.use();
otherStyleLazy.use();

const articleElement1 = document.createElement('article');
const h3Element = document.createElement('h3');
const h3TextNode = document.createTextNode('CSS modules');

const divElement1 = document.createElement('div');
const divElement1Content = document.createTextNode('Red');

divElement1.className = component['module-red'];
divElement1.appendChild(divElement1Content);

const divElement2 = document.createElement('div');
const divElement2Content = document.createTextNode('Green');

divElement2.className = component['module-green'];
divElement2.appendChild(divElement2Content);

const divElement3 = document.createElement('div');
const divElement3Content = document.createTextNode('Blue');

divElement3.className = component['module-blue'];
divElement3.appendChild(divElement3Content);

const divElement4 = document.createElement('div');

divElement4.className = component['module-background'];

h3Element.appendChild(h3TextNode);
articleElement1.appendChild(h3Element);
articleElement1.appendChild(divElement1);
articleElement1.appendChild(divElement2);
articleElement1.appendChild(divElement3);
articleElement1.appendChild(divElement4);

document.querySelectorAll('section')[0].appendChild(articleElement1);

componentLazy.use();

const articleElement2 = document.createElement('article');
const h3Element2 = document.createElement('h3');
const h3TextNode2 = document.createTextNode('CSS modules');

const divElement5 = document.createElement('div');
const divElement5Content = document.createTextNode('Red');

divElement5.className = componentLazy.locals['module-red'];
divElement5.appendChild(divElement5Content);

const divElement6 = document.createElement('div');
const divElement6Content = document.createTextNode('Green');

divElement6.className = componentLazy.locals['module-green'];
divElement6.appendChild(divElement6Content);

const divElement7 = document.createElement('div');
const divElement7Content = document.createTextNode('Blue');

divElement7.className = componentLazy.locals['module-blue'];
divElement7.appendChild(divElement7Content);

const divElement8 = document.createElement('div');

divElement8.className = componentLazy.locals['module-background'];

h3Element2.appendChild(h3TextNode2);
articleElement2.appendChild(h3Element2);
articleElement2.appendChild(divElement5);
articleElement2.appendChild(divElement6);
articleElement2.appendChild(divElement7);
articleElement2.appendChild(divElement8);

document.querySelectorAll('section')[1].appendChild(articleElement2);

const api = useUnse.use();

setTimeout(() => {
  api.unuse();
}, 6000);
