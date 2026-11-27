if (!customElements.get('mug-personalization-preview')) {
  class MugPersonalizationPreview extends HTMLElement {
    connectedCallback() {
      const productPage = this.closest('product-info');
      const name = productPage?.querySelector('[data-personalization-name]');
      const font = productPage?.querySelector('[data-personalization-font]');
      const letters = productPage?.querySelector('[data-personalization-letters]');
      if (!name || !font || !letters) return;

      const print = this.querySelector('.personalization-poc__print-area');
      const text = this.querySelector('[data-personalization-preview]');
      const monogram = this.querySelector('[data-personalization-monogram]');
      const status = this.querySelector('[data-personalization-announcement]');
      const controller = new AbortController();
      const options = { signal: controller.signal };
      this.controller = controller;

      const fitText = () => {
        const scale = text.offsetWidth ? Math.min(1, print.clientWidth / text.offsetWidth) : 1;
        text.style.transform = `scale(${scale})`;
      };

      const update = () => {
        const value = name.value.trim();
        const validName = /\p{L}/u.test(value) && /^[\p{L}\p{M} .'’\-]+$/u.test(value);
        name.setCustomValidity(!value
          ? 'Enter the name you want printed on the mug.'
          : validName && value.length <= name.maxLength
            ? ''
            : 'Enter up to 30 characters using letters, spaces, apostrophes, hyphens or full stops.');

        const letter = letters.querySelector('input:checked').value;
        this.dataset.letter = letter;
        monogram.textContent = letter;
        text.textContent = value;
        this.dataset.font = font.value;
        fitText();

        clearTimeout(this.announcement);
        this.announcement = setTimeout(() => {
          status.textContent = value
            ? `Mug preview: letter ${letter}, ${value} in ${font.value} font.`
            : `Mug preview: letter ${letter}, no name entered.`;
        }, 400);
      };

      name.addEventListener('input', update, options);
      font.addEventListener('change', update, options);
      letters.addEventListener('change', update, options);
      name.form?.addEventListener('submit', (event) => {
        update();
        if (!name.reportValidity()) {
          event.preventDefault();
          event.stopImmediatePropagation();
          return;
        }
        name.value = name.value.trim();
      }, { ...options, capture: true });

      this.resizeObserver = new ResizeObserver(fitText);
      this.resizeObserver.observe(print);
      update();
    }

    disconnectedCallback() {
      this.controller?.abort();
      this.resizeObserver?.disconnect();
      clearTimeout(this.announcement);
    }
  }

  customElements.define('mug-personalization-preview', MugPersonalizationPreview);
}
