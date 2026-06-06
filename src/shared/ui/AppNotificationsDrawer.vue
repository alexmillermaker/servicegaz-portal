<template>
  <Teleport to="body">
    <Transition name="notif-drawer">
      <div v-if="open" class="notif-overlay" @click.self="$emit('close')">
        <div class="notif-drawer" role="dialog" aria-modal="true" aria-label="Уведомления">
          <div class="notif-drawer__header">
            <h2 class="notif-drawer__title">Уведомления</h2>
            <div class="notif-drawer__actions">
              <button
                v-if="unreadCount > 0"
                class="notif-drawer__read-all"
                @click="markAllRead"
              >
                Прочитать все
              </button>
              <button class="notif-drawer__close" aria-label="Закрыть" @click="$emit('close')">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="notif-drawer__list">
            <TransitionGroup name="notif-item">
              <button
                v-for="n in notifications"
                :key="n.id"
                class="notif-item"
                :class="{ 'notif-item--unread': !n.read }"
                @click="markRead(n.id)"
              >
                <div class="notif-item__icon" :class="`notif-item__icon--${n.type}`">
                  <svg v-if="n.type === 'success'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  <svg v-else-if="n.type === 'warning'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  <svg v-else-if="n.type === 'hr'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                </div>

                <div class="notif-item__body">
                  <p class="notif-item__title">{{ n.title }}</p>
                  <p class="notif-item__text">{{ n.body }}</p>
                  <time class="notif-item__time">{{ n.time }}</time>
                </div>

                <span v-if="!n.read" class="notif-item__dot" aria-label="Непрочитано" />
              </button>
            </TransitionGroup>

            <div v-if="notifications.length === 0" class="notif-drawer__empty">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <p>Уведомлений нет</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useNotifications } from '@/shared/composables/useNotifications'

defineProps<{ open: boolean }>()
defineEmits<{ close: [] }>()

const { notifications, unreadCount, markRead, markAllRead } = useNotifications()
</script>

<style scoped>
.notif-overlay {
  position: fixed;
  inset: 0;
  z-index: 500;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(3px);
  display: flex;
  justify-content: flex-end;
}

.notif-drawer {
  width: min(100%, 400px);
  height: 100%;
  background: var(--c-surface);
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.notif-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(var(--gap-lg) + env(safe-area-inset-top, 0px)) var(--gap-md) var(--gap-md);
  border-bottom: 1px solid var(--c-border);
  flex-shrink: 0;
}

.notif-drawer__title {
  font-size: var(--fs-lg);
  font-weight: 700;
}

.notif-drawer__actions {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
}

.notif-drawer__read-all {
  font-size: var(--fs-xs);
  font-weight: 600;
  color: var(--c-accent);
  font-family: var(--font-body);
  cursor: pointer;
  padding: 6px 10px;
  border-radius: var(--r-md);
  min-height: var(--touch-min);
  display: flex;
  align-items: center;
  transition: background var(--dur-fast);
}
.notif-drawer__read-all:active { background: var(--c-accent-dim); }

.notif-drawer__close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--c-bg-2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-text-2);
  cursor: pointer;
  border: none;
  transition: background var(--dur-fast);
  min-width: var(--touch-min);
  min-height: var(--touch-min);
}
.notif-drawer__close:active { background: var(--c-border); }

.notif-drawer__list {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* ── Элемент уведомления ── */
.notif-item {
  display: flex;
  align-items: flex-start;
  gap: var(--gap-md);
  padding: var(--gap-md);
  width: 100%;
  text-align: left;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--c-border);
  cursor: pointer;
  font-family: var(--font-body);
  transition: background var(--dur-fast);
  position: relative;
}
.notif-item--unread { background: rgba(0, 121, 194, 0.04); }
.notif-item:active  { background: var(--c-bg-2); }

.notif-item__icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.notif-item__icon--info    { background: #dbeafe; color: #1d4ed8; }
.notif-item__icon--success { background: #d1fae5; color: #166534; }
.notif-item__icon--warning { background: #fff7ed; color: #c2410c; }
.notif-item__icon--hr      { background: var(--c-accent-dim); color: var(--c-accent); }

.notif-item__body { flex: 1; min-width: 0; }

.notif-item__title {
  font-size: var(--fs-sm);
  font-weight: 700;
  color: var(--c-text);
  margin-bottom: 2px;
}

.notif-item__text {
  font-size: var(--fs-xs);
  color: var(--c-text-2);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 4px;
}

.notif-item__time {
  font-size: 11px;
  color: var(--c-text-3);
}

.notif-item__dot {
  width: 8px;
  height: 8px;
  background: var(--c-accent);
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 6px;
}

.notif-drawer__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--gap-md);
  padding: var(--gap-xl);
  color: var(--c-text-3);
  font-size: var(--fs-sm);
}

/* Анимации */
.notif-drawer-enter-active, .notif-drawer-leave-active {
  transition: opacity 0.25s;
}
.notif-drawer-enter-active .notif-drawer, .notif-drawer-leave-active .notif-drawer {
  transition: transform 0.3s var(--ease-out);
}
.notif-drawer-enter-from, .notif-drawer-leave-to { opacity: 0; }
.notif-drawer-enter-from .notif-drawer { transform: translateX(100%); }
.notif-drawer-leave-to .notif-drawer   { transform: translateX(100%); }

.notif-item-leave-active { transition: all 0.2s ease; }
.notif-item-leave-to     { opacity: 0; transform: translateX(20px); }
</style>
