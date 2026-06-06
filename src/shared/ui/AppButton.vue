<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
}>()
</script>

<template>
  <button
    :class="[
      'app-btn',
      `app-btn--${variant ?? 'primary'}`,
      `app-btn--${size ?? 'md'}`,
      { 'app-btn--full': fullWidth, 'app-btn--loading': loading }
    ]"
    :disabled="disabled || loading"
  >
    <span v-if="loading" class="app-btn__spinner" aria-hidden="true" />
    <slot />
  </button>
</template>

<style scoped>
.app-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--gap-sm);
  font-family: var(--font-body);
  font-weight: 600;
  border-radius: var(--r-md);
  min-height: var(--touch-target);
  padding: 0 var(--gap-lg);
  transition: all var(--dur-fast) var(--ease-out);
  user-select: none;
  position: relative;
  overflow: hidden;
  letter-spacing: 0.02em;
}

.app-btn--full { width: 100%; }

/* ── Размеры ─────────────────────────────── */
.app-btn--sm { font-size: var(--fs-sm); min-height: 36px; padding: 0 var(--gap-md); border-radius: var(--r-sm); }
.app-btn--md { font-size: var(--fs-base); }
.app-btn--lg { font-size: var(--fs-md); min-height: 56px; padding: 0 var(--gap-xl); border-radius: var(--r-lg); }

/* ── Варианты ───────────────────────────── */
.app-btn--primary {
  background: var(--c-accent);
  color: #fff;
  box-shadow: 0 2px 8px var(--c-accent-glow);
}
.app-btn--primary:hover:not(:disabled) {
  background: #0069aa;
  box-shadow: var(--shadow-accent);
  transform: translateY(-1px);
}

.app-btn--secondary {
  background: var(--c-surface-2);
  color: var(--c-text);
  border: 1px solid var(--c-border);
}
.app-btn--secondary:hover:not(:disabled) {
  background: var(--c-bg-3);
  border-color: var(--c-border-2);
}

.app-btn--ghost {
  background: transparent;
  color: var(--c-accent);
  border: 1px solid var(--c-accent);
}
.app-btn--ghost:hover:not(:disabled) {
  background: var(--c-accent-dim);
}

.app-btn--danger {
  background: var(--c-danger-dim);
  color: var(--c-danger);
  border: 1px solid var(--c-danger);
}
.app-btn--danger:hover:not(:disabled) {
  background: var(--c-danger);
  color: #fff;
}

/* ── Состояния ──────────────────────────── */
.app-btn:disabled {
  opacity: 0.38;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}
.app-btn:active:not(:disabled) { transform: translateY(0) scale(0.98); }

/* ── Спиннер ────────────────────────────── */
.app-btn__spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
