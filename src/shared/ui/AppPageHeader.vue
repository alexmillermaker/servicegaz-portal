<template>
  <header class="page-header">
    <AppLogo :subtitle="subtitle" />
    <button
      v-if="bell"
      class="page-header__bell"
      :aria-label="badgeCount ? `Уведомления (${badgeCount})` : 'Уведомления'"
      @click="$emit('bell-click')"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      <span v-if="badgeCount" class="page-header__badge" aria-hidden="true">
        {{ badgeCount > 9 ? '9+' : badgeCount }}
      </span>
    </button>
  </header>
</template>

<script setup lang="ts">
import AppLogo from './AppLogo.vue'
defineProps<{ subtitle?: string; bell?: boolean; badgeCount?: number }>()
defineEmits<{ 'bell-click': [] }>()
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--gap-md);
  height: var(--header-height);
  background: var(--c-surface);
  border-bottom: 1px solid var(--c-border);
  position: sticky;
  top: 0;
  z-index: 50;
  will-change: transform;
  flex-shrink: 0;
}

.page-header__bell {
  position: relative;
  min-width: var(--touch-min);
  min-height: var(--touch-min);
  border-radius: 50%;
  background: var(--c-surface-2);
  border: 1px solid var(--c-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-text-2);
  cursor: pointer;
  flex-shrink: 0;
  transition: background var(--dur-fast), transform var(--dur-fast);
}
.page-header__bell:hover  { background: var(--c-bg-2); }
.page-header__bell:active { transform: scale(0.9); background: var(--c-bg-3); }

.page-header__badge {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 16px;
  height: 16px;
  background: #ef4444;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  border-radius: var(--r-full);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
  border: 2px solid var(--c-surface);
  line-height: 1;
  animation: badge-pop 0.3s var(--ease-out) both;
}

@keyframes badge-pop {
  from { transform: scale(0); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}
</style>
