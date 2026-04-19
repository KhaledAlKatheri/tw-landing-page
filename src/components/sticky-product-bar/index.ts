import { css, html, LitElement } from "lit";
import { property, state } from "lit/decorators.js";
import type { Product } from "./types";

type BarState = "idle" | "loading" | "success" | "error";

export default class StickyProductBar extends LitElement {
  @property({ type: Object }) config?: Record<string, any>;
  @property({ type: Object }) product?: Product;
  @property({ type: Boolean, reflect: true }) ready = false;
  @property({ type: String, reflect: true }) barState: BarState = "idle";
  @property({ type: String }) feedbackMessage: string | null = null;
  @property({ type: Boolean }) isHidden = false;

  @state()
  private countdown = {
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
    expired: false,
  };

  private feedbackTimeout?: ReturnType<typeof setTimeout>;
  private countdownInterval?: ReturnType<typeof setInterval>;

  static styles = css`
    :host {
      display: block;
      --bar-max-width: 720px;
      --bar-radius: 22px;
      --bar-bg: rgba(255, 255, 255, 0.82);
      --bar-border: rgba(255, 255, 255, 0.55);
      --bar-shadow:
        0 18px 40px rgba(15, 23, 42, 0.1),
        0 6px 18px rgba(15, 23, 42, 0.06),
        inset 0 1px 0 rgba(255, 255, 255, 0.35);
      --text-primary: #111827;
      --text-secondary: #16a34a;
      --button-bg: #111827;
      --button-bg-hover: #000000;
      --button-text: #ffffff;
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    .sticky-product-bar-wrapper {
      position: fixed;
      left: 50%;
      bottom: 20px;
      transform: translateX(-50%);
      z-index: 1000;
      width: calc(100% - 24px);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      pointer-events: none;
      perspective: 1200px;
    }

    .countdown-floating {
      width: 100%;
      max-width: var(--bar-max-width);
      display: flex;
      justify-content: center;
      pointer-events: none;
    }

    .countdown {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      border-radius: 999px;
      background:
        linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.08)),
        rgba(17, 24, 39, 0.68);
      border: 1px solid rgba(255, 255, 255, 0.14);
      backdrop-filter: blur(18px) saturate(160%);
      -webkit-backdrop-filter: blur(18px) saturate(160%);
      box-shadow:
        0 14px 30px rgba(15, 23, 42, 0.16),
        0 4px 12px rgba(15, 23, 42, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.12);
      pointer-events: auto;
      overflow: hidden;
    }

    .countdown::before {
      content: "";
      position: absolute;
      inset: 0;
      background:
        radial-gradient(circle at top left, rgba(255, 255, 255, 0.22), transparent 34%);
      pointer-events: none;
    }

    .countdown-item {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      position: relative;
      z-index: 1;
      min-width: 48px;
      padding: 6px 8px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.05);
      text-align: center;
    }

    .countdown-value {
      display: block;
      font-size: 15px;
      font-weight: 800;
      line-height: 1;
      letter-spacing: -0.03em;
      color: #ffffff;
    }

    .countdown-label {
      display: block;
      font-size: 10px;
      font-weight: 500;
      line-height: 1;
      color: rgba(255, 255, 255, 0.7);
    }

    .countdown-divider {
      width: 1px;
      height: 26px;
      background: linear-gradient(
        to bottom,
        transparent,
        rgba(255, 255, 255, 0.22),
        transparent
      );
    }

    .countdown-item--seconds .countdown-value {
      animation: countdown-tick 500ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    @keyframes countdown-tick {
      0% {
        opacity: 0.45;
        transform: translateY(6px) scale(0.94);
        filter: blur(4px);
      }
      60% {
        opacity: 1;
        transform: translateY(-1px) scale(1.03);
        filter: blur(0);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
        filter: blur(0);
      }
    }

    .sticky-product-bar {
      position: relative;
      width: 100%;
      max-width: var(--bar-max-width);
      border-radius: var(--bar-radius);
      border: 1px solid var(--bar-border);
      background: var(--bar-bg);
      box-shadow: var(--bar-shadow);
      backdrop-filter: blur(18px) saturate(160%);
      -webkit-backdrop-filter: blur(18px) saturate(160%);
      overflow: hidden;
      pointer-events: auto;
      opacity: 0;
      transform: translateY(26px) scale(0.96) rotateX(8deg);
      filter: blur(10px);
      transition:
        background 320ms cubic-bezier(0.22, 1, 0.36, 1),
        border-color 320ms cubic-bezier(0.22, 1, 0.36, 1),
        box-shadow 320ms cubic-bezier(0.22, 1, 0.36, 1),
        color 280ms cubic-bezier(0.22, 1, 0.36, 1),
        transform 280ms cubic-bezier(0.22, 1, 0.36, 1),
        opacity 280ms cubic-bezier(0.22, 1, 0.36, 1),
        filter 280ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    :host([ready]) .sticky-product-bar {
      opacity: 1;
      filter: blur(0);
      transform: translateY(0) scale(1) rotateX(0);
      /* animation:
        sticky-bar-enter 700ms cubic-bezier(0.22, 1, 0.36, 1),
        sticky-bar-float 5.5s ease-in-out 800ms infinite; */
    }

    .sticky-product-bar::before {
      content: "";
      position: absolute;
      inset: 0;
      background:
        linear-gradient(135deg, rgba(255, 255, 255, 0.45), rgba(255, 255, 255, 0.08) 42%, rgba(255, 255, 255, 0.18));
      pointer-events: none;
    }

    .sticky-product-bar::after {
      content: "";
      position: absolute;
      top: -120%;
      left: -30%;
      width: 50%;
      height: 300%;
      transform: rotate(18deg);
      background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.28), transparent);
      opacity: 0;
      pointer-events: none;
    }

    .sticky-product-bar:hover {
      transform: translateY(-2px) scale(1.01);
      border-color: rgba(255, 255, 255, 0.85);
    }

    .sticky-product-bar:hover::after {
      opacity: 1;
      animation: sheen-sweep 1200ms ease;
    }

    .sticky-product-bar__inner {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 8px;
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
      border-radius: 16px;
      object-fit: cover;
      flex-shrink: 0;
      transform: translateZ(0) scale(1);
      transition:
        transform 350ms cubic-bezier(0.22, 1, 0.36, 1),
        box-shadow 300ms ease,
        opacity 280ms ease,
        filter 280ms ease;
    }

    .sticky-product-bar__text {
      min-width: 0;
    }

    .sticky-product-bar__title,
    .price-row,
    .state-caption,
    .sticky-product-bar__button {
      transition:
        color 280ms cubic-bezier(0.22, 1, 0.36, 1),
        background 280ms cubic-bezier(0.22, 1, 0.36, 1),
        box-shadow 280ms cubic-bezier(0.22, 1, 0.36, 1),
        opacity 280ms cubic-bezier(0.22, 1, 0.36, 1),
        transform 280ms cubic-bezier(0.22, 1, 0.36, 1),
        filter 280ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    .sticky-product-bar__title {
      margin: 0;
      font-size: 14px;
      font-weight: 700;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .price-tag {
      display: inline-block;
      font-size: 14px;
      font-weight: 700;
      color: var(--text-secondary);
    }

    .discount {
      margin-inline-start: 8px;
      font-size: 13px;
      font-weight: 600;
      color: #9ca3af;
      text-decoration: line-through;
    }

    .sticky-product-bar__actions {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }

    .sticky-product-bar__button {
      font-family: inherit;
      position: relative;
      isolation: isolate;
      overflow: hidden;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      border: 0;
      height: 44px;
      background: var(--button-bg);
      color: var(--button-text);
      padding: 12px 48px;
      border-radius: 14px;
      font-size: 14px;
      font-weight: bold;
      cursor: pointer;
      flex-shrink: 0;
    }

    .sticky-product-bar__button::before {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(
        120deg,
        transparent 20%,
        rgba(255, 255, 255, 0.22) 50%,
        transparent 80%
      );
      transform: translateX(-140%);
      z-index: -1;
    }

    .sticky-product-bar__button:hover {
      background: var(--button-bg-hover);
      transform: translateY(-1px) scale(1.02);
    }

    .sticky-product-bar__button:hover::before {
      animation: button-shimmer 900ms ease;
    }

    .sticky-product-bar__button:active {
      transform: translateY(0) scale(0.985);
    }

    .sticky-product-bar__button:disabled {
      cursor: not-allowed;
      opacity: 1;
    }

    .sticky-product-bar__button.is-out-of-stock {
      background: rgba(107, 114, 128, 0.18);
      color: #6b7280;
      border: 1px solid rgba(107, 114, 128, 0.18);
      box-shadow: none;
    }

    .sticky-product-bar__button.is-out-of-stock:hover,
    .sticky-product-bar__button.is-out-of-stock:active {
      background: rgba(107, 114, 128, 0.18);
      color: #6b7280;
      transform: none;
      box-shadow: none;
    }

    .sticky-product-bar__close {
      width: 42px;
      height: 42px;
      border: 0;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.22);
      color: #111827;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 20px;
      line-height: 1;
      cursor: pointer;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      box-shadow:
        0 6px 14px rgba(15, 23, 42, 0.06),
        inset 0 1px 0 rgba(255, 255, 255, 0.35);
      transition:
        background 180ms ease,
        transform 180ms ease,
        box-shadow 180ms ease;
    }

    .sticky-product-bar__close:hover {
      background: rgba(255, 255, 255, 0.34);
      transform: translateY(-1px);
      box-shadow:
        0 10px 18px rgba(15, 23, 42, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.4);
    }

    .sticky-product-bar__close:active {
      transform: scale(0.96);
    }

    .state-overlay {
      position: absolute;
      inset: 0;
      opacity: 0;
      transition: opacity 320ms ease;
      pointer-events: none;
    }

    .state-shine {
      position: absolute;
      inset: 0;
      overflow: hidden;
      border-radius: inherit;
      pointer-events: none;
    }

    .state-shine::after {
      content: "";
      position: absolute;
      top: -20%;
      left: -35%;
      width: 40%;
      height: 140%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transform: skewX(-18deg) translateX(-160%);
      opacity: 0;
    }

    .sticky-product-bar.loading {
      background:
        linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(0, 0, 0, 0.88)),
        rgba(0, 0, 0, 0.82);
      border-color: rgba(255, 255, 255, 0.12);
      box-shadow:
        0 24px 70px rgba(0, 0, 0, 0.32),
        0 10px 24px rgba(0, 0, 0, 0.18);
    }

    .sticky-product-bar.success {
      background:
        linear-gradient(135deg, rgba(20, 83, 45, 0.96), rgba(22, 163, 74, 0.88)),
        rgba(22, 163, 74, 0.82);
      border-color: rgba(255, 255, 255, 0.14);
      box-shadow:
        0 24px 70px rgba(22, 163, 74, 0.28),
        0 10px 24px rgba(22, 163, 74, 0.14);
    }

    .sticky-product-bar.error {
      background:
        linear-gradient(135deg, rgba(127, 29, 29, 0.96), rgba(220, 38, 38, 0.88)),
        rgba(220, 38, 38, 0.82);
      border-color: rgba(255, 255, 255, 0.14);
      box-shadow:
        0 24px 70px rgba(220, 38, 38, 0.28),
        0 10px 24px rgba(220, 38, 38, 0.14);
    }

    .loading .state-overlay,
    .success .state-overlay,
    .error .state-overlay {
      opacity: 1;
    }

    .loading .state-shine::after,
    .success .state-shine::after,
    .error .state-shine::after {
      opacity: 1;
      animation: bar-sweep 1100ms ease;
    }

    .sticky-product-bar.loading::before {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(
        110deg,
        rgba(255, 255, 255, 0.06) 8%,
        rgba(255, 255, 255, 0.16) 18%,
        rgba(255, 255, 255, 0.06) 33%
      );
      animation: loading-sweep 1.1s linear infinite;
      pointer-events: none;
    }

    .loading .sticky-product-bar__title,
    .loading .state-caption,
    .success .sticky-product-bar__title,
    .success .state-caption,
    .error .sticky-product-bar__title,
    .error .state-caption,
    .loading .price-tag,
    .success .price-tag,
    .error .price-tag,
    .loading .discount,
    .success .discount,
    .error .discount {
      color: #fff;
    }

    .loading .sticky-product-bar__image,
    .success .sticky-product-bar__image,
    .error .sticky-product-bar__image {
      opacity: 0.92;
      transform: scale(0.98);
    }

    .loading .sticky-product-bar__button,
    .success .sticky-product-bar__button,
    .error .sticky-product-bar__button {
      background: rgba(255, 255, 255, 0.14);
      color: #fff;
    }

    .loading .sticky-product-bar__title,
    .success .sticky-product-bar__title,
    .error .sticky-product-bar__title,
    .loading .state-caption,
    .success .state-caption,
    .error .state-caption {
      animation: content-fade-up 320ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    .button-loader {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.28);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    .state-caption {
      font-size: 13px;
      font-weight: 600;
      opacity: 0.92;
    }

    @keyframes sticky-bar-enter {
      0% {
        opacity: 0;
        transform: translateY(30px) scale(0.95) rotateX(10deg);
        filter: blur(12px);
      }
      60% {
        opacity: 1;
        transform: translateY(-3px) scale(1.01) rotateX(0);
        filter: blur(0);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1) rotateX(0);
        filter: blur(0);
      }
    }

    @keyframes sticky-bar-float {
      0%, 100% {
        transform: translateY(0) scale(1);
      }
      50% {
        transform: translateY(-2px) scale(1.002);
      }
    }

    @keyframes sheen-sweep {
      0% {
        transform: translateX(-180%) rotate(18deg);
      }
      100% {
        transform: translateX(280%) rotate(18deg);
      }
    }

    @keyframes button-shimmer {
      0% {
        transform: translateX(-140%);
      }
      100% {
        transform: translateX(140%);
      }
    }

    @keyframes content-fade-up {
      from {
        opacity: 0;
        transform: translateY(6px);
        filter: blur(4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
        filter: blur(0);
      }
    }

    @keyframes loading-sweep {
      from {
        transform: translateX(-120%);
      }
      to {
        transform: translateX(120%);
      }
    }

    @keyframes bar-sweep {
      0% {
        transform: skewX(-18deg) translateX(-160%);
      }
      100% {
        transform: skewX(-18deg) translateX(420%);
      }
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
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

      .price-tag {
        font-size: 13px;
      }

      .sticky-product-bar__button {
        padding: 10px 14px;
        font-size: 13px;
      }
    }

    @media (max-width: 520px) {
      .sticky-product-bar-wrapper {
        bottom: 12px;
        width: calc(100% - 16px);
        gap: 8px;
      }

      .countdown-floating {
        max-width: 100%;
      }

      .countdown {
        width: 100%;
        justify-content: center;
        gap: 6px;
        padding: 8px 10px;
        border-radius: 20px;
      }

      .countdown-item {
        min-width: 40px;
        padding: 6px;
        border-radius: 10px;
      }

      .countdown-value {
        font-size: 13px;
      }

      .countdown-label {
        font-size: 9px;
      }

      .countdown-divider {
        height: 22px;
      }

      .sticky-product-bar {
        max-width: 100%;
        border-radius: 18px;
      }

      .sticky-product-bar__inner {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: center;
        gap: 10px;
        padding: 10px;
      }

      .sticky-product-bar__info {
        min-width: 0;
        gap: 8px;
      }

      .sticky-product-bar__image {
        width: 44px;
        height: 44px;
        border-radius: 12px;
      }

      .sticky-product-bar__title {
        font-size: 13px;
        line-height: 1.25;
      }

      .price-tag,
      .discount,
      .state-caption {
        font-size: 12px;
      }

      .sticky-product-bar__actions {
        gap: 6px;
      }

      .sticky-product-bar__close {
        width: 36px;
        height: 36px;
        border-radius: 12px;
        font-size: 16px;
      }

      .sticky-product-bar__button {
        min-width: auto;
        min-height: 36px;
        padding: 0 12px;
        border-radius: 12px;
        font-size: 12px;
        white-space: nowrap;
      }

      .button-loader {
        width: 14px;
        height: 14px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .sticky-product-bar,
      .sticky-product-bar__image,
      .sticky-product-bar__button,
      .countdown-value {
        animation: none !important;
        transition: none !important;
        transform: none !important;
        filter: none !important;
      }

      .sticky-product-bar::after,
      .sticky-product-bar__button::before {
        display: none;
      }
    }
  `;

  async connectedCallback() {
    super.connectedCallback();

    (window as any).Salla.lang.addBulk({
      "blocks.sticky_product_bar.loading": { ar: "جاري الإضافة...", en: "Adding..." },
      "blocks.sticky_product_bar.adding_product_to_cart": { ar: "جاري إضافة المنتج إلى السلة...", en: "Adding product to cart..." },
      "blocks.sticky_product_bar.product_added_to_cart": { ar: "تم إضافة المنتج إلى السلة", en: "Product added to cart" },
      "blocks.sticky_product_bar.failed_to_add_product_to_cart": { ar: "فشل إضافة المنتج إلى السلة", en: "Failed to add product to cart" },
      "blocks.sticky_product_bar.please_wait": { ar: "الرجاء الانتظار...", en: "Please wait..." },
      "blocks.sticky_product_bar.successfully_completed": { ar: "تم بنجاح", en: "Successfully completed" },
      "blocks.sticky_product_bar.try_again": { ar: "حاول مرة أخرى", en: "Try again" },
      "blocks.sticky_product_bar.added": { ar: "تمت الإضافة", en: "Added" },
      "blocks.sticky_product_bar.out_of_stock": { ar: "نفذت الكمية", en: "Out of stock" },
    });

    const productID = this.config?.product?.[0]?.value;
    if (!productID) {
      console.error('Product card config is not valid, you must provide `config="{...}"`');
      return;
    }

    await (window as any).Salla.onReady();

    this.product = await (window as any).Salla.product
      .getDetails(productID)
      .then((res: { data: Product }) => res.data);

    this.startCountdown();

    requestAnimationFrame(() => {
      this.ready = true;
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    if (this.feedbackTimeout) {
      clearTimeout(this.feedbackTimeout);
    }

    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  private startCountdown() {
    const countdownDate = this.config?.date;
    if (!countdownDate) return;

    const targetDate = new Date(`${countdownDate}T23:59:59`);

    const updateCountdown = () => {
      const now = Date.now();
      const distance = targetDate.getTime() - now;

      if (distance <= 0) {
        this.countdown = {
          days: "00",
          hours: "00",
          minutes: "00",
          seconds: "00",
          expired: true,
        };

        if (this.countdownInterval) {
          clearInterval(this.countdownInterval);
        }
        return;
      }

      this.countdown = {
        days: String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, "0"),
        hours: String(Math.floor((distance / (1000 * 60 * 60)) % 24)).padStart(2, "0"),
        minutes: String(Math.floor((distance / (1000 * 60)) % 60)).padStart(2, "0"),
        seconds: String(Math.floor((distance / 1000) % 60)).padStart(2, "0"),
        expired: false,
      };
    };

    updateCountdown();
    this.countdownInterval = setInterval(updateCountdown, 1000);
  }

  private async handleAddToCart() {
    if (!this.product?.id || this.barState === "loading") return;

    clearTimeout(this.feedbackTimeout);

    this.barState = "loading";
    this.feedbackMessage = (window as any).Salla.lang.get("blocks.sticky_product_bar.adding_product_to_cart");

    try {
      await (window as any).Salla.cart.quickAdd(this.product.id);
      this.barState = "success";
      this.feedbackMessage = (window as any).Salla.lang.get("blocks.sticky_product_bar.product_added_to_cart");
    } catch (error) {
      console.error((window as any).Salla.lang.get("blocks.sticky_product_bar.failed_to_add_product_to_cart"), error);
      this.barState = "error";
      this.feedbackMessage = (window as any).Salla.lang.get("blocks.sticky_product_bar.failed_to_add_product_to_cart");
    }

    this.feedbackTimeout = setTimeout(() => {
      this.barState = "idle";
      this.feedbackMessage = "";
    }, 2400);
  }

  private handleCloseBar() {
    this.isHidden = true;
  }

  render() {
    if (this.isHidden) {
      return html``;
    }

    return html`
      <div class="sticky-product-bar-wrapper">
        ${!this.countdown.expired
          ? html`
              <div class="countdown-floating" aria-label="Countdown">
                <div class="countdown">
                  <div class="countdown-item">
                    <span class="countdown-value">${this.countdown.days}</span>
                    <span class="countdown-label">يوم</span>
                  </div>

                  <div class="countdown-divider"></div>

                  <div class="countdown-item">
                    <span class="countdown-value">${this.countdown.hours}</span>
                    <span class="countdown-label">ساعة</span>
                  </div>

                  <div class="countdown-divider"></div>

                  <div class="countdown-item">
                    <span class="countdown-value">${this.countdown.minutes}</span>
                    <span class="countdown-label">دقيقة</span>
                  </div>

                  <div class="countdown-divider"></div>

                  <div class="countdown-item countdown-item--seconds">
                    <span class="countdown-value">${this.countdown.seconds}</span>
                    <span class="countdown-label">ثانية</span>
                  </div>
                </div>
              </div>
            `
          : ""}

        <div class="sticky-product-bar ${this.barState}">
          <div class="state-overlay"></div>
          <div class="state-shine"></div>

          <div class="sticky-product-bar__inner">
            <div class="sticky-product-bar__info">
              <img
                class="sticky-product-bar__image"
                src="${this.product?.image?.url || ""}"
                alt="${this.product?.image?.alt || ""}"
              />

              <div class="sticky-product-bar__text">
                <h3 class="sticky-product-bar__title">
                  ${this.barState === "idle"
                    ? html`<a href="${this.product?.url || ""}">${this.product?.name}</a>`
                    : this.feedbackMessage}
                </h3>

                <div class="price-row" style="display: flex;">
                  ${this.barState === "idle"
                    ? html`
                        <span class="price-tag">${(window as any).Salla.money(this.product?.price)}</span>
                        ${this.product?.discount
                          ? html`
                              <span class="discount">
                                ${(window as any).Salla.money(this.product?.discount)}
                              </span>
                            `
                          : ""}
                      `
                    : html`
                        <span class="state-caption">
                          ${this.barState === "loading"
                            ? (window as any).Salla.lang.get("blocks.sticky_product_bar.please_wait")
                            : this.barState === "success"
                              ? (window as any).Salla.lang.get("blocks.sticky_product_bar.successfully_completed")
                              : (window as any).Salla.lang.get("blocks.sticky_product_bar.try_again")}
                        </span>
                      `}
                </div>
              </div>
            </div>

            <div class="sticky-product-bar__actions">
              <button
                type="button"
                class="sticky-product-bar__button ${this.product?.is_out_of_stock ? "is-out-of-stock" : ""}"
                ?disabled=${this.barState === "loading" || this.product?.is_out_of_stock}
                @click=${this.handleAddToCart}
              >
                ${this.barState === "loading"
                  ? html`
                      <span class="button-loader"></span>
                      <span>${(window as any).Salla.lang.get("blocks.sticky_product_bar.loading")}</span>
                    `
                  : this.barState === "success"
                    ? html`<span>${(window as any).Salla.lang.get("blocks.sticky_product_bar.added")}</span>`
                    : this.barState === "error"
                      ? html`<span>${(window as any).Salla.lang.get("blocks.sticky_product_bar.try_again")}</span>`
                      : html`${this.product?.is_out_of_stock
                          ? html`<span>${(window as any).Salla.lang.get("blocks.sticky_product_bar.out_of_stock")}</span>`
                          : (window as any).Salla.lang.get("pages.cart.add_to_cart")}`}
              </button>

              <button
                type="button"
                class="sticky-product-bar__close"
                @click=${this.handleCloseBar}
                aria-label="إغلاق"
              >
                <span>&times;</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
