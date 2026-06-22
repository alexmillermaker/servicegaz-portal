<template>
  <div class="settings-page">
    <div class="settings-page__header">
      <h1 class="settings-page__title">Настройки системы</h1>
      <p class="settings-page__sub">Конфигурация платформы ГК «СЕРВИСГАЗ»</p>
    </div>

    <div class="settings-layout">
      <!-- Вертикальные табы -->
      <div class="settings-nav">
        <button v-for="tab in tabs" :key="tab.key" class="settings-nav__item" :class="{ 'settings-nav__item--active': activeTab === tab.key }" @click="activeTab = tab.key">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" class="settings-nav__icon">
            <template v-if="tab.key === 'company'">
              <path d="M3 21h18 M9 8h1 M9 12h1 M9 16h1 M14 8h1 M14 12h1 M14 16h1 M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/>
            </template>
            <template v-else-if="tab.key === 'access'">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </template>
            <template v-else-if="tab.key === 'auth'">
              <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
            </template>
            <template v-else-if="tab.key === 'notifications'">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </template>
            <template v-else-if="tab.key === 'integrations'">
              <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/>
            </template>
          </svg>
          <span>{{ tab.label }}</span>
        </button>
      </div>

      <!-- Контент -->
      <div class="settings-content">

        <!-- ── Компания ── -->
        <div v-if="activeTab === 'company'" class="settings-section">
          <h2 class="settings-section__title">Информация о компании</h2>
          <div class="settings-form">
            <div class="form-row">
              <label class="form-label">Полное наименование</label>
              <input v-model="company.name" class="form-input" />
            </div>
            <div class="form-row">
              <label class="form-label">Короткое название (для интерфейса)</label>
              <input v-model="company.shortName" class="form-input" />
            </div>
            <div class="form-row-2">
              <div><label class="form-label">ИНН</label><input v-model="company.inn" class="form-input" /></div>
              <div><label class="form-label">КПП</label><input v-model="company.kpp" class="form-input" /></div>
            </div>
            <div class="form-row">
              <label class="form-label">Юридический адрес</label>
              <input v-model="company.address" class="form-input" />
            </div>
            <div class="form-row">
              <label class="form-label">Сайт</label>
              <input v-model="company.website" class="form-input" placeholder="https://..." />
            </div>
            <div class="form-row">
              <label class="form-label">Логотип</label>
              <div class="logo-upload">
                <img src="/servisgaz-logo.png" class="logo-upload__preview" alt="лого" />
                <button class="btn btn--outline btn--sm">Заменить</button>
              </div>
            </div>
            <div class="form-actions">
              <button class="btn btn--primary" @click="saveSection">Сохранить изменения</button>
            </div>
          </div>
        </div>

        <!-- ── Список доступа ── -->
        <div v-if="activeTab === 'access'" class="settings-section">
          <h2 class="settings-section__title">Список доступа</h2>
          <div class="access-info-banner">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>Войти могут только сотрудники с карточкой и активным доступом. Логин всегда равен номеру телефона, постоянный пароль формирует администратор.</span>
          </div>

          <!-- Создание карточки выполняется в едином разделе сотрудников -->
          <div class="access-add">
            <div style="flex:1">
              <p style="font-size:13px;font-weight:700;color:#111827">Новая учётная запись создаётся вместе с карточкой сотрудника</p>
              <p style="font-size:12px;color:#6b7280;margin-top:3px">Так логин, контакты, должность и роль остаются в одном источнике данных.</p>
            </div>
            <RouterLink class="btn btn--primary" to="/admin/employees">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Создать карточку
            </RouterLink>
          </div>

          <!-- Поиск -->
          <div class="search-wrap" style="margin-bottom:4px">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="search-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input v-model="accessSearch" class="search-input" placeholder="Поиск по логину, телефону или имени…" />
          </div>

          <!-- Список -->
          <div class="access-list">
            <div class="access-list__header">
              <span>Логин</span><span>ФИО</span><span>Роль</span><span>Доступ</span><span>Принят</span><span></span>
            </div>
            <div v-for="emp in filteredAccess" :key="emp.id" class="access-row">
              <span class="access-phone">{{ employeeLogin(emp) }}</span>
              <span class="access-name">{{ emp.name }}</span>
              <span>
                <span class="role-badge" :class="emp.role === 'HR' ? 'role-badge--hr' : 'role-badge--employee'">
                  {{ emp.role === 'HR' ? 'HR' : 'Сотрудник' }}
                </span>
              </span>
              <span>
                <button
                  class="toggle-btn toggle-btn--sm"
                  :class="{ 'toggle-btn--on': emp.status === 'ACTIVE' || emp.status === 'INVITED' }"
                  @click="toggleAccess(emp.id, emp.status)"
                  :title="emp.status === 'BLOCKED' ? 'Разрешить доступ' : 'Заблокировать'"
                >
                  <span class="toggle-btn__knob"></span>
                </button>
              </span>
              <span class="access-date">{{ emp.hireDate ? new Date(emp.hireDate).toLocaleDateString('ru-RU') : '—' }}</span>
              <div style="display:flex;gap:4px">
                <button class="icon-btn" @click="resetPassword(emp.id)" title="Сформировать новый пароль">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                </button>
                <button class="icon-btn icon-btn--danger" @click="removeAccess(emp.id)" title="Удалить из системы">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                </button>
              </div>
            </div>
            <div v-if="filteredAccess.length === 0" class="access-empty">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              <p>Нет записей, соответствующих фильтру</p>
            </div>
          </div>
          <div class="access-footer">
            <span class="access-count">
              {{ accessList.filter(e=>e.status==='ACTIVE'||e.status==='INVITED').length }} активных &nbsp;·&nbsp; {{ accessList.length }} всего
            </span>
          </div>
        </div>

        <!-- ── Авторизация ── -->
        <div v-if="activeTab === 'auth'" class="settings-section">
          <h2 class="settings-section__title">Авторизация</h2>
          <div class="auth-method-block">
            <div class="auth-method-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <div>
                <div style="font-size:13px;font-weight:700;color:#111827">Постоянный логин + пароль</div>
                <div style="font-size:12px;color:#6b7280">Пароль генерируется безопасным способом. Восстановить доступ может только администратор.</div>
              </div>
              <span class="auth-method-active">Активен</span>
            </div>
          </div>

          <div class="settings-form" style="margin-top:20px">
            <div class="form-row-2">
              <div>
                <label class="form-label">Стандарт пароля</label>
                <div class="form-input" style="display:flex;align-items:center;background:#f8fafc;color:#374151">Не менее 12 символов разных типов</div>
              </div>
              <div>
                <label class="form-label">Срок сессии (часы)</label>
                <input v-model.number="auth.sessionHours" type="number" min="1" max="720" class="form-input" />
              </div>
            </div>
            <div class="form-row-2">
              <div>
                <label class="form-label">Макс. попыток входа</label>
                <input v-model.number="auth.maxAttempts" type="number" min="1" max="10" class="form-input" />
              </div>
              <div>
                <label class="form-label">Блокировка после превышения (мин)</label>
                <input v-model.number="auth.lockMin" type="number" min="1" max="60" class="form-input" />
              </div>
            </div>

            <div class="toggle-row" v-for="s in authToggles" :key="s.key">
              <div>
                <div class="toggle-row__label">{{ s.label }}</div>
                <div class="toggle-row__desc">{{ s.desc }}</div>
              </div>
              <button class="toggle-btn" :class="{ 'toggle-btn--on': s.enabled }" @click="s.enabled = !s.enabled">
                <span class="toggle-btn__knob"></span>
              </button>
            </div>
            <div class="form-actions">
              <button class="btn btn--primary" @click="saveSection">Сохранить</button>
            </div>
          </div>
        </div>

        <!-- ── Уведомления ── -->
        <div v-if="activeTab === 'notifications'" class="settings-section">
          <h2 class="settings-section__title">Уведомления</h2>
          <div class="settings-form">
            <div class="toggle-row" v-for="n in notificationSettings" :key="n.key">
              <div>
                <div class="toggle-row__label">{{ n.label }}</div>
                <div class="toggle-row__desc">{{ n.desc }}</div>
              </div>
              <button class="toggle-btn" :class="{ 'toggle-btn--on': n.enabled }" @click="n.enabled = !n.enabled">
                <span class="toggle-btn__knob"></span>
              </button>
            </div>
            <div class="form-row">
              <label class="form-label">Email для системных уведомлений</label>
              <input v-model="notifEmail" class="form-input" placeholder="admin@servisgas.ru" />
            </div>
            <div class="form-actions">
              <button class="btn btn--primary" @click="saveSection">Сохранить</button>
            </div>
          </div>
        </div>

        <!-- ── Интеграции ── -->
        <div v-if="activeTab === 'integrations'" class="settings-section">
          <h2 class="settings-section__title">Интеграции</h2>
          <div class="integrations-grid">
            <div v-for="integ in integrations" :key="integ.name" class="integ-card">
              <div class="integ-card__head">
                <div class="integ-card__icon" :style="{ background: integ.color + '22', color: integ.color }">{{ integ.abbr }}</div>
                <div class="integ-card__info">
                  <span class="integ-card__name">{{ integ.name }}</span>
                  <span class="integ-card__desc">{{ integ.desc }}</span>
                </div>
                <span class="integ-status" :class="`integ-status--${integ.status}`">{{ integ.status === 'connected' ? 'Подключено' : 'Откл.' }}</span>
              </div>
              <div class="integ-card__actions">
                <button v-if="integ.status === 'connected'" class="btn btn--outline btn--sm" @click="integ.status = 'disconnected'">Отключить</button>
                <button v-else class="btn btn--primary btn--sm" @click="integ.status = 'connected'">Подключить</button>
                <button class="btn btn--outline btn--sm" @click="configInteg(integ)">Настроить</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Модал настройки интеграции -->
    <Teleport to="body">
      <div v-if="showConfig && configTarget" class="modal-overlay" @click.self="showConfig = false">
        <div class="modal">
          <div class="modal__header">
            <h2>Настройка: {{ configTarget.name }}</h2>
            <button class="modal__close" @click="showConfig = false">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal__body">
            <div class="form-row">
              <label class="form-label">API URL / Endpoint</label>
              <input v-model="configTarget.apiUrl" class="form-input" placeholder="https://api.example.ru/v1" />
            </div>
            <div class="form-row">
              <label class="form-label">API Ключ / Токен</label>
              <input v-model="configTarget.apiKey" class="form-input" type="password" placeholder="••••••••••••••••" />
            </div>
            <div class="form-row">
              <label class="form-label">Периодичность синхронизации</label>
              <select v-model="configTarget.syncInterval" class="form-input">
                <option value="realtime">В реальном времени</option>
                <option value="15min">Каждые 15 минут</option>
                <option value="1h">Каждый час</option>
                <option value="daily">Раз в день</option>
              </select>
            </div>
          </div>
          <div class="modal__footer">
            <button class="btn btn--outline" @click="showConfig = false">Отмена</button>
            <button class="btn btn--primary" @click="showConfig = false; saveSection()">Сохранить</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Подтверждение удаления из системы -->
    <Teleport to="body">
      <div v-if="removeTarget !== null" class="modal-overlay" @click.self="removeTarget=null">
        <div class="modal modal--sm">
          <div class="modal__header">
            <h2>Удалить из системы?</h2>
            <button class="modal__close" @click="removeTarget=null">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal__body">
            <p style="font-size:14px;color:#374151;line-height:1.6">
              Сотрудник <b>{{ empStore.employees.find(e=>e.id===removeTarget)?.name }}</b>
              будет полностью удалён из системы и потеряет доступ немедленно.
            </p>
          </div>
          <div class="modal__footer">
            <button class="btn btn--outline" @click="removeTarget=null">Отмена</button>
            <button class="btn btn--danger" @click="doRemoveAccess">Удалить</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Новый постоянный пароль после восстановления администратором -->
    <Teleport to="body">
      <div v-if="passwordInfo" class="modal-overlay" @click.self="passwordInfo=null">
        <div class="modal modal--sm">
          <div class="modal__header">
            <h2>Новый пароль</h2>
            <button class="modal__close" @click="passwordInfo=null">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal__body">
            <div class="credential-info-banner">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
              <div>
                <p style="font-weight:700;font-size:13px;color:#0369a1;margin-bottom:2px">Сообщите новые данные сотруднику</p>
                <p style="font-size:12px;color:#0369a1">Логин: {{ passwordInfo.login }}</p>
              </div>
            </div>
            <div class="credential-code-block">
              <span class="credential-code">{{ passwordInfo.password }}</span>
            </div>
            <div style="font-size:12px;color:#6b7280;text-align:center">{{ passwordInfo.name }}</div>
            <p style="font-size:11px;color:#92400e;background:#fffbeb;border-radius:8px;padding:10px;line-height:1.5">
              Старый пароль больше не действует. Новый пароль постоянный и будет скрыт после закрытия окна.
            </p>
          </div>
          <div class="modal__footer">
            <button class="btn btn--primary" style="width:100%" @click="passwordInfo=null">Понятно</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useEmployeesStore } from '@/store/employees'
import { useToast } from '@/shared/composables/useToast'
import { employeeLogin } from '@/shared/utils/employeeCredentials'

const activeTab = ref('access')
const toast = useToast()

const tabs = [
  { key: 'company',       label: 'Компания'       },
  { key: 'access',        label: 'Список доступа' },
  { key: 'auth',          label: 'Авторизация'    },
  { key: 'notifications', label: 'Уведомления'    },
  { key: 'integrations',  label: 'Интеграции'     },
]

// Компания
const company = reactive({ name: 'ГК «СЕРВИСГАЗ»', shortName: 'СЕРВИСГАЗ', inn: '7701234567', kpp: '770101001', address: 'г. Москва, ул. Газовиков, 12', website: 'https://servisgas.ru' })

// Список доступа — использует единый store сотрудников
const empStore = useEmployeesStore()

// Все сотрудники как «whitelist» (не архивированные)
const accessList = computed(() =>
  empStore.employees.filter(e => e.status !== 'ARCHIVED')
)

const accessSearch = ref('')
const removeTarget = ref<string | null>(null)  // employee id

const passwordInfo = ref<{ name: string; login: string; password: string } | null>(null)

const filteredAccess = computed(() => {
  const list = accessList.value
  if (!accessSearch.value.trim()) return list
  const q = accessSearch.value.toLowerCase()
  return list.filter(e => employeeLogin(e).toLowerCase().includes(q) || e.phone.includes(q) || e.name.toLowerCase().includes(q))
})

function toggleAccess(id: string, currentStatus: string) {
  const active = currentStatus === 'ACTIVE' || currentStatus === 'INVITED'
  empStore.setAccess(id, !active)
  showSavedMsg(active ? 'Доступ заблокирован' : 'Доступ разрешён')
}

function removeAccess(id: string) { removeTarget.value = id }
function doRemoveAccess() {
  if (removeTarget.value) {
    empStore.removeEmployee(removeTarget.value)
    removeTarget.value = null
    showSavedMsg('Сотрудник удалён из системы')
  }
}

function resetPassword(id: string) {
  const password = empStore.resetPassword(id)
  const emp = empStore.employees.find(e => e.id === id)
  if (emp) passwordInfo.value = { name: emp.name, login: employeeLogin(emp), password }
}

// Авторизация (пароли)
const auth = reactive({ sessionHours: 8, maxAttempts: 3, lockMin: 15 })
const authToggles = reactive([
  { key: 'single_session',  label: 'Одна активная сессия',       desc: 'Новый вход автоматически завершает предыдущую сессию', enabled: true  },
  { key: 'notify_login',    label: 'Уведомлять при входе',       desc: 'Фиксировать каждый успешный вход сотрудника в журнале', enabled: false },
])

// Уведомления
const notifEmail = ref('admin@servisgas.ru')
const notificationSettings = reactive([
  { key: 'new_employee',       label: 'Новый сотрудник',         desc: 'Уведомлять при добавлении нового сотрудника',               enabled: true  },
  { key: 'adaptation_overdue', label: 'Просрочка адаптации',     desc: 'Уведомлять при пропуске дедлайна по адаптации',             enabled: true  },
  { key: 'document_expiry',    label: 'Истечение документа',     desc: 'Напоминать за 30 дней до истечения срока документа',        enabled: true  },
  { key: 'login_failed',       label: 'Неудачный вход',          desc: 'Уведомлять при многократных неудачных попытках входа',      enabled: false },
])

interface Integration {
  name: string
  abbr: string
  desc: string
  color: string
  status: 'connected' | 'disconnected'
  apiUrl: string
  apiKey: string
  syncInterval: string
}

const integrations = reactive<Integration[]>([
  { name: '1С:Предприятие', abbr: '1С', desc: 'Синхронизация кадровых данных',         color: '#ef4444', status: 'connected',    apiUrl: 'https://1c.servisgas.ru/api', apiKey: '', syncInterval: '1h'       },
  { name: 'Active Directory', abbr: 'AD', desc: 'Единый вход через корпоративный аккаунт', color: '#0079C2', status: 'connected',    apiUrl: 'ldap://ad.servisgas.ru',      apiKey: '', syncInterval: 'realtime' },
  { name: 'СБИС',            abbr: 'СБ', desc: 'Электронный документооборот',           color: '#22c55e', status: 'disconnected', apiUrl: '',                            apiKey: '', syncInterval: 'daily'    },
  { name: 'Telegram Bot',    abbr: 'TG', desc: 'Уведомления в Telegram',                color: '#2fa8d5', status: 'disconnected', apiUrl: 'https://api.telegram.org',    apiKey: '', syncInterval: 'realtime' },
])

const configTarget = ref<Integration | null>(null)
const showConfig = ref(false)

function configInteg(integ: Integration) { configTarget.value = integ; showConfig.value = true }

function showSavedMsg(msg = 'Настройки сохранены', type: 'success' | 'warning' = 'success') {
  if (type === 'warning') toast.warning(msg)
  else toast.success(msg)
}
function saveSection() { showSavedMsg() }
</script>

<style scoped>
.settings-page { width: 100%; }
.settings-page__header { margin-bottom: 24px; }
.settings-page__title { font-size: 22px; font-weight: 800; color: #111827; margin-bottom: 4px; }
.settings-page__sub { font-size: 13px; color: #6b7280; }

.settings-layout { display: grid; grid-template-columns: 210px 1fr; gap: 20px; align-items: start; }

.settings-nav { display: flex; flex-direction: column; gap: 2px; background: #fff; border-radius: 12px; border: 1px solid #e5e9ef; padding: 8px; position: sticky; top: 76px; }
.settings-nav__item { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 8px; border: none; background: transparent; font-size: 13px; font-weight: 500; color: #6b7280; cursor: pointer; text-align: left; transition: all 0.15s; font-family: inherit; }
.settings-nav__item:hover { background: #f3f4f6; color: #111827; }
.settings-nav__item--active { background: #e0f2fe; color: #0079C2; font-weight: 700; }
.settings-nav__icon { display: flex; align-items: center; flex-shrink: 0; }

.settings-content { background: #fff; border-radius: 12px; border: 1px solid #e5e9ef; }
.settings-section { padding: 24px; }
.settings-section__title { font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid #f3f4f6; }

.settings-form { display: flex; flex-direction: column; gap: 16px; }
.form-row { display: flex; flex-direction: column; gap: 6px; }
.form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-row-2 > div { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 12px; font-weight: 700; color: #374151; }
.form-input { width: 100%; padding: 9px 12px; border-radius: 8px; border: 1px solid #e5e9ef; font-size: 13px; outline: none; background: #f9fafb; color: #111827; font-family: inherit; transition: border-color 0.15s; }
.form-input:focus { border-color: #0079C2; background: #fff; }
.form-actions { padding-top: 8px; border-top: 1px solid #f3f4f6; }

.logo-upload { display: flex; align-items: center; gap: 12px; }
.logo-upload__preview { width: 48px; height: 48px; object-fit: contain; border-radius: 8px; border: 1px solid #e5e9ef; padding: 4px; }

/* Список доступа */
.access-info-banner {
  display: flex; align-items: flex-start; gap: 10px; background: #e0f2fe; border: 1px solid #bae6fd;
  border-radius: 10px; padding: 12px 16px; font-size: 13px; color: #0369a1; margin-bottom: 20px; line-height: 1.5;
}
.access-info-banner svg { flex-shrink: 0; margin-top: 1px; }

.access-add { display: flex; gap: 10px; align-items: flex-end; flex-wrap: wrap; margin-bottom: 12px; }

.input-with-prefix { position: relative; }
.input-prefix {
  position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
  font-size: 13px; font-weight: 600; color: #374151; pointer-events: none;
}

.search-wrap { position: relative; }
.search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #9ca3af; pointer-events: none; }
.search-input { width: 100%; padding: 8px 12px 8px 32px; border-radius: 8px; border: 1px solid #e5e9ef; font-size: 13px; outline: none; background: #f9fafb; color: #111827; font-family: inherit; }
.search-input:focus { border-color: #0079C2; background: #fff; }

.access-list { border: 1px solid #e5e9ef; border-radius: 10px; overflow: hidden; margin-top: 4px; }
.access-list__header {
  display: grid; grid-template-columns: 160px 1fr 100px 70px 100px 40px;
  gap: 10px; padding: 9px 14px; background: #f8fafc; border-bottom: 1px solid #e5e9ef;
  font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;
}
.access-row {
  display: grid; grid-template-columns: 160px 1fr 100px 70px 100px 40px;
  gap: 10px; align-items: center; padding: 10px 14px; border-bottom: 1px solid #f3f4f6;
  transition: background 0.1s;
}
.access-row:last-child { border-bottom: none; }
.access-row:hover { background: #f9fafb; }
.access-phone { font-size: 13px; font-weight: 600; color: #111827; font-family: monospace; }
.access-name { font-size: 13px; color: #374151; }
.access-date { font-size: 11px; color: #9ca3af; }
.access-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 32px; color: #9ca3af; text-align: center; }

.access-footer { margin-top: 10px; font-size: 12px; color: #6b7280; }

.role-badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 700; }
.role-badge--hr { background: #dbeafe; color: #1d4ed8; }
.role-badge--superadmin { background: #fef3c7; color: #92400e; }
.role-badge--manager { background: #d1fae5; color: #065f46; }

/* Auth method */
.auth-method-block { background: #f8fafc; border: 1px solid #e5e9ef; border-radius: 10px; padding: 16px; }
.auth-method-badge { display: flex; align-items: center; gap: 12px; }
.auth-method-active { background: #d1fae5; color: #065f46; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; margin-left: auto; flex-shrink: 0; }

/* Toggles */
.toggle-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 12px 0; border-bottom: 1px solid #f3f4f6; }
.toggle-row:last-of-type { border-bottom: none; }
.toggle-row__label { font-size: 13px; font-weight: 600; color: #111827; margin-bottom: 2px; }
.toggle-row__desc { font-size: 12px; color: #6b7280; }
.toggle-btn { width: 44px; height: 24px; border-radius: 12px; border: none; background: #d1d5db; cursor: pointer; position: relative; transition: background 0.2s; flex-shrink: 0; padding: 0; }
.toggle-btn--on { background: #0079C2; }
.toggle-btn__knob { position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; border-radius: 50%; background: #fff; transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
.toggle-btn--on .toggle-btn__knob { transform: translateX(20px); }
.toggle-btn--sm { width: 36px; height: 20px; border-radius: 10px; }
.toggle-btn--sm .toggle-btn__knob { width: 16px; height: 16px; top: 2px; left: 2px; }
.toggle-btn--sm.toggle-btn--on .toggle-btn__knob { transform: translateX(16px); }

/* Интеграции */
.integrations-grid { display: flex; flex-direction: column; gap: 12px; }
.integ-card { border: 1px solid #e5e9ef; border-radius: 10px; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.integ-card__head { display: flex; align-items: center; gap: 12px; }
.integ-card__icon { width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; flex-shrink: 0; }
.integ-card__info { flex: 1; }
.integ-card__name { font-size: 14px; font-weight: 700; color: #111827; display: block; }
.integ-card__desc { font-size: 12px; color: #6b7280; }
.integ-status { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; white-space: nowrap; flex-shrink: 0; }
.integ-status--connected { background: #d1fae5; color: #065f46; }
.integ-status--disconnected { background: #f3f4f6; color: #6b7280; }
.integ-card__actions { display: flex; gap: 8px; }

/* Кнопки */
.btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all 0.15s; font-family: inherit; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn--sm { padding: 6px 14px; font-size: 12px; }
.btn--primary { background: #0079C2; color: #fff; } .btn--primary:not(:disabled):hover { background: #005fa3; }
.btn--outline { background: #fff; border: 1px solid #e5e9ef; color: #374151; } .btn--outline:hover { border-color: #0079C2; color: #0079C2; }
.btn--danger { background: #ef4444; color: #fff; } .btn--danger:hover { background: #dc2626; }

/* icon-btn */
.icon-btn { width: 30px; height: 30px; border-radius: 6px; background: transparent; border: 1px solid #e5e9ef; color: #6b7280; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; flex-shrink: 0; }
.icon-btn--danger:hover { border-color: #ef4444; color: #ef4444; background: #fef2f2; }

/* Модал */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px; }
.modal { background: #fff; border-radius: 16px; width: 100%; max-width: 460px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
.modal--sm { max-width: 380px; }
.modal__header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid #f3f4f6; }
.modal__header h2 { font-size: 16px; font-weight: 700; color: #111827; }
.modal__close { width: 32px; height: 32px; border-radius: 6px; background: #f3f4f6; border: none; color: #6b7280; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.modal__body { padding: 20px 24px; display: flex; flex-direction: column; gap: 14px; }
.modal__footer { display: flex; gap: 10px; justify-content: flex-end; padding: 16px 24px; border-top: 1px solid #f3f4f6; }
.role-badge--employee { background: #f3f4f6; color: #374151; }
.credential-info-banner { display: flex; gap: 10px; align-items: flex-start; background: #e0f2fe; border: 1px solid #bae6fd; border-radius: 10px; padding: 12px; color: #0369a1; }
.credential-code-block { display: flex; align-items: center; justify-content: center; background: #f0fdf4; border: 2px dashed #86efac; border-radius: 12px; padding: 16px; }
.credential-code { max-width: 100%; overflow-wrap: anywhere; font-size: 24px; font-weight: 800; letter-spacing: 3px; color: #15803d; font-family: monospace; text-align: center; }
</style>
