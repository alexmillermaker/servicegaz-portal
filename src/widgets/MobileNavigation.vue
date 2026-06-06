<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const route = useRoute()
const auth = useAuthStore()

const isActive = (name: string) => route.name === name

const tabs = computed(() => {
  const base = [
    {
      name: 'Profile', to: '/profile', label: 'Профиль',
      icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    },
    {
      name: 'NewsList', to: '/news', label: 'Новости',
      icon: 'M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2 M18 14h-8 M15 18h-5 M10 6h8v4h-8z',
    },
    {
      name: 'Events', to: '/events', label: 'События',
      icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    },
    {
      name: 'Documents', to: '/documents', label: 'Документы',
      icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
    },
    {
      name: 'Navigate', to: '/navigate', label: 'Навигация',
      icon: 'M3 11l19-9-9 19-2-8-8-2z',
    },
  ]
  if (auth.isHR) {
    base.push({
      name: 'AdminDashboard', to: '/admin', label: 'Админ',
      icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    })
  }
  return base
})
</script>

<template>
  <nav class="mobile-nav" role="navigation" aria-label="Основная навигация">
    <RouterLink
      v-for="tab in tabs"
      :key="tab.name"
      :to="tab.to"
      class="mobile-nav__item"
      :class="{ 'is-active': isActive(tab.name) }"
      :aria-current="isActive(tab.name) ? 'page' : undefined"
    >
      <div class="mobile-nav__icon-wrap">
        <svg
          width="22" height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path :d="tab.icon"/>
        </svg>
      </div>
      <span class="mobile-nav__label">{{ tab.label }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  display: flex;
  align-items: stretch;

  /* ── Glassmorphism ── */
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border-top: 1px solid rgba(209, 217, 232, 0.7);
  box-shadow: 0 -4px 24px rgba(0, 50, 100, 0.07);

  /* Учитываем home indicator на iPhone X+ */
  padding-bottom: env(safe-area-inset-bottom, 0px);

  z-index: 100;
  /* GPU-слой — предотвращает мерцание при скролле */
  will-change: transform;
  transform: translateX(-50%) translateZ(0);
}

.mobile-nav__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  /* Фиксированная высота панели без safe-area */
  height: var(--nav-height);
  text-decoration: none;
  color: var(--c-text-3);
  position: relative;
  padding: 0 4px;
  transition: color var(--dur-fast);
  /* touch-action: manipulation глобально, но дублируем */
  touch-action: manipulation;
}

.mobile-nav__icon-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 30px;
  border-radius: 15px;
  transition: background var(--dur-base) var(--ease-out),
              transform var(--dur-fast);
}

/* Активная pill-подсветка */
.mobile-nav__item.is-active .mobile-nav__icon-wrap {
  background: rgba(0, 121, 194, 0.12);
}

.mobile-nav__item.is-active {
  color: var(--c-accent);
}

/* Отклик на нажатие */
.mobile-nav__item:active .mobile-nav__icon-wrap {
  transform: scale(0.85);
}

.mobile-nav__label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.01em;
  line-height: 1;
  transition: color var(--dur-fast);
}
</style>
