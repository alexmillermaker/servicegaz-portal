<template>
  <div class="empty-state" role="status" :aria-label="title">
    <div class="empty-state__icon">
      <slot name="icon">
        <svg v-if="type === 'search'" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          <line x1="8" y1="11" x2="14" y2="11" stroke-width="1.8"/>
        </svg>
        <svg v-else-if="type === 'docs'" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13" stroke-width="1.5"/><line x1="16" y1="17" x2="8" y2="17" stroke-width="1.5"/>
        </svg>
        <svg v-else-if="type === 'news'" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round">
          <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2z"/>
          <line x1="16" y1="8" x2="8" y2="8" stroke-width="1.5"/><line x1="16" y1="12" x2="8" y2="12" stroke-width="1.5"/><line x1="11" y1="16" x2="8" y2="16" stroke-width="1.5"/>
        </svg>
        <svg v-else width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12" stroke-width="1.5"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="1.5"/>
        </svg>
      </slot>
    </div>
    <p class="empty-state__title">{{ title }}</p>
    <p v-if="subtitle" class="empty-state__sub">{{ subtitle }}</p>
    <slot name="action" />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  type?: 'search' | 'docs' | 'news' | 'generic'
  title: string
  subtitle?: string
}>()
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--gap-sm);
  padding: var(--gap-xl) var(--gap-lg);
  text-align: center;
}

.empty-state__icon {
  width: 80px;
  height: 80px;
  background: var(--c-bg-2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-text-3);
  margin-bottom: var(--gap-sm);
}

.empty-state__title {
  font-size: var(--fs-base);
  font-weight: 600;
  color: var(--c-text);
}

.empty-state__sub {
  font-size: var(--fs-sm);
  color: var(--c-text-3);
  line-height: 1.5;
  max-width: 220px;
}
</style>
