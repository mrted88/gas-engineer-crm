import type { DirectiveBinding } from 'vue'

interface ExtendedHTMLElement extends HTMLElement {
  _clickOutside?: (event: Event) => void
}

export const vClickOutside = {
  mounted(el: ExtendedHTMLElement, binding: DirectiveBinding) {
    el._clickOutside = (event: Event) => {
      // Check if the click was outside the element
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value(event)
      }
    }
    document.addEventListener('click', el._clickOutside)
  },
  unmounted(el: ExtendedHTMLElement) {
    if (el._clickOutside) {
      document.removeEventListener('click', el._clickOutside)
    }
  }
}

// Add type declaration for TypeScript
declare module '@vue/runtime-core' {
  interface HTMLElement {
    _clickOutside?: (event: Event) => void
  }
}