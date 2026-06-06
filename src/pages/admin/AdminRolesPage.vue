<template>
  <div class="roles-page">
    <div class="roles-page__header">
      <div>
        <h1 class="roles-page__title">Роли и доступы</h1>
        <p class="roles-page__sub">{{ roles.length }} ролей · матрица прав доступа</p>
      </div>
      <button class="btn btn--primary" @click="openCreate">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Новая роль
      </button>
    </div>

    <!-- Карточки ролей -->
    <div class="roles-grid">
      <div v-for="role in roles" :key="role.id" class="role-card" :class="{ 'role-card--system': role.system }">
        <div class="role-card__head">
          <div class="role-card__icon" :style="{ background: role.color + '22', color: role.color }">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <div class="role-card__info">
            <span class="role-card__name">{{ role.name }}</span>
            <span class="role-card__users">{{ role.users }} пользователей</span>
          </div>
          <span v-if="role.system" class="role-card__system-badge">Системная</span>
          <div class="role-card__menu" v-else>
            <button class="icon-btn" @click="editRole(role)" title="Редактировать">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="icon-btn icon-btn--danger" @click="deleteRole(role.id)" title="Удалить">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
            </button>
          </div>
        </div>
        <p class="role-card__desc">{{ role.description }}</p>
        <div class="role-card__perms">
          <span v-for="p in role.permissions.slice(0,4)" :key="p" class="perm-chip">{{ p }}</span>
          <span v-if="role.permissions.length > 4" class="perm-chip perm-chip--more">+{{ role.permissions.length - 4 }}</span>
        </div>
      </div>
    </div>

    <!-- Матрица прав -->
    <div class="matrix-section">
      <h2 class="matrix-section__title">Матрица прав доступа</h2>
      <div class="matrix-wrap">
        <table class="matrix-table">
          <thead>
            <tr>
              <th class="matrix-table__module-col">Модуль</th>
              <th v-for="role in roles" :key="role.id" class="matrix-table__role-col">
                <span class="matrix-role-name">{{ role.name }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="mod in modules" :key="mod.key">
              <td class="matrix-table__module">{{ mod.label }}</td>
              <td v-for="role in roles" :key="role.id" class="matrix-table__cell">
                <button class="matrix-toggle" :class="{ 'matrix-toggle--on': hasAccess(role, mod.key) }" @click="toggleAccess(role, mod.key)" :disabled="role.system">
                  <svg v-if="hasAccess(role, mod.key)" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Модальное окно -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal">
          <div class="modal__header">
            <h2>{{ editingRole ? 'Редактировать роль' : 'Новая роль' }}</h2>
            <button class="modal__close" @click="showModal = false"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
          <div class="modal__body">
            <label class="form-label">Название роли</label>
            <input v-model="form.name" class="form-input" placeholder="Например: Менеджер" />
            <label class="form-label">Описание</label>
            <textarea v-model="form.description" class="form-input form-textarea" rows="2" placeholder="Краткое описание роли…" />
            <label class="form-label">Доступные модули</label>
            <div class="perm-checkboxes">
              <label v-for="mod in modules" :key="mod.key" class="perm-check">
                <input type="checkbox" :value="mod.key" v-model="form.accessModules" />
                <span>{{ mod.label }}</span>
              </label>
            </div>
          </div>
          <div class="modal__footer">
            <button class="btn btn--outline" @click="showModal = false">Отмена</button>
            <button class="btn btn--primary" @click="saveRole">{{ editingRole ? 'Сохранить' : 'Создать' }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="deleteTarget !== null" class="modal-overlay" @click.self="deleteTarget=null">
        <div class="modal modal--sm">
          <div class="modal__header">
            <h2>Удалить роль?</h2>
            <button class="modal__close" @click="deleteTarget=null"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
          <div class="modal__body">
            <p style="font-size:14px;color:#374151;line-height:1.6">Роль <b>«{{ roles.find(r=>r.id===deleteTarget)?.name }}»</b> будет удалена без возможности восстановления.</p>
          </div>
          <div class="modal__footer">
            <button class="btn btn--outline" @click="deleteTarget=null">Отмена</button>
            <button class="btn btn--danger" @click="doDelete">Удалить</button>
          </div>
        </div>
      </div>
    </Teleport>
    <Teleport to="body"><Transition name="toast"><div v-if="toast" class="toast">{{ toast }}</div></Transition></Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

interface Role { id: number; name: string; description: string; users: number; color: string; system: boolean; permissions: string[]; accessModules: string[] }

const modules = [
  { key: 'dashboard', label: 'Главная панель' },
  { key: 'employees', label: 'Сотрудники' },
  { key: 'adaptation', label: 'Адаптация' },
  { key: 'news', label: 'Новости' },
  { key: 'documents', label: 'Документы' },
  { key: 'learning', label: 'Обучение' },
  { key: 'events', label: 'События' },
  { key: 'reports', label: 'Отчёты' },
  { key: 'roles', label: 'Роли и доступы' },
  { key: 'audit', label: 'Журнал действий' },
  { key: 'settings', label: 'Настройки' },
]

const roles = ref<Role[]>([
  { id: 1, name: 'Суперадмин', description: 'Полный доступ ко всем разделам системы', users: 2, color: '#ef4444', system: true, permissions: ['Все разделы', 'Управление ролями', 'Журнал', 'Настройки'], accessModules: modules.map(m => m.key) },
  { id: 2, name: 'HR-менеджер', description: 'Управление персоналом, адаптацией и документами', users: 5, color: '#0079C2', system: true, permissions: ['Сотрудники', 'Адаптация', 'Документы', 'Новости', 'События', 'Отчёты'], accessModules: ['dashboard', 'employees', 'adaptation', 'news', 'documents', 'events', 'reports'] },
  { id: 3, name: 'Руководитель', description: 'Просмотр данных своего подразделения', users: 12, color: '#8b5cf6', system: false, permissions: ['Сотрудники (просмотр)', 'Документы', 'Отчёты'], accessModules: ['dashboard', 'employees', 'documents', 'reports'] },
  { id: 4, name: 'Аналитик', description: 'Доступ к отчётам и статистике', users: 3, color: '#22c55e', system: false, permissions: ['Отчёты', 'Главная панель'], accessModules: ['dashboard', 'reports'] },
])

const showModal = ref(false)
const editingRole = ref<Role | null>(null)
const form = reactive({ name: '', description: '', accessModules: [] as string[] })

function hasAccess(role: Role, moduleKey: string) { return role.accessModules.includes(moduleKey) }
function toggleAccess(role: Role, moduleKey: string) {
  if (role.system) return
  const idx = role.accessModules.indexOf(moduleKey)
  if (idx === -1) role.accessModules.push(moduleKey)
  else role.accessModules.splice(idx, 1)
}

function openCreate() { editingRole.value = null; Object.assign(form, { name: '', description: '', accessModules: [] }); showModal.value = true }
function editRole(role: Role) { editingRole.value = role; Object.assign(form, { name: role.name, description: role.description, accessModules: [...role.accessModules] }); showModal.value = true }
function saveRole() {
  if (!form.name.trim()) return
  if (editingRole.value) {
    const r = roles.value.find(r => r.id === editingRole.value!.id)
    if (r) { r.name = form.name; r.description = form.description; r.accessModules = [...form.accessModules] }
  } else {
    roles.value.push({ id: Date.now(), name: form.name, description: form.description, users: 0, color: '#6b7280', system: false, permissions: [], accessModules: [...form.accessModules] })
  }
  showModal.value = false
}
const deleteTarget = ref<number | null>(null)
const toast = ref('')
function showToast(msg: string) { toast.value = msg; setTimeout(() => toast.value = '', 2500) }
function deleteRole(id: number) { deleteTarget.value = id }
function doDelete() {
  if (deleteTarget.value !== null) {
    roles.value = roles.value.filter(r => r.id !== deleteTarget.value)
    deleteTarget.value = null
    showToast('Роль удалена')
  }
}
</script>

<style scoped>
.roles-page { width: 100%; }
.roles-page__header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; gap: 16px; flex-wrap: wrap; }
.roles-page__title { font-size: 22px; font-weight: 800; color: #111827; margin-bottom: 4px; }
.roles-page__sub { font-size: 13px; color: #6b7280; }

.roles-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; margin-bottom: 32px; }
.role-card { background: #fff; border-radius: 12px; border: 1px solid #e5e9ef; padding: 18px 20px; display: flex; flex-direction: column; gap: 12px; }
.role-card--system { border-left: 3px solid #0079C2; }
.role-card__head { display: flex; align-items: center; gap: 12px; }
.role-card__icon { width: 38px; height: 38px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.role-card__info { flex: 1; }
.role-card__name { font-size: 14px; font-weight: 700; color: #111827; display: block; }
.role-card__users { font-size: 11px; color: #6b7280; }
.role-card__system-badge { font-size: 11px; font-weight: 600; background: #dbeafe; color: #1d4ed8; padding: 2px 8px; border-radius: 20px; white-space: nowrap; }
.role-card__menu { display: flex; gap: 4px; }
.role-card__desc { font-size: 12px; color: #6b7280; line-height: 1.5; }
.role-card__perms { display: flex; flex-wrap: wrap; gap: 5px; }
.perm-chip { font-size: 11px; background: #f3f4f6; color: #374151; border-radius: 10px; padding: 2px 9px; }
.perm-chip--more { background: #e5e7eb; color: #6b7280; }

.matrix-section { background: #fff; border-radius: 12px; border: 1px solid #e5e9ef; overflow: hidden; }
.matrix-section__title { font-size: 15px; font-weight: 700; color: #111827; padding: 16px 20px; border-bottom: 1px solid #f3f4f6; }
.matrix-wrap { overflow-x: auto; }
.matrix-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.matrix-table thead { background: #f8fafc; }
.matrix-table th { padding: 12px 16px; text-align: center; font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e5e9ef; white-space: nowrap; }
.matrix-table__module-col { text-align: left; min-width: 160px; }
.matrix-role-name { display: block; font-size: 12px; text-transform: none; font-weight: 700; color: #374151; }
.matrix-table td { padding: 10px 16px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
.matrix-table tr:last-child td { border-bottom: none; }
.matrix-table__module { font-size: 13px; font-weight: 500; color: #374151; }
.matrix-table__cell { text-align: center; }
.matrix-toggle { width: 28px; height: 28px; border-radius: 6px; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; margin: 0 auto; }
.matrix-toggle--on { background: #d1fae5; color: #22c55e; }
.matrix-toggle:not(.matrix-toggle--on) { background: #f3f4f6; color: #d1d5db; }
.matrix-toggle:not(:disabled):hover { opacity: 0.75; }
.matrix-toggle:disabled { cursor: not-allowed; opacity: 0.6; }

.icon-btn { width: 30px; height: 30px; border-radius: 6px; background: transparent; border: 1px solid #e5e9ef; color: #6b7280; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; }
.icon-btn:hover { border-color: #0079C2; color: #0079C2; background: #f0f9ff; }
.icon-btn--danger:hover { border-color: #ef4444; color: #ef4444; background: #fef2f2; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px; }
.modal { background: #fff; border-radius: 16px; width: 100%; max-width: 480px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); max-height: 90vh; overflow-y: auto; }
.modal__header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 0; }
.modal__header h2 { font-size: 16px; font-weight: 700; color: #111827; }
.modal__close { width: 32px; height: 32px; border-radius: 6px; background: #f3f4f6; border: none; color: #6b7280; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.modal__body { padding: 16px 24px; display: flex; flex-direction: column; gap: 12px; }
.modal__footer { display: flex; gap: 10px; justify-content: flex-end; padding: 16px 24px 20px; border-top: 1px solid #f3f4f6; }
.form-label { font-size: 12px; font-weight: 700; color: #374151; margin-bottom: -6px; }
.form-input { width: 100%; padding: 9px 12px; border-radius: 8px; border: 1px solid #e5e9ef; font-size: 13px; outline: none; background: #f9fafb; color: #111827; font-family: inherit; }
.form-input:focus { border-color: #0079C2; background: #fff; }
.form-textarea { resize: vertical; }
.perm-checkboxes { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.perm-check { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #374151; cursor: pointer; padding: 6px 8px; border-radius: 6px; border: 1px solid #e5e9ef; transition: border-color 0.15s; }
.perm-check:hover { border-color: #0079C2; }
.perm-check input { width: 14px; height: 14px; accent-color: #0079C2; cursor: pointer; }

.btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all 0.15s; font-family: inherit; }
.btn--primary { background: #0079C2; color: #fff; }
.btn--primary:hover { background: #005fa3; }
.btn--outline { background: #fff; border: 1px solid #e5e9ef; color: #374151; }
.btn--outline:hover { border-color: #0079C2; color: #0079C2; }
.btn--danger { background: #ef4444; color: #fff; } .btn--danger:hover { background: #dc2626; }
.modal--sm { max-width: 380px; }
.toast { position: fixed; bottom: 24px; right: 24px; background: #111827; color: #fff; padding: 12px 20px; border-radius: 10px; font-size: 13px; font-weight: 600; z-index: 9999; box-shadow: 0 4px 16px rgba(0,0,0,0.25); }
.toast-enter-active { transition: all 0.25s ease; } .toast-leave-active { transition: all 0.2s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(10px); }
</style>