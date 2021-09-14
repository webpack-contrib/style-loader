/* eslint-env browser */
/* eslint-disable */

import customSquareStyles from "./custom-square.custom.css";

class CustomSquare extends HTMLElement {
  // Specify observed attributes so that
  // attributeChangedCallback will work
  static get observedAttributes() {
    return ["w", "h"];
  }

  constructor() {
    // Always call super first in constructor
    super();

    this.attachShadow({ mode: "open" });
    const divElement = document.createElement("div");

    divElement.textContent = "Text content.";

    this.shadowRoot.appendChild(divElement);

    customSquareStyles.use({ target: this.shadowRoot });

    const bgPurple = new CSSStyleSheet();
    const width = this.getAttribute("w");
    const height = this.getAttribute("h");

    bgPurple.replace(`div { width: ${width}px; height: ${height}px; }`);

    this.shadowRoot.adoptedStyleSheets = [bgPurple];
  }
}

customElements.define("custom-square", CustomSquare);

export default CustomSquare;
