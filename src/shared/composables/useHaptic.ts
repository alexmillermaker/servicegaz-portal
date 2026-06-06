const can = typeof navigator !== 'undefined' && 'vibrate' in navigator

export function useHaptic() {
  return {
    tap:     () => can && navigator.vibrate(6),
    light:   () => can && navigator.vibrate(10),
    success: () => can && navigator.vibrate([8, 40, 8]),
    error:   () => can && navigator.vibrate([25, 50, 25]),
    heavy:   () => can && navigator.vibrate(35),
  }
}
