import { ref, readonly } from 'vue'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: number
  message: string
  type: ToastType
}

const toasts = ref<Toast[]>([])
let _id = 0

export function useToast() {
  function show(message: string, type: ToastType = 'info', duration = 3200) {
    const id = ++_id
    toasts.value.push({ id, message, type })
    setTimeout(() => dismiss(id), duration)
  }

  function dismiss(id: number) {
    const i = toasts.value.findIndex(t => t.id === id)
    if (i !== -1) toasts.value.splice(i, 1)
  }

  return {
    toasts: readonly(toasts),
    dismiss,
    success: (msg: string, dur?: number) => show(msg, 'success', dur),
    error:   (msg: string, dur?: number) => show(msg, 'error',   dur),
    info:    (msg: string, dur?: number) => show(msg, 'info',    dur),
    warning: (msg: string, dur?: number) => show(msg, 'warning', dur),
  }
}
