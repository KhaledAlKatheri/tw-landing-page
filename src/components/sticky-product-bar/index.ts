import { css, html, LitElement } from "lit";
import { property } from "lit/decorators.js";
import type { Product } from "./types";

export default class StickyProductBar extends LitElement {
  @property({ type: Object })
  config?: Record<string, any>;
  @property({ type: Object }) product?: Product;

  static styles = css`
    :host {
      display: block;
    }

    .sticky-product-bar-wrapper {
      position: fixed;
      left: 50%;
      bottom: 20px;
      transform: translateX(-50%);
      z-index: 1000;
      width: calc(100% - 24px);
      display: flex;
      justify-content: center;
      pointer-events: none;
    }

    .sticky-product-bar {
      width: 100%;
      max-width: 720px;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 20px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
      pointer-events: auto;
    }

    .sticky-product-bar__inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 14px 18px;
    }

    .sticky-product-bar__info {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
      flex: 1;
    }

    .sticky-product-bar__image {
      width: 58px;
      height: 58px;
      border-radius: 14px;
      object-fit: cover;
      flex-shrink: 0;
    }

    .sticky-product-bar__text {
      min-width: 0;
    }

    .sticky-product-bar__title {
      margin: 0;
      font-size: 15px;
      font-weight: 700;
      color: #111827;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .sticky-product-bar__price {
      margin: 4px 0 0;
      font-size: 14px;
      font-weight: 600;
      color: #16a34a;
    }

    .sticky-product-bar__button {
      border: 0;
      background: #111827;
      color: #fff;
      padding: 12px 18px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      flex-shrink: 0;
    }

    @media (max-width: 768px) {
      .sticky-product-bar {
        max-width: 100%;
      }

      .sticky-product-bar__inner {
        padding: 12px;
        gap: 12px;
      }

      .sticky-product-bar__image {
        width: 50px;
        height: 50px;
      }

      .sticky-product-bar__title {
        font-size: 14px;
      }

      .sticky-product-bar__price {
        font-size: 13px;
      }

      .sticky-product-bar__button {
        padding: 10px 14px;
        font-size: 13px;
      }
    }

    @media (max-width: 520px) {
      .sticky-product-bar {
        max-width: 420px;
      }

      .sticky-product-bar__inner {
        flex-direction: column;
        align-items: stretch;
      }

      .sticky-product-bar__button {
        width: 100%;
      }
    }
  `;

  async connectedCallback() {
      super.connectedCallback();
      const productID = this.config?.product?.[0]?.value;
      if(!productID){
        console.error('Product card config is not valid, you must provide `config="{...}"!');
        return;
      }
      await (window as any).Salla.onReady();
      this.product = await (window as any).Salla.product.api.getDetails(productID)
      .then((res:{data:Product}) => res.data);
    }
  
    private handleAddToCart() {
      (window as any).Salla.log("Adding to cart:", {product: this.product});
  
      // Show a simple notification
      (window as any).Salla.success(`Added ${this.product?.name} to cart!`);
    }

  render() {
    return html`
      <div class="sticky-product-bar-wrapper">
        <div class="sticky-product-bar">
          <div class="sticky-product-bar__inner">
            <div class="sticky-product-bar__info">
              <img class="sticky-product-bar__image" src="${this.product?.image?.url || ''}" alt="${this.product?.image?.alt || ''}" />
              <div class="sticky-product-bar__text">
                <h3 class="sticky-product-bar__title">${this.product?.name}</h3>
                <div>
                  <span class="price-tag">${(window as any).Salla.money(this.product?.price)}</span>
                  ${this.product?.discount
                    ? html`<span class="discount">${(window as any).Salla.money(this.product?.discount)}</span>`
                    : ""}
                </div>
              </div>
            </div>

            <button class="sticky-product-bar__button" @click="${this.handleAddToCart}">
              <span>${ (window as any).Salla.lang.get('pages.cart.add_to_cart')}</span>  
            </button>
          </div>
        </div>
      </div>
    `;
  }
}
