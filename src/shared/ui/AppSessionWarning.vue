<template>
  <Teleport to="body">
    <Transition name="session-warn">
      <div v-if="visible" class="session-warn-overlay" role="alertdialog" aria-modal="true" aria-label="Сессия истекает">
        <div class="session-warn">
          <div class="session-warn__icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <h2 class="session-warn__title">Сессия истекает</h2>
          <p class="session-warn__text">
            Сессия будет завершена через
            <strong class="session-warn__countdown">{{ countdown }}с</strong>.
            Продолжить работу?
          </p>
          <div class="session-warn__actions">
            <button class="session-warn__btn session-warn__btn--logout" @click="logout">Выйти</button>
            <button class="session-warn__btn session-warn__btn--stay" @click="extend">Продолжить</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const IDLE_TIMEOUT = 25 * 60 * 1000  // 25 min inactivity → show warning
const WARN_DURATION = 60              // 60s countdown

const router = useRouter()
const auth = useAuthStore()

const visible = ref(false)
const countdown = ref(WARN_DURATION)

let idleTimer: ReturnType<typeof setTimeout> | null = null
let countdownTimer: ReturnType<typeof setInterval> | null = null

function resetIdle() {
  if (idleTimer) clearTimeout(idleTimer)
  if (visible.value) return
  idleTimer = setTimeout(showWarning, IDLE_TIMEOUT)
}

function showWarning() {
  if (!auth.isAuthenticated) return
  visible.value = true
  countdown.value = WARN_DURATION
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) logout()
  }, 1000)
}

function extend() {
  visible.value = false
  if (countdownTimer) clearInterval(countdownTimer)
  resetIdle()
}

function logout() {
  visible.value = false
  if (countdownTimer) clearInterval(countdownTimer)
  auth.logout()
  router.push('/auth/phone')
}

const events = ['touchstart', 'click', 'keydown', 'scroll']

onMounted(() => {
  events.forEach(e => window.addEventListener(e, resetIdle, { passive: true }))
  resetIdle()
})

onUnmounted(() => {
  events.forEach(e => window.removeEventListener(e, resetIdle))
  if (idleTimer) clearTimeout(idleTimer)
  if (countdownTimer) clearInterval(countdownTimer)
})
</script>

<style scoped>
.session-warn-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--gap-lg);
  backdrop-filter: blur(4px);
}

.session-warn {
  background: var(--c-surface);
  border-radius: var(--r-xl);
  padding: var(--gap-xl) var(--gap-lg);
  width: 100%;
  max-width: 340px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--gap-md);
  text-align: center;
  box-shadow: var(--shadow-lg);
}

.session-warn__icon {
  width: 60px;
  height: 60px;
  background: #fff7ed;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c2410c;
}

.session-warn__title {
  font-size: var(--fs-lg);
  font-weight: 700;
  color: var(--c-text);
}

.session-warn__text {
  font-size: var(--fs-base);
  color: var(--c-text-2);
  line-height: 1.6;
}

.session-warn__countdown {
  color: #dc2626;
  font-family: var(--font-mono);
  font-size: var(--fs-md);
}

.session-warn__actions {
  display: flex;
  gap: var(--gap-md);
  width: 100%;
}

.session-warn__btn {
  flex: 1;
  min-height: 48px;
  border-radius: var(--r-lg);
  font-size: var(--fs-base);
  font-weight: 600;
  font-family: var(--font-body);
  cursor: pointer;
  border: none;
  transition: all var(--dur-fast);
}

.session-warn__btn--logout {
  background: var(--c-bg-2);
  color: var(--c-text-2);
  border: 1.5px solid var(--c-border);
}
.session-warn__btn--logout:active { background: var(--c-bg-3); }

.session-warn__btn--stay {
  background: var(--c-accent);
  color: #fff;
}
.session-warn__btn--stay:active { background: #0069aa; }

.session-warn-enter-active, .session-warn-leave-active { transition: opacity 0.25s; }
.session-warn-enter-active .session-warn, .session-warn-leave-active .session-warn {
  transition: transform 0.3s var(--ease-out);
}
.session-warn-enter-from, .session-warn-leave-to { opacity: 0; }
.session-warn-enter-from .session-warn, .session-warn-leave-to .session-warn {
  transform: scale(0.92) translateY(16px);
}
</style>
