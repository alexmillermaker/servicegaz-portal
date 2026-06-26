<template>
  <aside class="admin-sidebar" :class="{ 'admin-sidebar--collapsed': collapsed }">
    <!-- Логотип -->
    <div class="admin-sidebar__logo">
      <img src="/servisgaz-logo.png" class="admin-sidebar__logo-img" alt="СЕРВИСГАЗ" />
      <Transition name="fade-text">
        <div v-if="!collapsed" class="admin-sidebar__logo-text">
          <span class="admin-sidebar__logo-name">СЕРВИСГАЗ</span>
          <span class="admin-sidebar__logo-sub">Панель управления</span>
        </div>
      </Transition>
    </div>

    <!-- Навигация -->
    <nav class="admin-sidebar__nav">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="admin-sidebar__item"
        :class="{ 'is-active': isActive(item) }"
        :title="collapsed ? item.label : undefined"
      >
        <span class="admin-sidebar__item-icon" v-html="item.icon" />
        <Transition name="fade-text">
          <span v-if="!collapsed" class="admin-sidebar__item-label">{{ item.label }}</span>
        </Transition>
        <Transition name="fade-text">
          <span v-if="item.badge && !collapsed" class="admin-sidebar__badge">{{ item.badge }}</span>
        </Transition>
        <span v-if="item.badge && collapsed" class="admin-sidebar__badge-dot" />
      </RouterLink>
    </nav>

    <!-- Профиль внизу -->
    <div class="admin-sidebar__footer">
      <div class="admin-sidebar__user">
        <div class="admin-sidebar__user-avatar" :title="collapsed ? shortName : undefined">{{ initials }}</div>
        <Transition name="fade-text">
          <div v-if="!collapsed" class="admin-sidebar__user-info">
            <span class="admin-sidebar__user-name">{{ shortName }}</span>
            <span class="admin-sidebar__user-role">Администратор</span>
          </div>
        </Transition>
        <Transition name="fade-text">
          <button v-if="!collapsed" class="admin-sidebar__logout" title="Выйти" @click="logout">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </Transition>
      </div>
      <Transition name="fade-text">
        <button v-if="collapsed" class="admin-sidebar__logout-center" title="Выйти" @click="logout">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </Transition>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useEmployeesStore } from '@/store/employees'
import { useAdaptationStore } from '@/store/adaptation'
import { mockDocuments } from '@/api/mockData'

defineProps<{ collapsed: boolean }>()

const auth = useAuthStore()
const empStore = useEmployeesStore()
const adaptStore = useAdaptationStore()
const route = useRoute()
const router = useRouter()

const initials = computed(() =>
  auth.employee?.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('') ?? 'АД'
)
const shortName = computed(() =>
  auth.employee?.name.split(' ').slice(0, 2).join(' ') ?? 'Администратор'
)

function logout() {
  auth.logout()
  router.push('/auth/phone')
}

function isActive(item: { to: string; exact?: boolean }) {
  if (item.exact) return route.path === item.to
  return route.path === item.to || route.path.startsWith(item.to + '/')
}

const icon = (d: string) =>
  `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`

const employeeBadge = computed(() => empStore.employees.filter(e => e.status !== 'ARCHIVED').length)
const adaptationBadge = computed(() => adaptStore.plans.filter(p => p.status !== 'completed').length)
const documentsBadge = computed(() => mockDocuments.filter(d => d.requiresAck).length)

const navItems = computed(() => [
  { to: '/admin', exact: true, label: 'Главная', icon: icon('M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10') },
  {
    to: '/admin/employees', label: 'Сотрудники', badge: employeeBadge.value,
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  },
  { to: '/admin/org', label: 'Организации', icon: icon('M3 21h18 M9 8h1 M9 12h1 M9 16h1 M14 8h1 M14 12h1 M14 16h1 M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16') },
  {
    to: '/admin/adaptation', label: 'Адаптация', badge: adaptationBadge.value,
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
  },
  { to: '/admin/learning', label: 'Обучение', icon: icon('M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z') },
  {
    to: '/admin/documents', label: 'Документы', badge: documentsBadge.value,
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  },
  { to: '/admin/news', label: 'Новости', icon: icon('M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2z M9 9h6 M9 13h6 M9 17h4') },
  { to: '/admin/events', label: 'События', icon: icon('M8 2v4 M16 2v4 M3 10h18 M21 8H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2z') },
  { to: '/admin/reports', label: 'Отчёты', icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18 M9 21V9"/></svg>` },
  { to: '/admin/roles', label: 'Роли и доступы', icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>` },
  { to: '/admin/audit', label: 'Журнал действий', icon: icon('M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M8 13h8 M8 17h5 M14 2v6h6') },
  { to: '/admin/settings', label: 'Настройки', icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>` },
])
</script>

<style scoped>
.admin-sidebar {
  width: 240px;
  background: #0f1729;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 200;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
  transition: width 0.25s ease;
}
.admin-sidebar::-webkit-scrollbar { display: none; }
.admin-sidebar--collapsed { width: 64px; }

/* ── Логотип ── */
.admin-sidebar__logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 12px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
  min-height: 64px;
  overflow: hidden;
}

.admin-sidebar__logo-img {
  width: 40px;
  height: 40px;
  object-fit: contain;
  flex-shrink: 0;
  border-radius: 6px;
  background: rgba(255,255,255,0.06);
  padding: 4px;
}

.admin-sidebar__logo-text { display: flex; flex-direction: column; min-width: 0; white-space: nowrap; }
.admin-sidebar__logo-name {
  font-size: 13px;
  font-weight: 800;
  color: #fff;
  letter-spacing: 0.5px;
  line-height: 1.2;
}
.admin-sidebar__logo-sub {
  font-size: 10px;
  color: rgba(255,255,255,0.4);
  line-height: 1.4;
}

/* ── Навигация ── */
.admin-sidebar__nav {
  flex: 1;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.admin-sidebar__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 8px;
  color: rgba(255,255,255,0.55);
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
  cursor: pointer;
  min-height: 38px;
  overflow: hidden;
  white-space: nowrap;
  position: relative;
}
.admin-sidebar__item:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.85); }
.admin-sidebar__item.is-active { background: rgba(0,121,194,0.25); color: #fff; }
.admin-sidebar__item.is-active .admin-sidebar__item-icon { color: #5bb8f5; }

.admin-sidebar--collapsed .admin-sidebar__item {
  padding: 9px;
  justify-content: center;
}

.admin-sidebar__item-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
}

.admin-sidebar__item-label { flex: 1; overflow: hidden; text-overflow: ellipsis; }

.admin-sidebar__badge {
  font-size: 10px;
  font-weight: 700;
  background: rgba(0,121,194,0.35);
  color: #5bb8f5;
  border-radius: 10px;
  padding: 1px 7px;
  min-width: 22px;
  text-align: center;
  flex-shrink: 0;
}

.admin-sidebar__badge-dot {
  width: 6px;
  height: 6px;
  background: #5bb8f5;
  border-radius: 50%;
  position: absolute;
  top: 8px;
  right: 8px;
}

/* ── Footer ── */
.admin-sidebar__footer {
  border-top: 1px solid rgba(255,255,255,0.06);
  padding: 12px 10px;
  flex-shrink: 0;
}

.admin-sidebar__user {
  display: flex;
  align-items: center;
  gap: 10px;
  overflow: hidden;
}

.admin-sidebar__user-avatar {
  width: 34px;
  height: 34px;
  background: #0079C2;
  border-radius: 8px;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.admin-sidebar__user-info { flex: 1; display: flex; flex-direction: column; min-width: 0; overflow: hidden; }
.admin-sidebar__user-name {
  font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.85);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.admin-sidebar__user-role { font-size: 10px; color: rgba(255,255,255,0.4); }

.admin-sidebar__logout {
  width: 28px; height: 28px; border-radius: 6px;
  background: transparent; border: none;
  color: rgba(255,255,255,0.4);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background 0.15s, color 0.15s; flex-shrink: 0;
}
.admin-sidebar__logout:hover { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.8); }

.admin-sidebar__logout-center {
  width: 100%; margin-top: 8px; padding: 6px;
  border-radius: 6px; background: transparent; border: none;
  color: rgba(255,255,255,0.4);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background 0.15s, color 0.15s;
}
.admin-sidebar__logout-center:hover { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.8); }

/* ── Анимация текста ── */
.fade-text-enter-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.fade-text-leave-active { transition: opacity 0.1s ease; position: absolute; }
.fade-text-enter-from { opacity: 0; transform: translateX(-6px); }
.fade-text-leave-to { opacity: 0; }
</style>
