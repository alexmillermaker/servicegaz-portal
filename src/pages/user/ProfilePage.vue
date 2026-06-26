<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useEmployeesStore } from '@/store/employees'
import { onboardingTasks } from '@/api/mockData'
import { useAdaptationStore } from '@/store/adaptation'
import { useLearningStore } from '@/store/learning'
import MobileNavigation from '@/widgets/MobileNavigation.vue'
import AppPageHeader from '@/shared/ui/AppPageHeader.vue'
import AppNotificationsDrawer from '@/shared/ui/AppNotificationsDrawer.vue'
import { useHaptic } from '@/shared/composables/useHaptic'
import { useNotifications } from '@/shared/composables/useNotifications'
import { formatPhone } from '@/shared/utils/normalizePhone'

const router = useRouter()
const auth = useAuthStore()
const empStore = useEmployeesStore()
const adaptStore = useAdaptationStore()
const learningStore = useLearningStore()
const haptic = useHaptic()
const { unreadCount } = useNotifications()
const showNotifications = ref(false)

const adaptationPlan = computed(() => auth.employee?.id ? adaptStore.findByEmployeeId(auth.employee.id) : undefined)
const isAdaptationCompleted = computed(() => adaptationPlan.value
  ? adaptationPlan.value.status === 'completed'
  : auth.onboardingDone
)
const adaptationTotal = computed(() => adaptationPlan.value?.tasks.length ?? onboardingTasks.length)
const adaptationDone = computed(() => {
  if (adaptationPlan.value) return adaptationPlan.value.tasks.filter(task => task.done).length
  return auth.completedOnboarding.length
})
const progress = computed(() => adaptationTotal.value
  ? Math.round((adaptationDone.value / adaptationTotal.value) * 100)
  : 0
)
const assignedCoursesCount = computed(() => auth.employee?.id
  ? learningStore.getEnrollmentsForEmployee(auth.employee.id).length
  : 0
)
const assignedCoursesLabel = computed(() => {
  const count = assignedCoursesCount.value
  const mod10 = count % 10
  const mod100 = count % 100
  const noun = mod10 === 1 && mod100 !== 11 ? 'курс' : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? 'курса' : 'курсов'
  return `${count} ${noun} назначено`
})

const hireDate = computed(() => {
  if (!auth.employee?.hireDate) return '—'
  return new Date(auth.employee.hireDate).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
})

const initials = computed(() =>
  auth.employee?.name.split(' ').map(w => w[0]).slice(0, 2).join('') ?? '?'
)

const AVATAR_COLORS = ['#0079C2', '#8b5cf6', '#22c55e', '#f59e0b', '#ec4899', '#14b8a6']
const avatarBg = computed(() => {
  const name = auth.employee?.name ?? ''
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
})

const showLogoutConfirm = ref(false)

function confirmLogout() { showLogoutConfirm.value = true }
function doLogout() { showLogoutConfirm.value = false; auth.logout(); router.push('/auth/phone') }

interface QuickContact { initials: string; label: string; role: string; color: string; name: string; email: string; phone: string }

const quickContacts = computed<QuickContact[]>(() => {
  const emps = empStore.employees
  const assignedManager = emps.find(e => e.id === auth.employee?.managerId)
  const ruk = assignedManager ?? emps.find(e => e.role === 'HR' && e.position.toLowerCase().includes('директор'))
  const it  = emps.find(e => e.department === 'ИТ и цифровые решения' && e.id !== auth.employee?.id)
  const ot  = emps.find(e => e.department === 'Служба безопасности')
  const hr  = emps.find(e => e.department === 'HR департамент')
  return [
    { initials: 'РУК', label: 'Руководитель',    role: 'Прямой контакт', color: '#dbeafe', name: ruk?.name ?? 'Андрей Викторович Петров',   email: ruk?.email ?? 'a.petrov@servicegaz.ru',  phone: ruk?.phone ?? '+7 (351) 123-45-01' },
    { initials: 'IT',  label: 'Служба поддержки', role: 'IT-поддержка',   color: '#d1fae5', name: it?.name  ?? 'Служба технической поддержки', email: it?.email  ?? 'it@servicegaz.ru',         phone: it?.phone  ?? '+7 (351) 123-45-02' },
    { initials: 'ОТ',  label: 'Охрана труда',     role: 'Специалист',     color: '#fee2e2', name: ot?.name  ?? 'Наталья Сергеевна Громова',   email: ot?.email  ?? 'n.gromova@servicegaz.ru', phone: ot?.phone  ?? '+7 (351) 123-45-03' },
    { initials: 'HR',  label: 'HR-отдел',         role: 'Кадры',          color: '#ede9fe', name: hr?.name  ?? 'Карина Александровна Белова',  email: hr?.email  ?? 'hr@servicegaz.ru',         phone: hr?.phone  ?? '+7 (351) 123-45-04' },
  ]
})
const activeContact = ref<QuickContact | null>(null)
function openContact(c: QuickContact) { haptic.tap(); activeContact.value = c }
</script>

<template>
  <div class="profile">
    <AppPageHeader subtitle="UNITorg SG · СЕРВИСГАЗ" bell :badge-count="unreadCount" @bell-click="showNotifications = true" />
    <AppNotificationsDrawer :open="showNotifications" @close="showNotifications = false" />

    <div class="profile__body">
      <!-- Карточка пользователя -->
      <div class="profile__user-card">
        <div class="profile__identity">
          <div class="profile__avatar" :style="{ background: avatarBg }">
            <span class="profile__avatar-initials">{{ initials }}</span>
          </div>
          <div class="profile__user-info">
            <h1 class="profile__name">
              {{ auth.employee?.name }}
              <span v-if="isAdaptationCompleted" class="profile__verified" title="Адаптация пройдена" aria-label="Адаптация пройдена">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="12" fill="#0079C2"/>
                  <polyline points="7 12 10.5 15.5 17 9" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            </h1>
            <span class="profile__position">{{ auth.employee?.position || 'Должность не указана' }}</span>
          </div>
        </div>

        <div class="profile__user-rows">
          <div class="profile__row">
            <svg class="profile__row-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span class="profile__row-label">Подразделение</span>
            <span class="profile__row-val">{{ auth.employee?.department || '—' }}</span>
          </div>
          <div class="profile__row">
            <svg class="profile__row-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.82 19a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 3.07 4.18 2 2 0 0 1 5.07 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L9.91 9.56a16 16 0 0 0 5.53 5.53l.62-.62a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <span class="profile__row-label">Телефон (логин)</span>
            <span class="profile__row-val">{{ auth.employee?.phone ? formatPhone(auth.employee.phone) : '—' }}</span>
          </div>
          <div class="profile__row">
            <svg class="profile__row-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <span class="profile__row-label">Почта</span>
            <span class="profile__row-val">{{ auth.employee?.email || '—' }}</span>
          </div>
          <div class="profile__row">
            <svg class="profile__row-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span class="profile__row-label">Дата приёма</span>
            <span class="profile__row-val">{{ hireDate }}</span>
          </div>
        </div>
      </div>

      <!-- Мои разделы -->
      <h2 class="profile__section-title">Мои разделы</h2>
      <div class="profile__modules">
        <RouterLink to="/adaptation" class="profile__module-row">
          <div class="profile__module-icon" style="background:#e0f2fe;color:#0369a1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          </div>
          <div class="profile__module-info">
            <span class="profile__module-name">Адаптация</span>
            <span class="profile__module-meta">{{ progress }}% выполнено · {{ adaptationDone }}/{{ adaptationTotal }} задач</span>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </RouterLink>
        <RouterLink to="/learning" class="profile__module-row">
          <div class="profile__module-icon" style="background:#f3e8ff;color:#7c3aed">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          </div>
          <div class="profile__module-info">
            <span class="profile__module-name">Обучение</span>
            <span class="profile__module-meta">{{ assignedCoursesLabel }}</span>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </RouterLink>
      </div>

      <!-- Быстрые контакты -->
      <div class="profile__contacts-card">
        <h2 class="profile__contacts-title">Быстрые контакты</h2>
        <div class="profile__contacts-grid">
          <button v-for="c in quickContacts" :key="c.label" class="profile__contact" @click="openContact(c)">
            <div class="profile__contact-avatar" :style="{ background: c.color }">
              <span class="profile__contact-initials">{{ c.initials }}</span>
            </div>
            <span class="profile__contact-name">{{ c.label }}</span>
            <span class="profile__contact-role">{{ c.role }}</span>
          </button>
        </div>
      </div>

      <!-- Выход -->
      <button class="profile__logout" @click="confirmLogout">Выйти из системы</button>
    </div>

    <div class="nav-spacer" />
    <MobileNavigation />

    <!-- Быстрый контакт -->
    <Teleport to="body">
      <div v-if="activeContact" class="profile__confirm-overlay" @click.self="activeContact=null">
        <div class="profile__confirm">
          <!-- Шапка карточки -->
          <div class="profile__contact-sheet-head">
            <div class="profile__contact-avatar profile__contact-avatar--lg" :style="{ background: activeContact.color }">
              <span class="profile__contact-initials profile__contact-initials--lg">{{ activeContact.initials }}</span>
            </div>
            <div class="profile__contact-sheet-info">
              <p class="profile__contact-sheet-name">{{ activeContact.name }}</p>
              <p class="profile__contact-sheet-role">{{ activeContact.label }} · {{ activeContact.role }}</p>
            </div>
          </div>
          <!-- Строки контакта -->
          <div class="profile__contact-rows">
            <div class="profile__contact-row">
              <svg class="profile__row-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span class="profile__contact-row-label">ФИО</span>
              <span class="profile__contact-row-val">{{ activeContact.name }}</span>
            </div>
            <div class="profile__contact-row">
              <svg class="profile__row-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <span class="profile__contact-row-label">Почта</span>
              <a :href="'mailto:' + activeContact.email" class="profile__contact-row-link">{{ activeContact.email }}</a>
            </div>
            <div class="profile__contact-row">
              <svg class="profile__row-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.82 19a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 3.07 4.18 2 2 0 0 1 5.07 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L9.91 9.56a16 16 0 0 0 5.53 5.53l.62-.62a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span class="profile__contact-row-label">Телефон</span>
              <a :href="'tel:' + activeContact.phone.replace(/\D/g,'')" class="profile__contact-row-link">{{ activeContact.phone }}</a>
            </div>
          </div>
          <!-- Действия -->
          <div class="profile__confirm-btns">
            <a :href="'tel:' + activeContact.phone.replace(/\D/g,'')" class="profile__confirm-ok profile__confirm-ok--call">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.82 19a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 3.07 4.18 2 2 0 0 1 5.07 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L9.91 9.56a16 16 0 0 0 5.53 5.53l.62-.62a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              Позвонить
            </a>
            <a :href="'mailto:' + activeContact.email" class="profile__confirm-cancel profile__confirm-cancel--mail">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              Написать письмо
            </a>
            <button class="profile__confirm-cancel" @click="activeContact=null">Закрыть</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Подтверждение выхода -->
    <Teleport to="body">
      <div v-if="showLogoutConfirm" class="profile__confirm-overlay" @click.self="showLogoutConfirm=false">
        <div class="profile__confirm">
          <p class="profile__confirm-title">Выйти из системы?</p>
          <p class="profile__confirm-sub">Вам потребуется снова ввести логин и пароль.</p>
          <div class="profile__confirm-btns">
            <button class="profile__confirm-cancel" @click="showLogoutConfirm=false">Отмена</button>
            <button class="profile__confirm-ok" @click="doLogout">Выйти</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.profile { background: var(--c-bg); min-height: 100dvh; }

.profile__body {
  padding: var(--gap-md);
  display: flex;
  flex-direction: column;
  gap: var(--gap-md);
}

/* ── User card ── */
.profile__user-card {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-xl);
  padding: var(--gap-lg);
  display: flex;
  flex-direction: column;
  gap: var(--gap-md);
  box-shadow: var(--shadow-sm);
}

.profile__identity {
  display: flex;
  align-items: center;
  gap: var(--gap-md);
}

.profile__avatar {
  width: 56px; height: 56px;
  border-radius: 50%;
  background: var(--c-accent);
  border: 2px solid rgba(255,255,255,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.profile__avatar-initials {
  font-size: 20px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.5px;
  line-height: 1;
}

.profile__user-info {
  display: flex;
  flex-direction: column;
  gap: var(--gap-xs);
}
.profile__name {
  font-size: var(--fs-lg);
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
}
.profile__position { font-size: var(--fs-sm); color: var(--c-text-2); }
.profile__verified { display: inline-flex; align-items: center; flex-shrink: 0; }
.profile__status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #d1fae5;
  color: #166534;
  font-size: var(--fs-xs);
  font-weight: 600;
  padding: 3px 10px;
  border-radius: var(--r-full);
  width: fit-content;
}
.profile__status-badge--invited  { background: #dbeafe; color: #1d4ed8; }
.profile__status-badge--blocked  { background: #fee2e2; color: #dc2626; }
.profile__status-badge--archived { background: #f3f4f6; color: #6b7280; }
.profile__status-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.8;
}

.profile__user-rows { display: flex; flex-direction: column; gap: 0; border-top: 1px solid var(--c-border); }
.profile__row {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
  min-height: var(--touch-min);
  padding: 10px 0;
  font-size: var(--fs-sm);
  border-bottom: 1px solid var(--c-border);
}
.profile__row:last-child { border-bottom: none; }
.profile__row-icon { color: var(--c-text-3); flex-shrink: 0; }
.profile__row-label { color: var(--c-text-2); flex: 1; }
.profile__row-val { font-weight: 500; color: var(--c-text); text-align: right; max-width: 55%; }
.profile__section-title { font-size: var(--fs-md); font-weight: 700; margin: 2px 2px -4px; }

/* ── Adapt card ── */
.profile__adapt-card {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-xl);
  padding: var(--gap-lg);
  display: flex;
  flex-direction: column;
  gap: var(--gap-md);
  box-shadow: var(--shadow-sm);
}

.profile__adapt-head {
  display: flex;
  align-items: flex-start;
  gap: var(--gap-md);
}
.profile__adapt-icon-wrap {
  width: 48px; height: 48px;
  background: var(--c-accent-dim);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.profile__adapt-title-wrap { flex: 1; }
.profile__adapt-title-row {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
  margin-bottom: 4px;
}
.profile__adapt-title { font-size: var(--fs-md); font-weight: 700; }
.profile__adapt-p0 {
  background: #fee2e2;
  color: #dc2626;
  font-size: var(--fs-xs);
  font-weight: 700;
  padding: 2px 6px;
  border-radius: var(--r-sm);
}
.profile__adapt-subtitle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.profile__adapt-sub { font-size: var(--fs-sm); color: var(--c-text-2); }
.profile__adapt-pct { font-size: var(--fs-lg); font-weight: 700; color: var(--c-text); }

.profile__progress-track {
  height: 8px;
  background: var(--c-bg-2);
  border-radius: var(--r-full);
  overflow: hidden;
}
.profile__progress-fill {
  height: 100%;
  background: var(--c-accent);
  border-radius: var(--r-full);
  transition: width 0.4s var(--ease-out);
}

/* ── Checklist ── */
.profile__checklist { list-style: none; display: flex; flex-direction: column; }
.profile__check-item {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
  min-height: var(--touch-min);
  padding: 10px 0;
  border-bottom: 1px solid var(--c-border);
  cursor: pointer;
  transition: opacity var(--dur-fast);
}
.profile__check-item:active { opacity: 0.6; }
.profile__check-item:last-child { border-bottom: none; }

.profile__check-box {
  width: 22px; height: 22px;
  border: 2px solid var(--c-border-2);
  border-radius: 5px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--dur-fast);
}
.profile__check-box.is-done {
  background: var(--c-success);
  border-color: var(--c-success);
}

.profile__check-text { font-size: var(--fs-sm); line-height: 1.4; flex: 1; }

.profile__check-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--r-full);
  white-space: nowrap;
}
.badge--done { background: #d1fae5; color: #166534; }
.badge--pending { background: var(--c-bg-2); color: var(--c-text-3); }

.profile__finish-btn {
  width: 100%;
  min-height: 48px;
  background: var(--c-bg-2);
  color: var(--c-text-3);
  border: 1px solid var(--c-border);
  border-radius: var(--r-lg);
  font-size: var(--fs-base);
  font-weight: 600;
  font-family: var(--font-body);
  cursor: not-allowed;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--gap-sm);
  transition: all var(--dur-fast);
}
.profile__finish-btn:not(:disabled) {
  background: var(--c-accent);
  color: #fff;
  border-color: var(--c-accent);
  cursor: pointer;
}


/* ── Modules ── */
.profile__modules {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-xl);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}
.profile__module-row {
  display: flex;
  align-items: center;
  gap: var(--gap-md);
  padding: var(--gap-md);
  text-decoration: none;
  color: var(--c-text);
  border-bottom: 1px solid var(--c-border);
  transition: background var(--dur-fast);
}
.profile__module-row:last-child { border-bottom: none; }
.profile__module-row:active { background: var(--c-bg-2); }
.profile__module-icon {
  width: 44px; height: 44px;
  border-radius: var(--r-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.profile__module-info { flex: 1; }
.profile__module-name { display: block; font-size: var(--fs-sm); font-weight: 700; }
.profile__module-meta { display: block; font-size: var(--fs-xs); color: var(--c-text-3); margin-top: 2px; }
.profile__module-row > svg { color: var(--c-text-3); flex-shrink: 0; }

/* ── Contacts ── */
.profile__contacts-card {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-xl);
  padding: var(--gap-lg);
  box-shadow: var(--shadow-sm);
}
.profile__contacts-title { font-size: var(--fs-md); font-weight: 700; margin-bottom: var(--gap-md); }
.profile__contacts-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--gap-sm);
}
.profile__contact {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
  background: none;
  border: none;
  font-family: var(--font-body);
  cursor: pointer;
  padding: 6px 2px;
  border-radius: var(--r-md);
  transition: background var(--dur-fast);
}
.profile__contact:active { background: var(--c-bg-2); }
.profile__contact-avatar {
  width: 48px; height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.profile__contact-avatar--lg { width: 56px; height: 56px; flex-shrink: 0; }
.profile__contact-initials { font-size: 11px; font-weight: 700; color: var(--c-text-2); }
.profile__contact-initials--lg { font-size: 16px; }
.profile__contact-name { font-size: 11px; font-weight: 600; color: var(--c-text); line-height: 1.3; }
.profile__contact-role { font-size: 10px; color: var(--c-text-3); }
.profile__contact-sheet-head {
  display: flex;
  align-items: center;
  gap: var(--gap-md);
  padding-bottom: var(--gap-md);
  border-bottom: 1px solid var(--c-border);
  margin-bottom: var(--gap-xs);
}
.profile__contact-sheet-info { flex: 1; min-width: 0; }
.profile__contact-sheet-name {
  font-size: var(--fs-base);
  font-weight: 700;
  color: var(--c-text);
  line-height: 1.3;
  margin-bottom: 3px;
}
.profile__contact-sheet-role { font-size: var(--fs-xs); color: var(--c-text-3); }

.profile__contact-rows { display: flex; flex-direction: column; }
.profile__contact-row {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
  min-height: 44px;
  padding: 10px 0;
  font-size: var(--fs-sm);
  border-bottom: 1px solid var(--c-border);
}
.profile__contact-row:last-child { border-bottom: none; }
.profile__contact-row-label { color: var(--c-text-2); flex: 1; }
.profile__contact-row-val { font-weight: 500; color: var(--c-text); text-align: right; max-width: 60%; font-size: var(--fs-sm); }
.profile__contact-row-link {
  font-weight: 500;
  color: var(--c-accent);
  text-align: right;
  max-width: 60%;
  font-size: var(--fs-sm);
  text-decoration: none;
  word-break: break-all;
}

.profile__confirm-ok--call {
  display: flex; align-items: center; justify-content: center; gap: var(--gap-sm);
  text-decoration: none; background: var(--c-accent) !important; color: #fff !important;
  min-height: 52px; border-radius: var(--r-lg); font-size: var(--fs-base); font-weight: 700;
}
.profile__confirm-cancel--mail {
  display: flex; align-items: center; justify-content: center; gap: var(--gap-sm);
  text-decoration: none;
}

.profile__logout {
  font-size: var(--fs-sm);
  color: var(--c-danger);
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font-body);
  padding: var(--gap-sm) var(--gap-md);
  min-height: var(--touch-min);
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--r-lg);
  transition: background var(--dur-fast);
}
.profile__logout:active {
  background: rgba(220, 38, 38, 0.06);
}

/* ── Logout confirm ── */
.profile__confirm-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 500;
  display: flex; align-items: flex-end; justify-content: center;
  backdrop-filter: blur(3px);
}
.profile__confirm {
  width: 100%; max-width: 480px;
  background: var(--c-surface);
  border-radius: var(--r-xl) var(--r-xl) 0 0;
  padding: var(--gap-xl) var(--gap-lg) calc(var(--gap-xl) + env(safe-area-inset-bottom));
  display: flex; flex-direction: column; gap: var(--gap-md);
}
.profile__confirm-title { font-size: var(--fs-lg); font-weight: 700; }
.profile__confirm-sub { font-size: var(--fs-sm); color: var(--c-text-2); }
.profile__confirm-btns { display: flex; flex-direction: column; gap: var(--gap-sm); margin-top: var(--gap-sm); }
.profile__confirm-ok {
  width: 100%; min-height: 52px; background: var(--c-danger); color: #fff;
  border: none; border-radius: var(--r-lg); font-size: var(--fs-base); font-weight: 700;
  cursor: pointer; font-family: var(--font-body);
}
.profile__confirm-cancel {
  width: 100%; min-height: 48px; background: var(--c-bg-2); color: var(--c-text-2);
  border: 1px solid var(--c-border); border-radius: var(--r-lg); font-size: var(--fs-base);
  font-weight: 600; cursor: pointer; font-family: var(--font-body);
}
</style>
