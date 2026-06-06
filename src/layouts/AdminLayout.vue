<template>
  <div class="admin-shell">
    <AdminSidebar :collapsed="collapsed" />
    <div class="admin-main" :class="{ 'admin-main--collapsed': collapsed }">
      <header class="admin-topbar">
        <div class="admin-topbar__left">
          <button class="admin-topbar__toggle" @click="collapsed = !collapsed" :aria-label="collapsed ? 'Развернуть меню' : 'Свернуть меню'">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div class="admin-topbar__page-info">
            <span class="admin-topbar__page-title">{{ pageTitle }}</span>
          </div>
        </div>
        <div class="admin-topbar__right">
          <div v-if="latestNews" class="admin-topbar__news" @click="$router.push('/admin/news')">
            <span class="admin-topbar__news-label">Новости компании</span>
            <p class="admin-topbar__news-text">{{ latestNews.title }}</p>
            <span v-if="latestNews.isImportant" class="admin-topbar__news-badge">Новое</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
          <button class="admin-topbar__bell" aria-label="Уведомления" @click="showNotif = !showNotif">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span v-if="unreadCount > 0" class="admin-topbar__bell-badge">{{ unreadCount }}</span>
          </button>
          <div class="admin-topbar__profile">
            <div class="admin-topbar__avatar">{{ initials }}</div>
            <div class="admin-topbar__profile-text">
              <span class="admin-topbar__profile-name">{{ auth.employee?.name.split(' ').slice(0, 2).join(' ') }}</span>
              <span class="admin-topbar__profile-role">Администратор</span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>
      </header>
      <main class="admin-content">
        <RouterView />
      </main>
    </div>
    <AppNotificationsDrawer :open="showNotif" @close="showNotif = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AdminSidebar from '@/widgets/AdminSidebar.vue'
import AppNotificationsDrawer from '@/shared/ui/AppNotificationsDrawer.vue'
import { useAuthStore } from '@/store/auth'
import { useNotifications } from '@/shared/composables/useNotifications'
import { mockNews } from '@/api/mockData'

const auth = useAuthStore()
const { unreadCount } = useNotifications()
const showNotif = ref(false)
const collapsed = ref(false)
const route = useRoute()

const initials = computed(() =>
  auth.employee?.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('') ?? 'АД'
)

const PAGE_TITLES: Record<string, string> = {
  '/admin': 'Главная',
  '/admin/employees': 'Сотрудники',
  '/admin/adaptation': 'Адаптация',
  '/admin/news': 'Новости',
  '/admin/documents': 'Документы',
  '/admin/audit': 'Журнал действий',
  '/admin/settings': 'Настройки',
  '/admin/roles': 'Роли и доступы',
  '/admin/org': 'Организации',
  '/admin/learning': 'Обучение',
  '/admin/events': 'События',
  '/admin/reports': 'Отчёты',
}
const pageTitle = computed(() => PAGE_TITLES[route.path] ?? 'Панель управления')

const latestNews = computed(() => mockNews.filter(n => n.published)[0] ?? null)
</script>

<style scoped>
.admin-shell {
  display: flex;
  min-height: 100vh;
  background: #f0f2f5;
  font-family: var(--font-body);
}

.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  margin-left: 240px;
  transition: margin-left 0.25s ease;
}
.admin-main--collapsed { margin-left: 64px; }

/* Топбар */
.admin-topbar {
  height: 56px;
  background: #fff;
  border-bottom: 1px solid #e5e9ef;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  position: sticky;
  top: 0;
  z-index: 100;
  flex-shrink: 0;
  overflow: hidden;
  gap: 12px;
}

.admin-topbar__left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.admin-topbar__toggle {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #f3f4f6;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #374151;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s;
}
.admin-topbar__toggle:hover { background: #e5e7eb; }

.admin-topbar__page-info { display: flex; flex-direction: column; }
.admin-topbar__page-title { font-size: 15px; font-weight: 700; color: #111827; }

.admin-topbar__right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  margin-left: auto;
}

/* Новости */
.admin-topbar__news {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px;
  height: 56px;
  border-left: 1px solid #e5e9ef;
  border-right: 1px solid #e5e9ef;
  cursor: pointer;
  color: #374151;
  max-width: 320px;
  overflow: hidden;
}
.admin-topbar__news:hover { background: #f9fafb; }
.admin-topbar__news-label {
  font-size: 11px;
  font-weight: 600;
  color: #9ca3af;
  white-space: nowrap;
  flex-shrink: 0;
}
.admin-topbar__news-text {
  font-size: 13px;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
}
.admin-topbar__news-badge {
  font-size: 11px;
  font-weight: 700;
  background: #0079C2;
  color: #fff;
  border-radius: 4px;
  padding: 2px 7px;
  white-space: nowrap;
  flex-shrink: 0;
}
.admin-topbar__news svg { color: #9ca3af; flex-shrink: 0; }

/* Колокол */
.admin-topbar__bell {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #f3f4f6;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4b5563;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s;
}
.admin-topbar__bell:hover { background: #e5e7eb; }
.admin-topbar__bell-badge {
  position: absolute;
  top: 3px;
  right: 3px;
  min-width: 16px;
  height: 16px;
  background: #ef4444;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #fff;
  padding: 0 2px;
  line-height: 1;
}

/* Профиль */
.admin-topbar__profile {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 5px 8px;
  border-radius: 8px;
  transition: background 0.15s;
  flex-shrink: 0;
}
.admin-topbar__profile:hover { background: #f3f4f6; }
.admin-topbar__avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #0079C2;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.admin-topbar__profile-text { display: flex; flex-direction: column; }
.admin-topbar__profile-name { font-size: 13px; font-weight: 600; color: #111827; line-height: 1.3; white-space: nowrap; }
.admin-topbar__profile-role { font-size: 11px; color: #9ca3af; }
.admin-topbar__profile svg { color: #9ca3af; }

/* Контент */
.admin-content {
  flex: 1;
  padding: 24px;
  min-width: 0;
}
</style>