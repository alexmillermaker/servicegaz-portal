import { ref, computed } from 'vue'

export function useSwipeDismiss(onDismiss: () => void, threshold = 110) {
  const dragY = ref(0)
  let startY = 0
  let active = false

  function onTouchStart(e: TouchEvent) {
    startY = e.touches[0].clientY
    active = true
  }

  function onTouchMove(e: TouchEvent) {
    if (!active) return
    const dy = e.touches[0].clientY - startY
    dragY.value = Math.max(0, dy * 0.6)
  }

  function onTouchEnd() {
    if (!active) return
    active = false
    if (dragY.value >= threshold) {
      dragY.value = 0
      onDismiss()
    } else {
      dragY.value = 0
    }
  }

  const sheetStyle = computed(() => ({
    transform:  dragY.value > 0 ? `translateY(${dragY.value}px)` : '',
    transition: dragY.value > 0 ? 'none' : 'transform 0.32s cubic-bezier(0.22, 1, 0.36, 1)',
  }))

  return { dragY, sheetStyle, onTouchStart, onTouchMove, onTouchEnd }
}
