<template>
  <div class="emp-page">
    <div class="emp-page__header">
      <h1 class="emp-page__title">Сотрудники</h1>
      <button class="emp-page__add-btn" @click="showAddModal = true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Добавить сотрудника
      </button>
    </div>
    <div class="emp-page__body">
      <div class="emp-page__table-col">
        <div class="emp-page__search-wrap">
          <div class="emp-page__search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input v-model="search" class="emp-page__search-input" placeholder="Поиск по ФИО или телефону" />
          </div>
        </div>
        <div class="emp-page__filters">
          <div class="emp-page__filter-group">
            <label class="emp-page__filter-label">Подразделение</label>
            <select v-model="filterDept" class="emp-page__filter-select">
              <option value="">Все</option>
              <option v-for="d in departments" :key="d" :value="d">{{ d }}</option>
            </select>
          </div>
          <div class="emp-page__filter-group">
            <label class="emp-page__filter-label">Роль</label>
            <select v-model="filterRole" class="emp-page__filter-select">
              <option value="">Все</option>
              <option value="HR">HR</option>
              <option value="EMPLOYEE">Сотрудник</option>
            </select>
          </div>
          <div class="emp-page__filter-group">
            <label class="emp-page__filter-label">Статус</label>
            <select v-model="filterStatus" class="emp-page__filter-select">
              <option value="">Все</option>
              <option value="ACTIVE">Активен</option>
              <option value="INVITED">Приглашён</option>
              <option value="BLOCKED">Заблокирован</option>
              <option value="ARCHIVED">Архивный</option>
            </select>
          </div>
          <div class="emp-page__filter-group">
            <label class="emp-page__filter-label">Адаптация</label>
            <select v-model="filterAdapt" class="emp-page__filter-select">
              <option value="">Все</option>
              <option value="done">Завершена</option>
              <option value="progress">В процессе</option>
              <option value="none">Не начата</option>
            </select>
          </div>
          <button class="emp-page__reset-btn" @click="resetFilters">Сбросить</button>
        </div>
        <div class="emp-table-wrap">
          <table class="emp-table">
            <thead>
              <tr>
                <th>ФИО</th><th>Телефон</th><th>Подразделение</th><th>Роль</th>
                <th>Статус</th><th>Адаптация</th><th>Последний вход</th><th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="emp in paginatedEmployees" :key="emp.id"
                class="emp-table__row" :class="{ 'is-selected': selected?.id === emp.id }"
                @click="selectEmployee(emp)">
                <td>
                  <div class="emp-table__name-cell">
                    <div class="emp-table__avatar" :style="{ background: avatarColor(emp.name) }">{{ initials(emp.name) }}</div>
                    <div>
                      <p class="emp-table__full-name">{{ emp.name }}</p>
                      <p class="emp-table__position">{{ emp.position }}</p>
                    </div>
                  </div>
                </td>
                <td class="emp-table__phone">{{ emp.phone }}</td>
                <td class="emp-table__dept">{{ emp.department || '—' }}</td>
                <td class="emp-table__role-cell">{{ roleLabel(emp.role) }}</td>
                <td><span class="status-badge" :class="'status--' + emp.status.toLowerCase()">{{ statusLabel(emp.status) }}</span></td>
                <td>
                  <div class="adapt-cell" v-if="emp.status !== 'ARCHIVED'">
                    <div class="adapt-cell__bar"><div class="adapt-cell__fill" :style="{ width: adaptPct(emp) + '%', background: adaptColor(emp) }" /></div>
                    <span class="adapt-cell__pct">{{ adaptPct(emp) }}%</span>
                  </div>
                  <span v-else class="emp-table__dash">—</span>
                </td>
                <td class="emp-table__login">{{ emp.lastLogin }}</td>
                <td>
                  <button class="emp-table__action-btn" @click.stop="selectEmployee(emp)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="filteredEmployees.length === 0" class="emp-table__empty">Сотрудники не найдены</div>
        </div>
        <div class="emp-page__pagination">
          <span class="emp-page__pagination-info">Показано {{ paginationFrom }}-{{ paginationTo }} из {{ filteredEmployees.length }}</span>
          <div class="emp-page__pagination-btns">
            <button class="emp-page__pg-btn" :disabled="page === 1" @click="page--">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button v-for="p in visiblePages" :key="String(p)" class="emp-page__pg-btn"
              :class="{ 'is-active': p === page }" :disabled="typeof p !== 'number'"
              @click="typeof p === 'number' && (page = p)">{{ p }}</button>
            <button class="emp-page__pg-btn" :disabled="page === totalPages" @click="page++">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
          <select v-model="perPage" class="emp-page__per-page">
            <option :value="10">10 / стр.</option>
            <option :value="25">25 / стр.</option>
            <option :value="50">50 / стр.</option>
          </select>
        </div>
      </div>
      <Transition name="detail-panel">
        <div v-if="selected" class="emp-detail">
          <div class="emp-detail__header">
            <h3 class="emp-detail__heading">Карточка сотрудника</h3>
            <button class="emp-detail__close" @click="selected = null">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="emp-detail__body">
            <div class="emp-detail__identity">
              <div class="emp-detail__avatar" :style="{ background: avatarColor(selected.name) }">{{ initials(selected.name) }}</div>
              <div>
                <p class="emp-detail__name">{{ selected.name }}</p>
                <div class="emp-detail__role-badge">
                  <span class="emp-detail__role-label">{{ roleLabel(selected.role) }}</span>
                  <span class="status-badge" :class="'status--' + selected.status.toLowerCase()">{{ statusLabel(selected.status) }}</span>
                </div>
              </div>
            </div>
            <div class="emp-detail__contacts">
              <div class="emp-detail__contact">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.82 19a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 3.07 4.18 2 2 0 0 1 5.07 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L9.91 9.56a16 16 0 0 0 5.53 5.53l.62-.62a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                {{ selected.phone }}
              </div>
              <div class="emp-detail__contact" v-if="selected.email">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg>
                {{ selected.email }}
              </div>
              <div class="emp-detail__contact">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                {{ selected.department || 'Без подразделения' }}
              </div>
            </div>
            <div class="emp-detail__info-grid">
              <div class="emp-detail__info-row"><span>Логин (телефон)</span><strong>{{ employeeLogin(selected) }}</strong></div>
              <div class="emp-detail__info-row"><span>Должность</span><strong>{{ selected.position }}</strong></div>
              <div class="emp-detail__info-row">
                <span>Руководитель</span>
                <select class="emp-detail__manager-select" :value="selected.managerId ?? ''" @change="setManager">
                  <option value="">Не назначен</option>
                  <option v-for="manager in managerCandidates" :key="manager.id" :value="manager.id">{{ manager.name }}</option>
                </select>
              </div>
              <div class="emp-detail__info-row"><span>Дата приёма</span><strong>{{ formatDate(selected.hireDate) }}</strong></div>
              <div class="emp-detail__info-row"><span>Последний вход</span><strong>{{ selected.lastLogin }}</strong></div>
              <div class="emp-detail__info-row">
                <span>Адаптация</span>
                <div class="emp-detail__adapt">
                  <div class="adapt-cell__bar" style="width:80px"><div class="adapt-cell__fill" :style="{ width: adaptPct(selected) + '%', background: adaptColor(selected) }" /></div>
                  <strong>{{ adaptPct(selected) }}%</strong>
                </div>
              </div>
              <div class="emp-detail__info-row"><span>Доступ</span><span class="status-badge" :class="'status--' + selected.status.toLowerCase()">{{ statusLabel(selected.status) }}</span></div>
            </div>
            <div class="emp-detail__section">
              <p class="emp-detail__section-title">Адаптационная программа</p>
              <div class="emp-detail__adaptation-card">
                <p class="emp-detail__adaptation-name">Введение в систему и процессы</p>
                <div class="adapt-cell__bar" style="width:100%;margin:6px 0"><div class="adapt-cell__fill" :style="{ width: adaptPct(selected) + '%', background: adaptColor(selected) }" /></div>
                <p class="emp-detail__adaptation-due">Срок: {{ formatDate(addDays(selected.hireDate, 30)) }}</p>
              </div>
            </div>
            <div class="emp-detail__section">
              <p class="emp-detail__section-title">Роли и доступы</p>
              <div class="emp-detail__role-tags">
                <span class="emp-detail__role-tag">{{ roleLabel(selected.role) }}</span>
              </div>
            </div>
            <div class="emp-detail__section">
              <p class="emp-detail__section-title">Действия</p>
              <div class="emp-detail__actions">
                <button class="emp-detail__action emp-detail__action--primary">Редактировать</button>
                <button class="emp-detail__action emp-detail__action--secondary" @click="resetPassword">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                  Сформировать новый пароль
                </button>
                <button class="emp-detail__action emp-detail__action--danger" @click="toggleBlock">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  {{ selected.status === 'BLOCKED' ? 'Разблокировать' : 'Заблокировать' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
    <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="showAddModal" class="add-modal-overlay" @click.self="showAddModal = false">
        <div class="add-modal">
          <div class="add-modal__header">
            <h2>Добавить сотрудника</h2>
            <button class="emp-detail__close" @click="showAddModal = false">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="add-modal__body">
            <div class="add-modal__field"><label>ФИО *</label><input v-model="newEmp.name" placeholder="Иванов Иван Иванович" /></div>
            <div class="add-modal__field"><label>Телефон *</label><input v-model="newEmp.phone" placeholder="+7 (999) 999-99-99" type="tel" /></div>
            <div class="add-modal__field"><label>Email</label><input v-model="newEmp.email" placeholder="ivanov@servicegas.ru" type="email" /></div>
            <div class="add-modal__field"><label>Должность</label><input v-model="newEmp.position" placeholder="Инженер" /></div>
            <div class="add-modal__field">
              <label>Подразделение</label>
              <select v-model="newEmp.department">
                <option value="">Выберите</option>
                <option v-for="d in departments" :key="d" :value="d">{{ d }}</option>
              </select>
            </div>
            <div class="add-modal__field">
              <label>Роль</label>
              <select v-model="newEmp.role">
                <option value="EMPLOYEE">Сотрудник</option>
                <option value="HR">HR-менеджер</option>
              </select>
            </div>
            <div class="add-modal__field">
              <label>Руководитель</label>
              <select v-model="newEmp.managerId">
                <option value="">Не назначен</option>
                <option v-for="manager in availableManagers" :key="manager.id" :value="manager.id">{{ manager.name }}</option>
              </select>
            </div>
          </div>
          <div class="add-modal__footer">
            <button class="add-modal__cancel" @click="showAddModal = false">Отмена</button>
            <button class="add-modal__save" :disabled="!newEmp.name.trim() || !newEmp.phone.trim()" @click="addEmployee">Создать карточку</button>
          </div>
        </div>
      </div>
    </Transition>
    </Teleport>

    <!-- Модал сброса пароля -->
    <Teleport to="body">
      <div v-if="resetPasswordInfo" class="modal-overlay" @click.self="resetPasswordInfo=null">
        <div class="modal">
          <div class="modal__header">
            <h2>Новый пароль сформирован</h2>
            <button class="modal__close-btn" @click="resetPasswordInfo=null">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal__body">
            <div class="credential-info-banner" style="background:#fef3c7;border-color:#fde68a;color:#92400e">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              <div>
                <p style="font-weight:700;font-size:13px;color:#92400e;margin-bottom:4px">Новый постоянный пароль</p>
                <p style="font-size:12px;color:#92400e;line-height:1.5">Сообщите сотруднику новый пароль. Старый пароль больше не действует.</p>
              </div>
            </div>
            <div class="credential-code-block">
              <span class="credential-code">{{ resetPasswordInfo.password }}</span>
            </div>
            <div class="credential-details">
              <div><span>Сотрудник:</span><strong>{{ resetPasswordInfo.name }}</strong></div>
              <div><span>Логин:</span><strong>{{ resetPasswordInfo.login }}</strong></div>
            </div>
            <p class="credential-warning">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Пароль постоянный и будет скрыт после закрытия этого окна. Восстановить доступ повторно может только администратор.
            </p>
          </div>
          <div class="modal__footer">
            <button class="btn btn--primary" @click="resetPasswordInfo=null">Понятно</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Модал с паролем для нового сотрудника -->
    <Teleport to="body">
      <div v-if="newCredentialsInfo" class="modal-overlay" @click.self="newCredentialsInfo=null">
        <div class="modal">
          <div class="modal__header">
            <h2>Сотрудник добавлен</h2>
            <button class="modal__close-btn" @click="newCredentialsInfo=null">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal__body">
            <div class="credential-info-banner">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
              <div>
                <p style="font-weight:700;font-size:13px;color:#111827;margin-bottom:4px">Постоянные данные для входа</p>
                <p style="font-size:12px;color:#6b7280;line-height:1.5">Сообщите сотруднику логин и сгенерированный безопасный пароль.</p>
              </div>
            </div>
            <div class="credential-code-block">
              <span class="credential-code">{{ newCredentialsInfo.password }}</span>
            </div>
            <div class="credential-details">
              <div><span>Сотрудник:</span><strong>{{ newCredentialsInfo.name }}</strong></div>
              <div><span>Логин:</span><strong>{{ newCredentialsInfo.login }}</strong></div>
            </div>
            <p class="credential-warning">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Пароль действует постоянно до восстановления администратором и будет скрыт после закрытия этого окна.
            </p>
          </div>
          <div class="modal__footer">
            <button class="btn btn--primary" @click="newCredentialsInfo=null">Понятно</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { onboardingTasks } from '@/api/mockData'
import type { Employee, UserRole } from '@/api/mockData'
import { useToast } from '@/shared/composables/useToast'
import { useEmployeesStore } from '@/store/employees'
import { useAdaptationStore } from '@/store/adaptation'
import { employeeLogin } from '@/shared/utils/employeeCredentials'

const toast = useToast()
const empStore = useEmployeesStore()
const adaptStore = useAdaptationStore()
const employees = computed(() => empStore.employees)
const selected = ref<Employee | null>(null)
const search = ref('')
const filterDept = ref('')
const filterRole = ref('')
const filterStatus = ref('')
const filterAdapt = ref('')
const page = ref(1)
const perPage = ref(10)
const showAddModal = ref(false)
const newEmp = reactive({ name: '', phone: '', email: '', position: '', department: '', role: 'EMPLOYEE' as UserRole, managerId: '' })

const departments = computed(() =>
  [...new Set(employees.value.map(e => e.department).filter(Boolean))].sort() as string[]
)

const availableManagers = computed(() => employees.value.filter(e => e.status !== 'ARCHIVED'))
const managerCandidates = computed(() => availableManagers.value.filter(e => e.id !== selected.value?.id))

function adaptPct(emp: Employee) {
  const plan = adaptStore.findByEmployeeId(emp.id)
  if (plan) {
    if (!plan.tasks.length) return plan.progress
    return Math.round((plan.tasks.filter(task => task.done).length / plan.tasks.length) * 100)
  }
  if (!emp.onboardingProgress || onboardingTasks.length === 0) return 0
  return Math.round((emp.onboardingProgress.length / onboardingTasks.length) * 100)
}

function adaptColor(emp: Employee) {
  const p = adaptPct(emp)
  if (p === 100) return '#22c55e'
  if (p >= 50) return '#0079C2'
  if (p > 0) return '#f59e0b'
  return '#e5e7eb'
}

const filteredEmployees = computed(() => {
  let list = employees.value
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(e => e.name.toLowerCase().includes(q) || employeeLogin(e).toLowerCase().includes(q) || e.phone.includes(q) || (e.email ?? '').toLowerCase().includes(q))
  }
  if (filterDept.value)   list = list.filter(e => e.department === filterDept.value)
  if (filterRole.value)   list = list.filter(e => e.role === filterRole.value)
  if (filterStatus.value) list = list.filter(e => e.status === filterStatus.value)
  if (filterAdapt.value === 'done')     list = list.filter(e => adaptPct(e) === 100)
  if (filterAdapt.value === 'progress') list = list.filter(e => adaptPct(e) > 0 && adaptPct(e) < 100)
  if (filterAdapt.value === 'none')     list = list.filter(e => adaptPct(e) === 0)
  return list
})

const totalPages     = computed(() => Math.max(1, Math.ceil(filteredEmployees.value.length / perPage.value)))
const paginationFrom = computed(() => Math.min((page.value - 1) * perPage.value + 1, filteredEmployees.value.length))
const paginationTo   = computed(() => Math.min(page.value * perPage.value, filteredEmployees.value.length))
const paginatedEmployees = computed(() => filteredEmployees.value.slice((page.value - 1) * perPage.value, page.value * perPage.value))

const visiblePages = computed((): (number | string)[] => {
  const total = totalPages.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const cur = page.value
  if (cur <= 4) return [1, 2, 3, 4, 5, '...', total]
  if (cur >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  return [1, '...', cur - 1, cur, cur + 1, '...', total]
})

watch([search, filterDept, filterRole, filterStatus, filterAdapt], () => { page.value = 1 })

function resetFilters() { search.value = ''; filterDept.value = ''; filterRole.value = ''; filterStatus.value = ''; filterAdapt.value = '' }
function selectEmployee(emp: Employee) { selected.value = selected.value?.id === emp.id ? null : emp }

function toggleBlock() {
  if (!selected.value) return
  const newStatus = selected.value.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED'
  empStore.updateEmployee(selected.value.id, { status: newStatus })
  selected.value = { ...selected.value, status: newStatus }
  toast.success(newStatus === 'BLOCKED' ? 'Доступ заблокирован' : 'Доступ восстановлен')
}

function setManager(event: Event) {
  if (!selected.value) return
  const managerId = (event.target as HTMLSelectElement).value || undefined
  empStore.updateEmployee(selected.value.id, { managerId })
  selected.value = { ...selected.value, managerId }
  toast.success(managerId ? 'Руководитель назначен' : 'Руководитель снят')
}

function initials(name: string) { return name.split(' ').map(w => w[0]).slice(0, 2).join('') }
const COLORS = ['#0079C2', '#8b5cf6', '#22c55e', '#f59e0b', '#ec4899', '#14b8a6', '#f97316']
function avatarColor(name: string) { return COLORS[name.charCodeAt(0) % COLORS.length] }
function roleLabel(r: string) { return r === 'HR' ? 'HR-менеджер' : 'Сотрудник' }
function statusLabel(s: string) { return ({ ACTIVE: 'Активен', INVITED: 'Приглашён', BLOCKED: 'Заблокирован', ARCHIVED: 'Архивный' } as Record<string,string>)[s] ?? s }
function formatDate(d: string) { if (!d) return '—'; return new Date(d).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) }
function addDays(date: string, days: number) { if (!date) return ''; const d = new Date(date); d.setDate(d.getDate() + days); return d.toISOString().split('T')[0] }

const newCredentialsInfo = ref<{ name: string; login: string; password: string } | null>(null)
const resetPasswordInfo = ref<{ name: string; login: string; password: string } | null>(null)

function resetPassword() {
  if (!selected.value) return
  const password = empStore.resetPassword(selected.value.id)
  resetPasswordInfo.value = { name: selected.value.name, login: employeeLogin(selected.value), password }
}

function addEmployee() {
  if (!newEmp.name.trim() || !newEmp.phone.trim()) return
  if (empStore.findByPhone(newEmp.phone)) {
    toast.warning('Этот номер телефона уже зарегистрирован')
    return
  }
  const { employee: emp, password } = empStore.addEmployee({
    name: newEmp.name, phone: newEmp.phone, email: newEmp.email,
    position: newEmp.position, department: newEmp.department, role: newEmp.role as UserRole, managerId: newEmp.managerId,
  })
  showAddModal.value = false
  Object.assign(newEmp, { name: '', phone: '', email: '', position: '', department: '', role: 'EMPLOYEE', managerId: '' })
  newCredentialsInfo.value = { name: emp.name, login: employeeLogin(emp), password }
}
</script>

<style scoped>
.emp-page { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
.emp-page__header { display: flex; align-items: center; justify-content: space-between; }
.emp-page__title { font-size: 22px; font-weight: 800; color: #111827; }
.emp-page__add-btn { display: flex; align-items: center; gap: 8px; padding: 9px 18px; background: #0079C2; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: var(--font-body); transition: background 0.15s; }
.emp-page__add-btn:hover { background: #0069aa; }
.emp-page__body { display: flex; gap: 20px; align-items: flex-start; }
.emp-page__table-col { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 12px; }
.emp-page__search-wrap { background: #fff; border: 1px solid #e5e9ef; border-radius: 10px; padding: 0 14px; }
.emp-page__search { display: flex; align-items: center; gap: 8px; height: 44px; color: #9ca3af; }
.emp-page__search-input { flex: 1; border: none; outline: none; font-size: 14px; color: #111827; font-family: var(--font-body); background: transparent; }
.emp-page__search-input::placeholder { color: #9ca3af; }
.emp-page__filters { display: flex; align-items: flex-end; gap: 10px; flex-wrap: nowrap; overflow-x: auto; background: #fff; border: 1px solid #e5e9ef; border-radius: 10px; padding: 12px 16px; }
.emp-page__filter-group { display: flex; flex-direction: column; gap: 4px; }
.emp-page__filter-label { font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.04em; }
.emp-page__filter-select { padding: 6px 26px 6px 10px; border: 1.5px solid #e5e9ef; border-radius: 7px; font-size: 13px; color: #374151; font-family: var(--font-body); background: #f9fafb; appearance: none; min-width: 110px; cursor: pointer; }
.emp-page__filter-select:focus { outline: none; border-color: #0079C2; }
.emp-page__reset-btn { display: flex; align-items: center; gap: 5px; padding: 7px 14px; border: 1.5px solid #e5e9ef; border-radius: 7px; font-size: 13px; color: #6b7280; cursor: pointer; font-family: var(--font-body); background: transparent; transition: all 0.15s; margin-left: auto; }
.emp-page__reset-btn:hover { border-color: #0079C2; color: #0079C2; }
.emp-table-wrap { background: #fff; border: 1px solid #e5e9ef; border-radius: 10px; overflow: hidden; overflow-x: auto; }
.emp-table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 720px; }
.emp-table th { padding: 11px 14px; text-align: left; font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; background: #f9fafb; border-bottom: 1px solid #e5e9ef; white-space: nowrap; }
.emp-table td { padding: 12px 14px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
.emp-table__row { cursor: pointer; transition: background 0.12s; }
.emp-table__row:hover { background: #f9fafb; }
.emp-table__row.is-selected { background: #f0f7ff; }
.emp-table__row:last-child td { border-bottom: none; }
.emp-table__name-cell { display: flex; align-items: center; gap: 10px; }
.emp-table__avatar { width: 34px; height: 34px; border-radius: 8px; color: #fff; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.emp-table__full-name { font-weight: 600; color: #111827; line-height: 1.3; }
.emp-table__position { font-size: 11px; color: #9ca3af; }
.emp-table__phone { color: #374151; white-space: nowrap; font-size: 12px; }
.emp-table__dept { color: #6b7280; font-size: 12px; }
.emp-table__role-cell { color: #374151; font-size: 12px; }
.emp-table__login { color: #9ca3af; font-size: 12px; white-space: nowrap; }
.emp-table__dash { color: #d1d5db; }
.status-badge { font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 5px; white-space: nowrap; }
.status--active   { background: #dcfce7; color: #166534; }
.status--invited  { background: #dbeafe; color: #1d4ed8; }
.status--blocked  { background: #fee2e2; color: #dc2626; }
.status--archived { background: #f3f4f6; color: #6b7280; }
.adapt-cell { display: flex; align-items: center; gap: 8px; }
.adapt-cell__bar { height: 6px; background: #f3f4f6; border-radius: 3px; flex: 1; min-width: 50px; overflow: hidden; }
.adapt-cell__fill { height: 100%; border-radius: 3px; transition: width 0.3s; }
.adapt-cell__pct { font-size: 12px; font-weight: 600; color: #374151; white-space: nowrap; }
.emp-table__action-btn { background: none; border: none; color: #9ca3af; cursor: pointer; padding: 4px 6px; border-radius: 5px; transition: all 0.12s; }
.emp-table__action-btn:hover { background: #f3f4f6; color: #374151; }
.emp-table__empty { padding: 32px; text-align: center; color: #9ca3af; font-size: 14px; }
.emp-page__pagination { display: flex; align-items: center; gap: 8px; background: #fff; border: 1px solid #e5e9ef; border-radius: 10px; padding: 10px 16px; }
.emp-page__pagination-info { font-size: 13px; color: #6b7280; flex: 1; }
.emp-page__pagination-btns { display: flex; align-items: center; gap: 4px; }
.emp-page__pg-btn { min-width: 32px; height: 32px; border: 1.5px solid #e5e9ef; background: #fff; border-radius: 6px; font-size: 13px; font-weight: 500; color: #374151; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.12s; font-family: var(--font-body); }
.emp-page__pg-btn:hover:not(:disabled) { border-color: #0079C2; color: #0079C2; }
.emp-page__pg-btn.is-active { background: #0079C2; border-color: #0079C2; color: #fff; font-weight: 700; }
.emp-page__pg-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.emp-page__per-page { padding: 5px 8px; border: 1.5px solid #e5e9ef; border-radius: 6px; font-size: 13px; color: #374151; font-family: var(--font-body); background: #f9fafb; cursor: pointer; }
.emp-detail { width: 320px; flex-shrink: 0; background: #fff; border: 1px solid #e5e9ef; border-radius: 12px; overflow: hidden; position: sticky; top: 80px; }
.emp-detail__header { display: flex; align-items: center; justify-content: space-between; padding: 16px 18px; border-bottom: 1px solid #f3f4f6; }
.emp-detail__heading { font-size: 15px; font-weight: 700; color: #111827; }
.emp-detail__close { width: 30px; height: 30px; border-radius: 6px; background: #f3f4f6; border: none; color: #6b7280; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.15s; }
.emp-detail__close:hover { background: #e5e7eb; }
.emp-detail__body { padding: 16px 18px; display: flex; flex-direction: column; gap: 16px; max-height: calc(100vh - 180px); overflow-y: auto; }
.emp-detail__identity { display: flex; align-items: center; gap: 12px; }
.emp-detail__avatar { width: 44px; height: 44px; border-radius: 10px; color: #fff; font-size: 15px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.emp-detail__name { font-size: 14px; font-weight: 700; color: #111827; line-height: 1.3; }
.emp-detail__role-badge { display: flex; align-items: center; gap: 6px; margin-top: 3px; }
.emp-detail__role-label { font-size: 12px; color: #6b7280; }
.emp-detail__contacts { display: flex; flex-direction: column; gap: 7px; }
.emp-detail__contact { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #374151; }
.emp-detail__contact svg { color: #9ca3af; flex-shrink: 0; }
.emp-detail__info-grid { border: 1px solid #f3f4f6; border-radius: 8px; overflow: hidden; }
.emp-detail__info-row { display: flex; align-items: center; justify-content: space-between; padding: 9px 12px; border-bottom: 1px solid #f3f4f6; font-size: 12px; gap: 8px; }
.emp-detail__info-row:last-child { border-bottom: none; }
.emp-detail__info-row > span:first-child { color: #9ca3af; flex-shrink: 0; }
.emp-detail__info-row strong { color: #111827; font-weight: 600; text-align: right; }
.emp-detail__manager-select { max-width: 170px; padding: 5px 8px; border: 1px solid #dbe1e8; border-radius: 6px; background: #fff; color: #111827; font: 600 12px var(--font-body); }
.emp-detail__adapt { display: flex; align-items: center; gap: 6px; }
.emp-detail__section-title { font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px; }
.emp-detail__adaptation-card { background: #f9fafb; border: 1px solid #e5e9ef; border-radius: 8px; padding: 10px 12px; }
.emp-detail__adaptation-name { font-size: 13px; font-weight: 600; color: #111827; }
.emp-detail__adaptation-due  { font-size: 11px; color: #9ca3af; }
.emp-detail__role-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.emp-detail__role-tag { font-size: 12px; font-weight: 600; padding: 4px 10px; background: #dbeafe; color: #1d4ed8; border-radius: 5px; }
.emp-detail__actions { display: flex; flex-direction: column; gap: 8px; }
.emp-detail__action { width: 100%; padding: 9px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: var(--font-body); display: flex; align-items: center; justify-content: center; gap: 6px; border: none; transition: all 0.15s; }
.emp-detail__action--primary { background: #0079C2; color: #fff; }
.emp-detail__action--primary:hover { background: #0069aa; }
.emp-detail__action--secondary { background: #f3f4f6; color: #374151; border: 1.5px solid #e5e9ef; }
.emp-detail__action--secondary:hover { background: #e5e7eb; }
.emp-detail__action--danger { background: #fff; color: #dc2626; border: 1.5px solid #fecaca; }
.emp-detail__action--danger:hover { background: #fee2e2; }
.detail-panel-enter-active, .detail-panel-leave-active { transition: all 0.25s ease; }
.detail-panel-enter-from, .detail-panel-leave-to { opacity: 0; transform: translateX(24px); }
.add-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 600; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(3px); }
.add-modal { background: #fff; border-radius: 14px; width: 100%; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.18); }
.add-modal__header { display: flex; align-items: center; justify-content: space-between; padding: 18px 20px; border-bottom: 1px solid #f3f4f6; }
.add-modal__header h2 { font-size: 16px; font-weight: 700; color: #111827; }
.add-modal__body { padding: 16px 20px; display: flex; flex-direction: column; gap: 12px; max-height: 60vh; overflow-y: auto; }
.add-modal__field { display: flex; flex-direction: column; gap: 5px; }
.add-modal__field label { font-size: 12px; font-weight: 600; color: #6b7280; }
.add-modal__field input, .add-modal__field select { padding: 9px 12px; border: 1.5px solid #e5e9ef; border-radius: 8px; font-size: 14px; color: #111827; font-family: var(--font-body); background: #f9fafb; outline: none; transition: border-color 0.15s; }
.add-modal__field input:focus, .add-modal__field select:focus { border-color: #0079C2; background: #fff; }
.add-modal__footer { display: flex; gap: 10px; padding: 16px 20px; border-top: 1px solid #f3f4f6; }
.add-modal__cancel { flex: 1; padding: 10px; border: 1.5px solid #e5e9ef; border-radius: 8px; font-size: 14px; font-weight: 600; color: #6b7280; cursor: pointer; font-family: var(--font-body); background: #f9fafb; transition: all 0.15s; }
.add-modal__cancel:hover { background: #e5e7eb; }
.add-modal__save { flex: 2; padding: 10px; background: #0079C2; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: var(--font-body); transition: background 0.15s; }
.add-modal__save:hover:not(:disabled) { background: #0069aa; }
.add-modal__save:disabled { opacity: 0.4; cursor: not-allowed; }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.25s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
/* Модальные окна учётных данных */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 16px; }
.modal { background: #fff; border-radius: 16px; width: 100%; max-width: 420px; box-shadow: 0 24px 64px rgba(0,0,0,0.25); }
.modal__header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid #f3f4f6; }
.modal__header h2 { font-size: 16px; font-weight: 700; color: #111827; }
.modal__close-btn { width: 32px; height: 32px; border-radius: 6px; background: #f3f4f6; border: none; color: #6b7280; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.modal__body { padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; }
.modal__footer { padding: 16px 24px; border-top: 1px solid #f3f4f6; display: flex; justify-content: flex-end; }
.credential-info-banner { display: flex; gap: 12px; align-items: flex-start; background: #e0f2fe; border: 1px solid #bae6fd; border-radius: 10px; padding: 14px; color: #0369a1; }
.credential-code-block { display: flex; align-items: center; justify-content: center; background: #f0fdf4; border: 2px dashed #86efac; border-radius: 12px; padding: 20px; }
.credential-code { max-width: 100%; overflow-wrap: anywhere; font-size: 25px; font-weight: 800; letter-spacing: 3px; color: #15803d; font-family: monospace; text-align: center; }
.credential-details { display: flex; flex-direction: column; gap: 6px; }
.credential-details div { display: flex; justify-content: space-between; gap: 12px; font-size: 13px; }
.credential-details span { color: #6b7280; }
.credential-details strong { color: #111827; overflow-wrap: anywhere; text-align: right; }
.credential-warning { display: flex; gap: 6px; align-items: flex-start; font-size: 12px; color: #92400e; background: #fffbeb; border-radius: 8px; padding: 10px; line-height: 1.5; }
.btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 20px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; font-family: inherit; transition: all 0.15s; }
.btn--primary { background: #0079C2; color: #fff; } .btn--primary:hover { background: #005fa3; }
</style>
