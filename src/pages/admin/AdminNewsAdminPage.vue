<template>
  <div class="news-admin">
    <!-- Шапка -->
    <div class="news-admin__header">
      <div>
        <h1 class="news-admin__title">Управление новостями</h1>
        <p class="news-admin__sub">{{ items.length }} материалов · {{ publishedCount }} опубликовано</p>
      </div>
      <button class="btn btn--primary" @click="openCreate">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Создать новость
      </button>
    </div>

    <!-- Фильтры -->
    <div class="news-admin__filters">
      <div class="search-wrap">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="search-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="search" placeholder="Поиск новостей…" class="search-input" />
      </div>
      <div class="news-admin__tabs">
        <button v-for="tab in tabs" :key="tab.value" class="tab-btn" :class="{ 'tab-btn--active': filterStatus === tab.value }" @click="filterStatus = tab.value">
          {{ tab.label }} <span class="tab-count">{{ tab.count }}</span>
        </button>
      </div>
    </div>

    <!-- Карточки новостей -->
    <div class="news-admin__grid">
      <div v-for="item in filtered" :key="item.id" class="news-card">
        <div class="news-card__img-wrap">
          <div class="news-card__img-placeholder">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </div>
          <span class="news-card__status-badge" :class="`news-card__status-badge--${item.status}`">
            {{ item.status === 'published' ? 'Опубликовано' : 'Черновик' }}
          </span>
        </div>
        <div class="news-card__body">
          <span class="news-card__category">{{ item.category }}</span>
          <h3 class="news-card__title">{{ item.title }}</h3>
          <p class="news-card__excerpt">{{ item.excerpt }}</p>
          <div class="news-card__meta">
            <span class="news-card__author">{{ item.author }}</span>
            <span class="news-card__date">{{ item.date }}</span>
            <span class="news-card__views">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              {{ item.views }}
            </span>
          </div>
        </div>
        <div class="news-card__actions">
          <button class="icon-btn" title="Редактировать" @click="editItem(item)">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="icon-btn" :title="item.status === 'published' ? 'Снять с публикации' : 'Опубликовать'" @click="toggleStatus(item)">
            <svg v-if="item.status === 'published'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <button class="icon-btn icon-btn--danger" title="Удалить" @click="deleteItem(item.id)">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6 M14 11v6"/></svg>
          </button>
        </div>
      </div>

      <div v-if="filtered.length === 0" class="news-admin__empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2z"/></svg>
        <p>Нет новостей</p>
      </div>
    </div>

    <!-- Модальное окно создания -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal">
          <div class="modal__header">
            <h2>{{ editingItem ? 'Редактировать новость' : 'Новая новость' }}</h2>
            <button class="modal__close" @click="showModal = false">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal__body">
            <label class="form-label">Заголовок</label>
            <input v-model="form.title" class="form-input" placeholder="Введите заголовок новости" />
            <label class="form-label">Категория</label>
            <select v-model="form.category" class="form-input">
              <option>Объявления</option><option>HR</option><option>Компания</option><option>Обучение</option>
            </select>
            <label class="form-label">Анонс</label>
            <textarea v-model="form.excerpt" class="form-input form-textarea" placeholder="Краткое описание…" rows="3" />
            <label class="form-label">Статус</label>
            <select v-model="form.status" class="form-input">
              <option value="draft">Черновик</option><option value="published">Опубликовать</option>
            </select>
          </div>
          <div class="modal__footer">
            <button class="btn btn--outline" @click="showModal = false">Отмена</button>
            <button class="btn btn--primary" @click="saveItem">{{ editingItem ? 'Сохранить' : 'Создать' }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="deleteTarget !== null" class="modal-overlay" @click.self="deleteTarget=null">
        <div class="modal modal--sm">
          <div class="modal__header">
            <h2>Удалить новость?</h2>
            <button class="modal__close" @click="deleteTarget=null"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
          <div class="modal__body">
            <p style="font-size:14px;color:#374151;line-height:1.6">Новость <b>«{{ items.find(i=>i.id===deleteTarget)?.title }}»</b> будет безвозвратно удалена.</p>
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
import { ref, computed, reactive } from 'vue'

interface NewsItem { id: number; title: string; category: string; excerpt: string; author: string; date: string; views: number; status: 'published' | 'draft' }

const items = ref<NewsItem[]>([
  { id: 1, title: 'Запуск новой системы управления проектами', category: 'Компания', excerpt: 'С 1 июля переходим на новую платформу управления задачами — детали в прикреплённом руководстве.', author: 'Карпова А.В.', date: '05.06.2026', views: 214, status: 'published' },
  { id: 2, title: 'Корпоратив: летний квест по городу', category: 'HR', excerpt: 'Приглашаем всех на летний корпоратив 21 июня. Формат: командный квест + барбекю.', author: 'Карпова А.В.', date: '03.06.2026', views: 189, status: 'published' },
  { id: 3, title: 'Обновление политики дистанционной работы', category: 'Объявления', excerpt: 'С 1 июля вводятся новые правила гибкого графика. Просим ознакомиться до 15 июня.', author: 'Смирнов К.Д.', date: '01.06.2026', views: 302, status: 'published' },
  { id: 4, title: 'Новый курс по промышленной безопасности', category: 'Обучение', excerpt: 'Обязательный курс для всех сотрудников производственных подразделений. Срок прохождения — до 30 июня.', author: 'Новикова О.П.', date: '28.05.2026', views: 87, status: 'published' },
  { id: 5, title: 'Введение системы электронного документооборота', category: 'Компания', excerpt: 'Черновик. Переход на ЭДО запланирован на Q3 2026. Ожидает согласования.', author: 'Волков Д.Р.', date: '25.05.2026', views: 0, status: 'draft' },
  { id: 6, title: 'Итоги аттестации первого полугодия', category: 'HR', excerpt: 'Черновик результатов аттестации — на согласовании у руководителей подразделений.', author: 'Карпова А.В.', date: '20.05.2026', views: 0, status: 'draft' },
])

const search = ref('')
const filterStatus = ref('')
const showModal = ref(false)
const editingItem = ref<NewsItem | null>(null)
const form = reactive({ title: '', category: 'Объявления', excerpt: '', status: 'draft' as 'published' | 'draft' })

const publishedCount = computed(() => items.value.filter(i => i.status === 'published').length)

const tabs = computed(() => [
  { label: 'Все', value: '', count: items.value.length },
  { label: 'Опубликовано', value: 'published', count: publishedCount.value },
  { label: 'Черновики', value: 'draft', count: items.value.filter(i => i.status === 'draft').length },
])

const filtered = computed(() => {
  let list = items.value
  if (filterStatus.value) list = list.filter(i => i.status === filterStatus.value)
  if (search.value) { const q = search.value.toLowerCase(); list = list.filter(i => i.title.toLowerCase().includes(q) || i.excerpt.toLowerCase().includes(q)) }
  return list
})

function openCreate() {
  editingItem.value = null
  Object.assign(form, { title: '', category: 'Объявления', excerpt: '', status: 'draft' })
  showModal.value = true
}

function editItem(item: NewsItem) {
  editingItem.value = item
  Object.assign(form, { title: item.title, category: item.category, excerpt: item.excerpt, status: item.status })
  showModal.value = true
}

function saveItem() {
  if (!form.title.trim()) return
  if (editingItem.value) {
    const found = items.value.find(i => i.id === editingItem.value!.id)
    if (found) Object.assign(found, { title: form.title, category: form.category, excerpt: form.excerpt, status: form.status })
  } else {
    items.value.unshift({ id: Date.now(), title: form.title, category: form.category, excerpt: form.excerpt, author: 'Карпова А.В.', date: new Date().toLocaleDateString('ru'), views: 0, status: form.status })
  }
  showModal.value = false
}

function toggleStatus(item: NewsItem) {
  item.status = item.status === 'published' ? 'draft' : 'published'
}

const deleteTarget = ref<number | null>(null)
const toast = ref('')
function showToast(msg: string) { toast.value = msg; setTimeout(() => toast.value = '', 2500) }
function deleteItem(id: number) { deleteTarget.value = id }
function doDelete() {
  if (deleteTarget.value !== null) {
    items.value = items.value.filter(i => i.id !== deleteTarget.value)
    deleteTarget.value = null
    showToast('Новость удалена')
  }
}
</script>

<style scoped>
.news-admin { width: 100%; }
.news-admin__header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; gap: 16px; flex-wrap: wrap; }
.news-admin__title { font-size: 22px; font-weight: 800; color: #111827; margin-bottom: 4px; }
.news-admin__sub { font-size: 13px; color: #6b7280; }

.news-admin__filters { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 20px; }
.search-wrap { position: relative; width: 280px; }
.search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #9ca3af; pointer-events: none; }
.search-input { width: 100%; padding: 8px 12px 8px 32px; border-radius: 8px; border: 1px solid #e5e9ef; font-size: 13px; outline: none; background: #fff; color: #111827; }
.search-input:focus { border-color: #0079C2; }

.news-admin__tabs { display: flex; gap: 4px; background: #f3f4f6; border-radius: 8px; padding: 3px; }
.tab-btn { padding: 5px 14px; border-radius: 6px; border: none; background: transparent; font-size: 13px; font-weight: 500; color: #6b7280; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.15s; }
.tab-btn--active { background: #fff; color: #111827; font-weight: 600; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
.tab-count { font-size: 11px; background: #e5e7eb; border-radius: 10px; padding: 0 6px; }
.tab-btn--active .tab-count { background: #e0f2fe; color: #0369a1; }

.news-admin__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
.news-admin__empty { grid-column: 1/-1; display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 48px; color: #9ca3af; }

.news-card { background: #fff; border-radius: 12px; border: 1px solid #e5e9ef; overflow: hidden; display: flex; flex-direction: column; transition: box-shadow 0.15s; }
.news-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
.news-card__img-wrap { height: 120px; background: #f0f2f5; position: relative; display: flex; align-items: center; justify-content: center; color: #d1d5db; }
.news-card__status-badge { position: absolute; top: 8px; right: 8px; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 20px; }
.news-card__status-badge--published { background: #d1fae5; color: #065f46; }
.news-card__status-badge--draft { background: #f3f4f6; color: #6b7280; }
.news-card__body { flex: 1; padding: 14px 16px; }
.news-card__category { font-size: 11px; font-weight: 700; color: #0079C2; text-transform: uppercase; letter-spacing: 0.5px; }
.news-card__title { font-size: 14px; font-weight: 700; color: #111827; margin: 6px 0 8px; line-height: 1.4; }
.news-card__excerpt { font-size: 12px; color: #6b7280; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.news-card__meta { display: flex; gap: 10px; align-items: center; margin-top: 10px; font-size: 11px; color: #9ca3af; flex-wrap: wrap; }
.news-card__views { display: flex; align-items: center; gap: 3px; }
.news-card__actions { display: flex; gap: 4px; padding: 8px 12px; border-top: 1px solid #f3f4f6; }

.icon-btn { width: 32px; height: 32px; border-radius: 6px; background: transparent; border: 1px solid #e5e9ef; color: #6b7280; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; }
.icon-btn:hover { border-color: #0079C2; color: #0079C2; background: #f0f9ff; }
.icon-btn--danger:hover { border-color: #ef4444; color: #ef4444; background: #fef2f2; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px; }
.modal { background: #fff; border-radius: 16px; width: 100%; max-width: 480px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
.modal__header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 0; }
.modal__header h2 { font-size: 16px; font-weight: 700; color: #111827; }
.modal__close { width: 32px; height: 32px; border-radius: 6px; background: #f3f4f6; border: none; color: #6b7280; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.modal__body { padding: 16px 24px; display: flex; flex-direction: column; gap: 12px; }
.form-label { font-size: 12px; font-weight: 700; color: #374151; margin-bottom: -6px; }
.form-input { width: 100%; padding: 9px 12px; border-radius: 8px; border: 1px solid #e5e9ef; font-size: 13px; outline: none; background: #f9fafb; color: #111827; font-family: inherit; }
.form-input:focus { border-color: #0079C2; background: #fff; }
.form-textarea { resize: vertical; }
.modal__footer { display: flex; gap: 10px; justify-content: flex-end; padding: 16px 24px 20px; border-top: 1px solid #f3f4f6; }

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