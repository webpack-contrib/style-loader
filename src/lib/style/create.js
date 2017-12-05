/* eslint-disable */
import attrs from '../utils/attrs';
import insertStyle from './insert';

export default function createStyle(options, styles) {
  const style = document.createElement('style');

  options.attrs.type = 'text/css';

  attrs(style, options.attrs);
  insertStyle(options, style, styles);

  return style;
}
