/* eslint-env browser */

import './style.css';
import './other-style.scss';
import styleLazy from './style.lazy.css';
import otherStyleLazy from './other-style.lazy.scss';
import './style.link.css';
import './custom-square';

styleLazy.use();
otherStyleLazy.use();
