import { css, html, LitElement } from "lit";
import { property } from "lit/decorators.js";

export default class HeroSectionWithProduct extends LitElement {
  @property({ type: Object })
  config?: Record<string, any>;

  static styles = css`
    :host {
      display: block;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
  `;

  render() {
    return html`
      <div class="hero-section-with-product">
        <div class="hero-section-with-product-content"></div>
        <div class="hero-section-with-product-image">
          <img src="https://images.pexels.com/photos/10080487/pexels-photo-10080487.jpeg" alt="" />
        </div>
      </div>
    `;
  }
}
