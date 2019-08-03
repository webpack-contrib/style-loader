/* eslint-env browser */

import './style.css';
import './other-style.scss';
import styles from './component.module.css';
import styleLazy from './style.lazy.css';
import otherStyleLazy from './other-style.lazy.scss';
import './style.link.css';
import './custom-square';

styleLazy.use();
otherStyleLazy.use();

const articleElement = document.createElement('article');
const h3Element = document.createElement('h3');
const h3TextNode = document.createTextNode('CSS modules');

const divElement1 = document.createElement('div');
const divElement1Content = document.createTextNode('Red');

divElement1.className = styles['module-red'];
divElement1.appendChild(divElement1Content);

const divElement2 = document.createElement('div');
const divElement2Content = document.createTextNode('Green');

divElement2.className = styles['module-green'];
divElement2.appendChild(divElement2Content);

const divElement3 = document.createElement('div');
const divElement3Content = document.createTextNode('Blue');

divElement3.className = styles['module-blue'];
divElement3.appendChild(divElement3Content);

const divElement4 = document.createElement('div');

divElement4.className = styles['module-background'];

h3Element.appendChild(h3TextNode);
articleElement.appendChild(h3Element);
articleElement.appendChild(divElement1);
articleElement.appendChild(divElement2);
articleElement.appendChild(divElement3);
articleElement.appendChild(divElement4);

document.querySelectorAll('section')[0].appendChild(articleElement);
