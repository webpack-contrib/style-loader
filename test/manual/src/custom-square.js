/* eslint-env browser */
/* eslint-disable */

// import customSquareStyles from './custom-square.lazy.css';

class CustomSquare extends HTMLElement {
  // Specify observed attributes so that
  // attributeChangedCallback will work
  static get observedAttributes() {
    return ['l'];
  }

  constructor() {
    // Always call super first in constructor
    super();

    this.attachShadow({ mode: 'open' });
  }
  connectedCallback() {
    const div = document.createElement('div');

    this.shadowRoot.appendChild(div);

    const bgPurple = new CSSStyleSheet();

    bgPurple.replace(`div { 
    background: purple; 
    width: ${this.getAttribute('l')}px;
    height: ${this.getAttribute('l')}px;
}`);

    this.shadowRoot.adoptedStyleSheets = [bgPurple];
  }
}

customElements.define('custom-square', CustomSquare);

export default CustomSquare;
