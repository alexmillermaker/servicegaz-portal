<template>
  <div class="docs-admin">
    <div class="docs-admin__header">
      <div>
        <h1 class="docs-admin__title">Управление документами</h1>
        <p class="docs-admin__sub">{{ items.length }} документов · {{ pendingCount }} ожидают подписи</p>
      </div>
      <div style="display:flex;gap:10px">
        <button class="btn btn--outline" @click="showUpload = true">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          Загрузить
        </button>
        <button class="btn btn--primary" @click="openCreate">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Добавить
        </button>
      </div>
    </div>

    <!-- Фильтры -->
    <div class="docs-admin__filters">
      <div class="search-wrap">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="search-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="search" placeholder="Поиск документов…" class="search-input" />
      </div>
      <select v-model="filterCat" class="filter-select">
        <option value="">Все категории</option>
        <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
      </select>
      <select v-model="filterStatus" class="filter-select">
        <option value="">Все статусы</option>
        <option value="active">Активен</option>
        <option value="pending">Ожидает подписи</option>
        <option value="expired">Истёк</option>
      </select>
    </div>

    <!-- Таблица -->
    <div class="docs-admin__table-wrap">
      <table class="docs-table">
        <thead>
          <tr>
            <th>Документ</th>
            <th>Категория</th>
            <th>Дата загрузки</th>
            <th>Срок действия</th>
            <th>Назначен</th>
            <th>Статус</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="doc in filtered" :key="doc.id" class="docs-table__row">
            <td>
              <div class="docs-table__file">
                <span class="docs-table__file-icon" :class="`docs-table__file-icon--${doc.ext}`">{{ doc.ext.toUpperCase() }}</span>
                <div>
                  <div class="docs-table__file-name">{{ doc.name }}</div>
                  <div class="docs-table__file-size">{{ doc.size }}</div>
                </div>
              </div>
            </td>
            <td><span class="cat-badge">{{ doc.category }}</span></td>
            <td class="docs-table__date">{{ doc.uploadDate }}</td>
            <td class="docs-table__date" :class="{ 'docs-table__date--warn': isExpiringSoon(doc.expiry) }">{{ doc.expiry || '—' }}</td>
            <td>
              <div class="docs-table__assignees">
                <span v-for="(a, i) in doc.assignees.slice(0, 2)" :key="i" class="assignee-chip">{{ a }}</span>
                <span v-if="doc.assignees.length > 2" class="assignee-chip assignee-chip--more">+{{ doc.assignees.length - 2 }}</span>
              </div>
            </td>
            <td>
              <span class="status-badge" :class="`status-badge--${doc.status}`">
                {{ { active: 'Активен', pending: 'Ожидает', expired: 'Истёк' }[doc.status] }}
              </span>
            </td>
            <td>
              <div style="display:flex;gap:4px">
                <button class="icon-btn" title="Редактировать" @click="editDoc(doc)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="icon-btn icon-btn--danger" title="Удалить" @click="deleteDoc(doc.id)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="filtered.length === 0">
            <td colspan="7" class="docs-table__empty">Нет документов по выбранным фильтрам</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Модал загрузки нового документа -->
    <Teleport to="body">
      <div v-if="showUpload && !editingDoc" class="modal-overlay" @click.self="showUpload = false">
        <div class="modal">
          <div class="modal__header">
            <h2>Загрузить документ</h2>
            <button class="modal__close" @click="showUpload = false">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal__body">
            <div class="upload-zone">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <p>Перетащите файл или <span style="color:#0079C2;cursor:pointer">выберите с компьютера</span></p>
              <p style="font-size:11px;color:#9ca3af">PDF, DOCX, XLSX до 50 МБ</p>
            </div>
            <div>
              <label class="form-label">Название документа</label>
              <input v-model="uploadForm.name" class="form-input" placeholder="Название документа" />
            </div>
            <div>
              <label class="form-label">Категория</label>
              <select v-model="uploadForm.category" class="form-input">
                <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
            <div>
              <label class="form-label">Срок действия (необязательно)</label>
              <input v-model="uploadForm.expiry" type="date" class="form-input" />
            </div>
            <div>
              <label class="form-label">Назначить сотрудникам</label>
              <input v-model="uploadForm.assignees" class="form-input" placeholder="Иванов П.С., Петров А.И.…" />
            </div>
          </div>
          <div class="modal__footer">
            <button class="btn btn--outline" @click="showUpload = false">Отмена</button>
            <button class="btn btn--primary" @click="doUpload">Загрузить</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Модал редактирования документа -->
    <Teleport to="body">
      <div v-if="showUpload && editingDoc" class="modal-overlay" @click.self="closeEdit">
        <div class="modal">
          <div class="modal__header">
            <h2>Редактировать документ</h2>
            <button class="modal__close" @click="closeEdit">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal__body">
            <!-- Инфо о файле -->
            <div class="edit-file-info">
              <span class="docs-table__file-icon" :class="`docs-table__file-icon--${editingDoc.ext}`">{{ editingDoc.ext.toUpperCase() }}</span>
              <div>
                <div style="font-size:13px;font-weight:600;color:#111827">{{ editingDoc.name }}</div>
                <div style="font-size:11px;color:#9ca3af">{{ editingDoc.size }} · Загружен {{ editingDoc.uploadDate }}</div>
              </div>
            </div>
            <div>
              <label class="form-label">Название документа</label>
              <input v-model="editForm.name" class="form-input" />
            </div>
            <div>
              <label class="form-label">Категория</label>
              <select v-model="editForm.category" class="form-input">
                <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
            <div>
              <label class="form-label">Срок действия</label>
              <input v-model="editForm.expiry" type="date" class="form-input" />
            </div>
            <div>
              <label class="form-label">Статус</label>
              <select v-model="editForm.status" class="form-input">
                <option value="active">Активен</option>
                <option value="pending">Ожидает подписи</option>
                <option value="expired">Истёк</option>
              </select>
            </div>
            <div>
              <label class="form-label">Назначен (через запятую)</label>
              <input v-model="editForm.assignees" class="form-input" placeholder="Иванов П.С., Петров А.И.…" />
            </div>
          </div>
          <div class="modal__footer">
            <button class="btn btn--outline" @click="closeEdit">Отмена</button>
            <button class="btn btn--primary" @click="saveEdit" :disabled="!editForm.name.trim()">Сохранить</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Подтверждение удаления -->
    <Teleport to="body">
      <div v-if="deleteTarget !== null" class="modal-overlay" @click.self="deleteTarget=null">
        <div class="modal modal--sm">
          <div class="modal__header">
            <h2>Удалить документ?</h2>
            <button class="modal__close" @click="deleteTarget=null">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal__body">
            <p style="font-size:14px;color:#374151;line-height:1.6">
              Документ <b>«{{ items.find(d=>d.id===deleteTarget)?.name }}»</b> будет безвозвратно удалён.
            </p>
          </div>
          <div class="modal__footer">
            <button class="btn btn--outline" @click="deleteTarget=null">Отмена</button>
            <button class="btn btn--danger" @click="doDelete">Удалить</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Тост -->
    <Teleport to="body">
      <Transition name="toast">
        <div v-if="toast" class="toast">{{ toast }}</div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'

interface Doc { id: number; name: string; ext: string; size: string; category: string; uploadDate: string; expiry: string; assignees: string[]; status: 'active' | 'pending' | 'expired' }

const items = ref<Doc[]>([
  { id: 1, name: 'Регламент информационной безопасности', ext: 'pdf', size: '1.2 МБ', category: 'Безопасность', uploadDate: '01.06.2026', expiry: '01.06.2027', assignees: ['Все сотрудники'], status: 'active' },
  { id: 2, name: 'Трудовой договор (типовая форма)', ext: 'docx', size: '84 КБ', category: 'Кадры', uploadDate: '15.05.2026', expiry: '', assignees: ['Иванов П.С.', 'Петров А.И.'], status: 'pending' },
  { id: 3, name: 'Приказ №41 о структурных изменениях', ext: 'pdf', size: '540 КБ', category: 'Приказы', uploadDate: '10.05.2026', expiry: '', assignees: ['Все руководители'], status: 'active' },
  { id: 4, name: 'Бюджет IT-подразделения 2026', ext: 'xlsx', size: '210 КБ', category: 'Финансы', uploadDate: '01.01.2026', expiry: '31.12.2026', assignees: ['Смирнов К.Д.'], status: 'active' },
  { id: 5, name: 'Инструкция по пожарной безопасности', ext: 'pdf', size: '2.1 МБ', category: 'Безопасность', uploadDate: '01.03.2025', expiry: '01.03.2026', assignees: ['Все сотрудники'], status: 'expired' },
  { id: 6, name: 'Положение о командировках', ext: 'docx', size: '96 КБ', category: 'Кадры', uploadDate: '20.04.2026', expiry: '', assignees: ['Волков Д.Р.', 'Новикова О.П.', 'Карпова А.В.'], status: 'pending' },
])

const categories = ['Безопасность', 'Кадры', 'Приказы', 'Финансы', 'Обучение', 'Прочее']
const search = ref('')
const filterCat = ref('')
const filterStatus = ref('')
const showUpload = ref(false)
const editingDoc = ref<Doc | null>(null)
const deleteTarget = ref<number | null>(null)
const toast = ref('')

const uploadForm = reactive({ name: '', category: 'Кадры', expiry: '', assignees: '' })
const editForm = reactive({ name: '', category: 'Кадры', expiry: '', status: 'active' as Doc['status'], assignees: '' })

function showToast(msg: string) { toast.value = msg; setTimeout(() => toast.value = '', 2500) }

const pendingCount = computed(() => items.value.filter(d => d.status === 'pending').length)

const filtered = computed(() => {
  let list = items.value
  if (filterCat.value) list = list.filter(d => d.category === filterCat.value)
  if (filterStatus.value) list = list.filter(d => d.status === filterStatus.value)
  if (search.value) { const q = search.value.toLowerCase(); list = list.filter(d => d.name.toLowerCase().includes(q)) }
  return list
})

function isExpiringSoon(expiry: string) {
  if (!expiry) return false
  const [d, m, y] = expiry.split('.').map(Number)
  const exp = new Date(y, m - 1, d)
  return (exp.getTime() - Date.now()) / 86400000 < 30
}

function openCreate() {
  editingDoc.value = null
  Object.assign(uploadForm, { name: '', category: 'Кадры', expiry: '', assignees: '' })
  showUpload.value = true
}

function doUpload() {
  if (!uploadForm.name.trim()) return
  items.value.unshift({
    id: Date.now(), name: uploadForm.name.trim(), ext: 'pdf', size: '—',
    category: uploadForm.category, uploadDate: new Date().toLocaleDateString('ru-RU'),
    expiry: uploadForm.expiry ? new Date(uploadForm.expiry).toLocaleDateString('ru-RU') : '',
    assignees: uploadForm.assignees ? uploadForm.assignees.split(',').map(s => s.trim()) : [],
    status: 'active'
  })
  showUpload.value = false
  showToast('Документ загружен')
}

function editDoc(doc: Doc) {
  editingDoc.value = doc
  Object.assign(editForm, {
    name: doc.name, category: doc.category, status: doc.status,
    expiry: doc.expiry ? doc.expiry.split('.').reverse().join('-') : '',
    assignees: doc.assignees.join(', ')
  })
  showUpload.value = true
}

function saveEdit() {
  if (!editingDoc.value || !editForm.name.trim()) return
  const doc = items.value.find(d => d.id === editingDoc.value!.id)
  if (doc) {
    doc.name = editForm.name.trim()
    doc.category = editForm.category
    doc.status = editForm.status
    doc.expiry = editForm.expiry ? new Date(editForm.expiry).toLocaleDateString('ru-RU') : ''
    doc.assignees = editForm.assignees ? editForm.assignees.split(',').map(s => s.trim()) : []
  }
  closeEdit()
  showToast('Документ обновлён')
}

function closeEdit() { showUpload.value = false; editingDoc.value = null }

function deleteDoc(id: number) { deleteTarget.value = id }
function doDelete() {
  if (deleteTarget.value !== null) {
    items.value = items.value.filter(d => d.id !== deleteTarget.value)
    deleteTarget.value = null
    showToast('Документ удалён')
  }
}
</script>

<style scoped>
.docs-admin { width: 100%; }
.docs-admin__header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; gap: 16px; flex-wrap: wrap; }
.docs-admin__title { font-size: 22px; font-weight: 800; color: #111827; margin-bottom: 4px; }
.docs-admin__sub { font-size: 13px; color: #6b7280; }
.docs-admin__filters { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; background: #fff; border-radius: 12px; padding: 12px 16px; border: 1px solid #e5e9ef; margin-bottom: 16px; }
.search-wrap { position: relative; flex: 1; min-width: 200px; }
.search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #9ca3af; pointer-events: none; }
.search-input { width: 100%; padding: 8px 12px 8px 32px; border-radius: 8px; border: 1px solid #e5e9ef; font-size: 13px; outline: none; background: #f9fafb; color: #111827; }
.search-input:focus { border-color: #0079C2; background: #fff; }
.filter-select { padding: 8px 12px; border-radius: 8px; border: 1px solid #e5e9ef; font-size: 13px; background: #f9fafb; color: #374151; outline: none; cursor: pointer; }
.filter-select:focus { border-color: #0079C2; }

.docs-admin__table-wrap { background: #fff; border-radius: 12px; border: 1px solid #e5e9ef; overflow: auto; }
.docs-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.docs-table thead tr { background: #f8fafc; border-bottom: 1px solid #e5e9ef; }
.docs-table th { padding: 11px 14px; text-align: left; font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }
.docs-table__row { border-bottom: 1px solid #f3f4f6; transition: background 0.1s; }
.docs-table__row:last-child { border-bottom: none; }
.docs-table__row:hover { background: #f9fafb; }
.docs-table td { padding: 12px 14px; vertical-align: middle; }
.docs-table__file { display: flex; align-items: center; gap: 10px; }
.docs-table__file-icon { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 8px; font-size: 9px; font-weight: 800; flex-shrink: 0; }
.docs-table__file-icon--pdf { background: #fee2e2; color: #b91c1c; }
.docs-table__file-icon--docx { background: #dbeafe; color: #1d4ed8; }
.docs-table__file-icon--xlsx { background: #dcfce7; color: #15803d; }
.docs-table__file-name { font-size: 13px; font-weight: 600; color: #111827; }
.docs-table__file-size { font-size: 11px; color: #9ca3af; }
.docs-table__date { font-size: 13px; color: #374151; white-space: nowrap; }
.docs-table__date--warn { color: #dc2626; font-weight: 600; }
.docs-table__empty { text-align: center; padding: 48px; color: #9ca3af; }

.cat-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; background: #f3f4f6; color: #374151; white-space: nowrap; }
.docs-table__assignees { display: flex; gap: 4px; flex-wrap: wrap; }
.assignee-chip { font-size: 11px; background: #e0f2fe; color: #0369a1; border-radius: 10px; padding: 2px 8px; white-space: nowrap; }
.assignee-chip--more { background: #f3f4f6; color: #6b7280; }
.status-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; white-space: nowrap; }
.status-badge--active { background: #d1fae5; color: #065f46; }
.status-badge--pending { background: #fef9c3; color: #92400e; }
.status-badge--expired { background: #fee2e2; color: #b91c1c; }

.icon-btn { width: 30px; height: 30px; border-radius: 6px; background: transparent; border: 1px solid #e5e9ef; color: #6b7280; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; }
.icon-btn:hover { border-color: #0079C2; color: #0079C2; background: #f0f9ff; }
.icon-btn--danger:hover { border-color: #ef4444; color: #ef4444; background: #fef2f2; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px; }
.modal { background: #fff; border-radius: 16px; width: 100%; max-width: 460px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
.modal__header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 0; }
.modal__header h2 { font-size: 16px; font-weight: 700; color: #111827; }
.modal__close { width: 32px; height: 32px; border-radius: 6px; background: #f3f4f6; border: none; color: #6b7280; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.modal__body { padding: 16px 24px; display: flex; flex-direction: column; gap: 12px; }
.modal__footer { display: flex; gap: 10px; justify-content: flex-end; padding: 16px 24px 20px; border-top: 1px solid #f3f4f6; }
.upload-zone { border: 2px dashed #d1d5db; border-radius: 10px; padding: 32px 16px; display: flex; flex-direction: column; align-items: center; gap: 8px; color: #6b7280; font-size: 13px; text-align: center; cursor: pointer; transition: border-color 0.15s; }
.upload-zone:hover { border-color: #0079C2; }
.upload-zone svg { color: #9ca3af; }
.form-label { font-size: 12px; font-weight: 700; color: #374151; margin-bottom: -6px; }
.form-input { width: 100%; padding: 9px 12px; border-radius: 8px; border: 1px solid #e5e9ef; font-size: 13px; outline: none; background: #f9fafb; color: #111827; font-family: inherit; }
.form-input:focus { border-color: #0079C2; background: #fff; }

.btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all 0.15s; font-family: inherit; }
.btn--primary { background: #0079C2; color: #fff; }
.btn--primary:hover { background: #005fa3; }
.btn--outline { background: #fff; border: 1px solid #e5e9ef; color: #374151; }
.btn--outline:hover { border-color: #0079C2; color: #0079C2; }
.btn--danger { background: #ef4444; color: #fff; }
.btn--danger:hover { background: #dc2626; }
.modal--sm { max-width: 380px; }
.edit-file-info { display: flex; align-items: center; gap: 12px; background: #f9fafb; border: 1px solid #e5e9ef; border-radius: 10px; padding: 12px; }
.toast { position: fixed; bottom: 24px; right: 24px; background: #111827; color: #fff; padding: 12px 20px; border-radius: 10px; font-size: 13px; font-weight: 600; z-index: 9999; box-shadow: 0 4px 16px rgba(0,0,0,0.25); }
.toast-enter-active { transition: all 0.25s ease; }
.toast-leave-active { transition: all 0.2s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(10px); }
</style>