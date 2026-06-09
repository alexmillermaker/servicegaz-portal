// ============================================================
// ROUTER — изолированное ядро маршрутизации
// НЕ импортирует store напрямую — доступ к Pinia только
// внутри navigation guards (после монтирования Pinia)
// ============================================================
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ── Авторизация ─────────────────────────────────────────
    {
      path: '/',
      redirect: '/auth/phone'
    },
    {
      path: '/auth/phone',
      name: 'AuthPhone',
      component: () => import('@/pages/auth/AuthPhonePage.vue'),
      meta: { requiresGuest: true }
    },

    // ── Кабинет сотрудника ──────────────────────────────────
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('@/pages/user/ProfilePage.vue'),
      meta: { requiresAuth: true, roles: ['EMPLOYEE', 'HR'] }
    },
    {
      path: '/news',
      name: 'NewsList',
      component: () => import('@/pages/user/NewsListPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/events',
      name: 'Events',
      component: () => import('@/pages/user/EventsPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/documents',
      name: 'Documents',
      component: () => import('@/pages/user/DocumentsPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/navigate',
      name: 'Navigate',
      component: () => import('@/pages/user/NavigatePage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/adaptation',
      name: 'Adaptation',
      component: () => import('@/pages/user/UserAdaptationPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/learning',
      name: 'Learning',
      component: () => import('@/pages/user/UserLearningPage.vue'),
      meta: { requiresAuth: true }
    },

    // ── Панель администратора ────────────────────────────────
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true, roles: ['HR'] },
      children: [
        { path: '',          name: 'AdminDashboard',   component: () => import('@/pages/admin/AdminDashboardPage.vue') },
        { path: 'employees', name: 'AdminEmployees',   component: () => import('@/pages/admin/AdminEmployeesPage.vue') },
        { path: 'adaptation',name: 'AdminAdaptation',  component: () => import('@/pages/admin/AdminAdaptationPage.vue') },
        { path: 'news',      name: 'AdminNews',        component: () => import('@/pages/admin/AdminNewsAdminPage.vue') },
        { path: 'documents', name: 'AdminDocs',        component: () => import('@/pages/admin/AdminDocsAdminPage.vue') },
        { path: 'audit',     name: 'AdminAudit',       component: () => import('@/pages/admin/AdminAuditPage.vue') },
        { path: 'settings',  name: 'AdminSettings',    component: () => import('@/pages/admin/AdminSettingsPage.vue') },
        { path: 'roles',     name: 'AdminRoles',       component: () => import('@/pages/admin/AdminRolesPage.vue') },
        { path: 'org',       name: 'AdminOrg',         component: () => import('@/pages/admin/AdminOrgPage.vue') },
        { path: 'learning',  name: 'AdminLearning',    component: () => import('@/pages/admin/AdminLearningPage.vue') },
        { path: 'events',    name: 'AdminEvents',      component: () => import('@/pages/admin/AdminEventsPage.vue') },
        { path: 'reports',   name: 'AdminReports',     component: () => import('@/pages/admin/AdminReportsPage.vue') },
      ]
    },

    // ── 404 ─────────────────────────────────────────────────
    {
      path: '/:pathMatch(.*)*',
      redirect: '/auth/phone'
    }
  ]
})

// ── Navigation Guard ─────────────────────────────────────────
router.beforeEach(async (to) => {
  // Импортируем store ВНУТРИ guard (после монтирования Pinia)
  const { useAuthStore } = await import('@/store/auth')
  const auth = useAuthStore()

  const requiresAuth = to.meta.requiresAuth as boolean | undefined
  const requiresGuest = to.meta.requiresGuest as boolean | undefined
  const allowedRoles = to.meta.roles as string[] | undefined

  if (requiresAuth && !auth.isAuthenticated) {
    return { name: 'AuthPhone' }
  }

  if (requiresGuest && auth.isAuthenticated) {
    return auth.isHR ? { name: 'AdminDashboard' } : { name: 'Profile' }
  }

  if (allowedRoles && auth.role && !allowedRoles.includes(auth.role)) {
    return auth.isHR ? { name: 'AdminDashboard' } : { name: 'Profile' }
  }
})

export default router
