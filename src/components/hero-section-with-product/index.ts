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

    .hero-section-with-product {
      position: relative;
    }

    .hero-section-with-product-content {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 2;
    }

    .hero-section-with-product-content .product-section {
      display: flex;
      width: 100%;
      height: 100%;
      align-items: end;
      padding: 24px
    }
      

    .hero-section-with-product-background {
      width: 100%;
      height: 100vh;
    }

    .hero-section-with-product-background img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  `;

  render() {
    return html`
      <div class="hero-section-with-product">
        <div class="hero-section-with-product-content">
          <div class="product-section">
            <h1>Product Content</h1>
          </div>
          
        </div>
        <div class="hero-section-with-product-background">
          <img width="100%" height="100%" src="https://images.pexels.com/photos/10080487/pexels-photo-10080487.jpeg" alt="" />
        </div>
      </div>
    `;
  }
}
