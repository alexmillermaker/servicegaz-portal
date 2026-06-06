<script setup lang="ts">
defineProps<{
  variant?: 'default' | 'elevated' | 'accent' | 'danger'
  padding?: 'sm' | 'md' | 'lg'
}>()
</script>

<template>
  <div :class="['app-card', `app-card--${variant ?? 'default'}`, `app-card--pad-${padding ?? 'md'}`]">
    <slot />
  </div>
</template>

<style scoped>
.app-card {
  border-radius: var(--r-lg);
  border: 1px solid var(--c-border);
  transition: border-color var(--dur-fast);
}

.app-card--pad-sm  { padding: var(--gap-sm); }
.app-card--pad-md  { padding: var(--gap-md); }
.app-card--pad-lg  { padding: var(--gap-lg); }

.app-card--default  { background: var(--c-surface); }
.app-card--elevated { background: var(--c-surface-2); box-shadow: var(--shadow-md); }
.app-card--accent   { background: var(--c-accent-dim); border-color: var(--c-accent); }
.app-card--danger   { background: var(--c-danger-dim); border-color: var(--c-danger); }
</style>
