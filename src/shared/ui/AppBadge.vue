<script setup lang="ts">
defineProps<{
  variant?: 'default' | 'accent' | 'success' | 'danger' | 'warn'
}>()
</script>

<template>
  <span :class="['app-badge', `app-badge--${variant ?? 'default'}`]">
    <slot />
  </span>
</template>

<style scoped>
.app-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: var(--r-full);
  font-size: var(--fs-xs);
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.app-badge--default { background: var(--c-surface-2); color: var(--c-text-2); }
.app-badge--accent  { background: var(--c-accent-dim); color: var(--c-accent); }
.app-badge--success { background: var(--c-success-dim); color: var(--c-success); }
.app-badge--danger  { background: var(--c-danger-dim); color: var(--c-danger); }
.app-badge--warn    { background: var(--c-warn-dim); color: var(--c-warn); }
</style>
