<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const offline = ref(!navigator.onLine)

function onOnline()  { offline.value = false }
function onOffline() { offline.value = true  }

onMounted(() => {
  window.addEventListener('online',  onOnline)
  window.addEventListener('offline', onOffline)
})
onUnmounted(() => {
  window.removeEventListener('online',  onOnline)
  window.removeEventListener('offline', onOffline)
})
</script>

<template>
  <Transition name="banner">
    <div v-if="offline" class="offline-banner" role="status" aria-live="assertive">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <line x1="1" y1="1" x2="23" y2="23"/>
        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/>
        <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/>
        <path d="M10.71 5.05A16 16 0 0 1 22.56 9"/>
        <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/>
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
        <line x1="12" y1="20" x2="12.01" y2="20"/>
      </svg>
      Нет соединения с сетью
    </div>
  </Transition>
</template>

<style scoped>
.offline-banner {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  background: #1f2937;
  color: #f9fafb;
  font-size: 13px;
  font-weight: 600;
  font-family: var(--font-body, sans-serif);
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  z-index: 10000;
  padding-top: calc(10px + env(safe-area-inset-top, 0px));
}

.banner-enter-active { animation: slideDown 0.3s cubic-bezier(0.22, 1, 0.36, 1) both; }
.banner-leave-active { animation: slideDown 0.25s ease-in reverse both; }
@keyframes slideDown { from { transform: translateX(-50%) translateY(-100%); } to { transform: translateX(-50%) translateY(0); } }
</style>
