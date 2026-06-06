import { onUnmounted } from 'vue'

const SEL = 'a[href],button:not([disabled]),input:not([disabled]),select,[tabindex]:not([tabindex="-1"])'

export function useFocusTrap() {
  let el: HTMLElement | null = null
  let prevFocus: HTMLElement | null = null

  function activate(container: HTMLElement) {
    el = container
    prevFocus = document.activeElement as HTMLElement
    const first = container.querySelectorAll<HTMLElement>(SEL)[0]
    first?.focus()
    container.addEventListener('keydown', trap)
  }

  function deactivate() {
    el?.removeEventListener('keydown', trap)
    el = null
    prevFocus?.focus()
  }

  function trap(e: KeyboardEvent) {
    if (!el) return
    const nodes = Array.from(el.querySelectorAll<HTMLElement>(SEL))
    if (!nodes.length) return
    const first = nodes[0]
    const last  = nodes[nodes.length - 1]

    if (e.key === 'Escape') { deactivate(); return }
    if (e.key !== 'Tab') return

    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus() }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus() }
    }
  }

  onUnmounted(deactivate)
  return { activate, deactivate }
}
