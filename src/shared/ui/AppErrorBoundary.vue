<template>
  <slot v-if="!error" />
  <div v-else class="error-boundary" role="alert">
    <div class="error-boundary__icon">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13" stroke-width="2"/><line x1="12" y1="17" x2="12.01" y2="17" stroke-width="2"/>
      </svg>
    </div>
    <p class="error-boundary__title">Что-то пошло не так</p>
    <p class="error-boundary__msg">{{ errorMessage }}</p>
    <button class="error-boundary__retry" @click="retry">Попробовать снова</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

const error = ref(false)
const errorMessage = ref('Произошла непредвиденная ошибка.')

onErrorCaptured((err) => {
  error.value = true
  errorMessage.value = err instanceof Error ? err.message : 'Произошла непредвиденная ошибка.'
  return false
})

function retry() {
  error.value = false
  errorMessage.value = ''
}
</script>

<style scoped>
.error-boundary {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--gap-md);
  padding: var(--gap-xl) var(--gap-lg);
  text-align: center;
  min-height: 280px;
}

.error-boundary__icon {
  width: 72px;
  height: 72px;
  background: #fff7ed;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c2410c;
}

.error-boundary__title {
  font-size: var(--fs-base);
  font-weight: 700;
  color: var(--c-text);
}

.error-boundary__msg {
  font-size: var(--fs-sm);
  color: var(--c-text-3);
  max-width: 240px;
  line-height: 1.5;
}

.error-boundary__retry {
  padding: 10px 24px;
  background: var(--c-accent);
  color: #fff;
  font-size: var(--fs-sm);
  font-weight: 600;
  border-radius: var(--r-lg);
  cursor: pointer;
  border: none;
  font-family: var(--font-body);
  min-height: var(--touch-min);
  transition: background var(--dur-fast);
}
.error-boundary__retry:active { background: #0069aa; }
</style>
