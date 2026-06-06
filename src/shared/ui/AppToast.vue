<script setup lang="ts">
import { useToast } from '@/shared/composables/useToast'

const { toasts, dismiss } = useToast()

const icons: Record<string, string> = {
  success: 'M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4 12 14.01l-3-3',
  error:   'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01',
  warning: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01',
  info:    'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 16v-4 M12 8h.01',
}
</script>

<template>
  <Teleport to="body">
    <div class="toast-stack" aria-live="polite" aria-atomic="false">
      <TransitionGroup name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="toast"
          :class="`toast--${t.type}`"
          role="alert"
          @click="dismiss(t.id)"
        >
          <svg class="toast__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path :d="icons[t.type]" />
          </svg>
          <span class="toast__msg">{{ t.message }}</span>
          <button class="toast__close" aria-label="Закрыть" @click.stop="dismiss(t.id)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-stack {
  position: fixed;
  bottom: calc(72px + env(safe-area-inset-bottom, 0px));
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 32px);
  max-width: 448px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 9999;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 14px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 500;
  font-family: var(--font-body, sans-serif);
  line-height: 1.4;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  pointer-events: all;
  cursor: pointer;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.toast--success { background: rgba(21, 128, 61, 0.95);  color: #fff; }
.toast--error   { background: rgba(185, 28, 28, 0.95);  color: #fff; }
.toast--warning { background: rgba(161, 98, 7, 0.95);   color: #fff; }
.toast--info    { background: rgba(0, 121, 194, 0.95);  color: #fff; }

.toast__icon { flex-shrink: 0; }

.toast__msg { flex: 1; }

.toast__close {
  flex-shrink: 0;
  opacity: 0.75;
  padding: 2px;
  border-radius: 4px;
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  min-height: 24px;
}
.toast__close:hover { opacity: 1; }

/* Анимация */
.toast-enter-active { animation: toastIn 0.32s cubic-bezier(0.22, 1, 0.36, 1) both; }
.toast-leave-active { animation: toastOut 0.22s ease-in both; }

@keyframes toastIn  { from { opacity: 0; transform: translateY(16px) scale(0.96); } to { opacity: 1; transform: none; } }
@keyframes toastOut { from { opacity: 1; transform: none; } to { opacity: 0; transform: translateY(8px) scale(0.96); } }
</style>
