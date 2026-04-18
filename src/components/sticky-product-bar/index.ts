import { css, html, LitElement } from "lit";
import { property } from "lit/decorators.js";

export default class StickyProductBar extends LitElement {
  @property({ type: Object })
  config?: Record<string, any>;

  static styles = css`
    :host {
      display: block;
    }
    .sticky-product-bar {
  position: sticky;
  bottom: 0;
  z-index: 1000;
  width: 100%;
  background: #ffffff;
  border-top: 1px solid #e5e7eb;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
}

.sticky-product-bar__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.sticky-product-bar__info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.sticky-product-bar__image {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
}

.sticky-product-bar__text {
  min-width: 0;
}

.sticky-product-bar__title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sticky-product-bar__price {
  margin: 4px 0 0;
  font-size: 15px;
  font-weight: 600;
  color: #16a34a;
}

.sticky-product-bar__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.sticky-product-bar__button {
  border: 0;
  background: #111827;
  color: #ffffff;
  padding: 12px 18px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease;
}

.sticky-product-bar__button:hover {
  background: #000000;
}

@media (max-width: 768px) {
  .sticky-product-bar__inner {
    padding: 10px 12px;
    gap: 10px;
  }

  .sticky-product-bar__image {
    width: 52px;
    height: 52px;
  }

  .sticky-product-bar__title {
    font-size: 14px;
  }

  .sticky-product-bar__price {
    font-size: 14px;
  }

  .sticky-product-bar__button {
    padding: 10px 14px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .sticky-product-bar__inner {
    flex-direction: column;
    align-items: stretch;
  }

  .sticky-product-bar__info {
    width: 100%;
  }

  .sticky-product-bar__actions {
    width: 100%;
  }

  .sticky-product-bar__button {
    width: 100%;
  }
}

  `;

  render() {
    return html`
      <div class="sticky-product-bar">
        <div class="sticky-product-bar__inner">
          <div class="sticky-product-bar__info">
            <img class="sticky-product-bar__image" />
            <div class="sticky-product-bar__text">
              <h3 class="sticky-product-bar__title"></h3>
              <p class="sticky-product-bar__price"></p>
            </div>
          </div>

          <div class="sticky-product-bar__actions">
            <button class="sticky-product-bar__button">أضف إلى السلة</button>
          </div>
        </div>
      </div>
    `;
  }
}
