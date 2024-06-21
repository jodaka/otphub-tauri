import { TOTP, Secret } from "./otpauth.esm.js";
import { adjustHue } from "./color.utils.js";
const TOKEN_GRADIENT_START = "#7B8ACE";
const TOKEN_GRADIENT_END = "#515DB0";
const HUE_STEP = 45;

class Token {
  token;
  config;
  remaining;

  constructor(config, index) {
    this.config = config;
    this.index = index;
    this.totp = new TOTP(config);
  }

  updateToken() {
    this.token = this.totp.generate();
    this.remaining = this.totp.period - (Math.floor(Date.now() / 1000) % this.totp.period);
  }

  renderToken() {
    return `${this.token.slice(0, 3)}<span class="token__spacer"></span>${this.token.slice(3)}`;
  }

  updateCounter() {
    if (!this.counterRef) {
      this.counterRef = document.querySelector(`#${this.config.id} .token__remaining`);
      this.counterValueRef = document.querySelector(`#${this.config.id} .token__remaining-value`);
      this.tokenValueRef = document.querySelector(`#${this.config.id} .token__value`);
    }

    const remaining = this.totp.period - ((Date.now() / 1000) % this.totp.period);
    this.remaining = Math.floor(remaining);

    this.counterRef.style = `--value: ${this.totp.period - remaining};`;
    this.counterValueRef.innerText = this.remaining;

    // schedule token rerender
    if (this.remaining <= 0) {
      setTimeout(() => {
        this.token = this.totp.generate();
        this.tokenValueRef.innerHTML = this.renderToken();
      }, 200);
    }
  }

  render() {
    const hueOffset = this.index * HUE_STEP;
    const bgGradientStartColor = adjustHue(TOKEN_GRADIENT_START, hueOffset);
    const bgGradientEndColor = adjustHue(TOKEN_GRADIENT_END, hueOffset);

    const style = `--period: ${this.totp.period}; --text-shadow: ${bgGradientEndColor}; --bg-gradient-start: ${bgGradientStartColor}; --bg-gradient-end: ${bgGradientEndColor}`;

    return `
    <div class="token" id="${this.config.id}" index="${this.index}"
    style="${style}">
      <div class="token__header">
        <div class="token__label">${this.config.label}</div>
        <div class="token__issuer">${this.config.issuer || "&nbsp;"}</div>
      </div>
      <div class="token__value">${this.renderToken()}</div>
      <div class="token__remaining" style="--value: ${this.totp.period - this.remaining};">
        <div class="token__remaining-value">${this.remaining}</div>
      </div>
    </div>`;
  }
}

export const Tokens = (wrapper, tokens = []) => {
  const tokensWithId = tokens.map((origToken) => ({
    ...origToken,
    id: "id" + new Secret({ size: 10 }).hex,
  }));

  const tokenInstances = tokensWithId.map((config, index) => new Token(config, index));

  // initial full render
  const html = tokenInstances.reduce((acc, instance) => {
    instance.updateToken();
    acc += instance.render();
    return acc;
  }, "");

  wrapper.innerHTML = `<div class="tokens">${html}</div>`;

  wrapper.addEventListener("click", (e) => {
    const tokenWrapper = e.target.closest(".token");
    if (tokenWrapper) {
      const index = tokenWrapper.getAttribute("index");
      const token = tokenInstances[index];

      window.__TAURI__.clipboard
        .writeText(token.token)
        .then(() =>
          window.__TAURI__.notification.sendNotification({
            title: token.totp.label,
            body: "Copied!",
          }),
        )
        .catch((err) => console.error(err));
    }
  });

  // rerender only counter 5 times per second
  setInterval(() => {
    tokenInstances.forEach((instance) => {
      instance.updateCounter();
    });
  }, 200);
};
