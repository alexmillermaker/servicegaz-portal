<template>
  <div class="events-page">
    <div class="events-page__header">
      <div>
        <h1 class="events-page__title">События</h1>
        <p class="events-page__sub">{{ events.length }} событий · {{ upcomingCount }} предстоящих</p>
      </div>
      <div style="display:flex;gap:10px">
        <div class="view-toggle">
          <button :class="['view-btn', view === 'list' && 'view-btn--active']" @click="view = 'list'">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            Список
          </button>
          <button :class="['view-btn', view === 'calendar' && 'view-btn--active']" @click="view = 'calendar'">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Календарь
          </button>
        </div>
        <button class="btn btn--primary" @click="openCreate">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Создать событие
        </button>
      </div>
    </div>

    <!-- Фильтры -->
    <div class="events-page__filters">
      <div class="search-wrap">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="search-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="search" placeholder="Поиск событий…" class="search-input" />
      </div>
      <select v-model="filterType" class="filter-select">
        <option value="">Все типы</option>
        <option value="meeting">Совещание</option>
        <option value="training">Обучение</option>
        <option value="corporate">Корпоратив</option>
        <option value="deadline">Дедлайн</option>
      </select>
      <select v-model="filterStatus" class="filter-select">
        <option value="">Все статусы</option>
        <option value="upcoming">Предстоящие</option>
        <option value="ongoing">Идёт сейчас</option>
        <option value="past">Прошедшие</option>
      </select>
    </div>

    <!-- Список -->
    <div v-if="view === 'list'" class="events-list">
      <div v-for="event in filtered" :key="event.id" class="event-card">
        <div class="event-card__date-col">
          <span class="event-card__day">{{ event.day }}</span>
          <span class="event-card__month">{{ event.month }}</span>
        </div>
        <div class="event-card__color-bar" :style="{ background: typeColor(event.type) }"></div>
        <div class="event-card__body">
          <div class="event-card__top">
            <span class="event-card__type-badge" :style="{ background: typeColor(event.type) + '22', color: typeColor(event.type) }">{{ typeLabel(event.type) }}</span>
            <span class="event-card__status" :class="`event-card__status--${event.status}`">{{ statusLabel(event.status) }}</span>
          </div>
          <h3 class="event-card__title">{{ event.title }}</h3>
          <div class="event-card__meta">
            <span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>{{ event.time }}</span>
            <span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>{{ event.location }}</span>
            <span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>{{ event.participants }} участников</span>
          </div>
        </div>
        <div class="event-card__actions">
          <button class="icon-btn" @click="editEvent(event)" title="Редактировать">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="icon-btn icon-btn--danger" @click="deleteEvent(event.id)" title="Удалить">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
          </button>
        </div>
      </div>
      <div v-if="filtered.length === 0" class="events-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <p>Нет событий</p>
      </div>
    </div>

    <!-- Календарь (упрощённый) -->
    <div v-else class="calendar-view">
      <div class="calendar-header">
        <button class="cal-nav" @click="prevMonth"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg></button>
        <span class="cal-month-title">{{ calMonthLabel }}</span>
        <button class="cal-nav" @click="nextMonth"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg></button>
      </div>
      <div class="calendar-grid">
        <div v-for="d in ['Пн','Вт','Ср','Чт','Пт','Сб','Вс']" :key="d" class="cal-day-header">{{ d }}</div>
        <div v-for="cell in calCells" :key="cell.key" class="cal-cell" :class="{ 'cal-cell--empty': !cell.day, 'cal-cell--today': cell.isToday, 'cal-cell--has-events': cell.events.length > 0 }">
          <span v-if="cell.day" class="cal-cell__num">{{ cell.day }}</span>
          <div class="cal-cell__events">
            <div v-for="ev in cell.events.slice(0,2)" :key="ev.id" class="cal-event-dot" :style="{ background: typeColor(ev.type) }" :title="ev.title"></div>
            <div v-if="cell.events.length > 2" class="cal-event-more">+{{ cell.events.length - 2 }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно создания/редактирования -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal">
          <div class="modal__header">
            <h2>{{ editingEvent ? 'Редактировать событие' : 'Новое событие' }}</h2>
            <button class="modal__close" @click="showModal = false"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
          <div class="modal__body">
            <label class="form-label">Название</label>
            <input v-model="form.title" class="form-input" placeholder="Название события" />
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
              <div>
                <label class="form-label">Дата</label>
                <input v-model="form.date" type="date" class="form-input" />
              </div>
              <div>
                <label class="form-label">Время</label>
                <input v-model="form.time" type="time" class="form-input" />
              </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
              <div>
                <label class="form-label">Тип</label>
                <select v-model="form.type" class="form-input">
                  <option value="meeting">Совещание</option>
                  <option value="training">Обучение</option>
                  <option value="corporate">Корпоратив</option>
                  <option value="deadline">Дедлайн</option>
                </select>
              </div>
              <div>
                <label class="form-label">Участников</label>
                <input v-model.number="form.participants" type="number" min="1" class="form-input" />
              </div>
            </div>
            <label class="form-label">Место проведения</label>
            <input v-model="form.location" class="form-input" placeholder="Офис, Zoom, …" />
            <label class="form-label">Описание</label>
            <textarea v-model="form.description" class="form-input form-textarea" rows="2" placeholder="Краткое описание…" />

            <label class="form-label">Видимость события</label>
            <select v-model="form.visibility" class="form-input" @change="form.audience = []; audienceSearch = ''">
              <option value="all">Все сотрудники</option>
              <option value="departments">По подразделениям</option>
              <option value="people">Конкретные сотрудники</option>
            </select>

            <!-- Выбор подразделений -->
            <div v-if="form.visibility === 'departments'" class="audience-section">
              <p class="audience-hint">Нажмите на подразделение для выбора:</p>
              <div v-if="allDepts.length" class="audience-tags">
                <button v-for="dept in allDepts" :key="dept" type="button"
                  class="audience-tag" :class="{ 'audience-tag--on': form.audience.includes(dept) }"
                  @click="toggleAudienceItem(dept)">{{ dept }}</button>
              </div>
              <p v-else class="audience-empty">Нет доступных подразделений</p>
              <p v-if="form.audience.length" class="audience-selected">Выбрано: {{ form.audience.join(', ') }}</p>
            </div>

            <!-- Выбор конкретных сотрудников -->
            <div v-if="form.visibility === 'people'" class="audience-section">
              <input v-model="audienceSearch" class="form-input" placeholder="Поиск сотрудника…" style="margin-bottom:8px" />
              <div class="audience-list">
                <label v-for="emp in filteredAudienceEmps.slice(0, 20)" :key="emp.id" class="audience-emp">
                  <input type="checkbox" :checked="form.audience.includes(emp.name)" @change="toggleAudienceItem(emp.name)" />
                  <span class="audience-emp__name">{{ emp.name }}</span>
                  <span v-if="emp.department" class="audience-emp__dept">{{ emp.department }}</span>
                </label>
                <p v-if="!filteredAudienceEmps.length" class="audience-empty">Сотрудники не найдены</p>
              </div>
              <p v-if="form.audience.length" class="audience-selected">Выбрано: {{ form.audience.length }} чел.</p>
            </div>
          </div>
          <div class="modal__footer">
            <button class="btn btn--outline" @click="showModal = false">Отмена</button>
            <button class="btn btn--primary" @click="saveEvent">{{ editingEvent ? 'Сохранить' : 'Создать' }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="deleteTarget !== null" class="modal-overlay" @click.self="deleteTarget=null">
        <div class="modal modal--sm">
          <div class="modal__header">
            <h2>Удалить событие?</h2>
            <button class="modal__close" @click="deleteTarget=null"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
          <div class="modal__body">
            <p style="font-size:14px;color:#374151;line-height:1.6">Событие <b>«{{ events.find(e=>e.id===deleteTarget)?.title }}»</b> будет безвозвратно удалено.</p>
          </div>
          <div class="modal__footer">
            <button class="btn btn--outline" @click="deleteTarget=null">Отмена</button>
            <button class="btn btn--danger" @click="doDeleteEvent">Удалить</button>
          </div>
        </div>
      </div>
    </Teleport>
    <Teleport to="body"><Transition name="toast"><div v-if="toast" class="toast">{{ toast }}</div></Transition></Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useEmployeesStore } from '@/store/employees'

interface Event { id: number; title: string; date: string; day: string; month: string; time: string; type: string; status: string; location: string; participants: number; description: string; dateObj: Date; visibility: 'all' | 'departments' | 'people'; audience: string[] }

function makeEvent(id: number, title: string, dateStr: string, time: string, type: string, status: string, location: string, participants: number, desc: string): Event {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  return { id, title, date: dateStr, day: String(d).padStart(2, '0'), month: dt.toLocaleString('ru', { month: 'short' }), time, type, status, location, participants, description: desc, dateObj: dt, visibility: 'all', audience: [] }
}

const events = ref<Event[]>([
  makeEvent(1, 'Еженедельная планёрка HR', '2026-06-09', '10:00', 'meeting', 'upcoming', 'Переговорная №2', 8, ''),
  makeEvent(2, 'Летний корпоратив', '2026-06-21', '16:00', 'corporate', 'upcoming', 'Загородная база', 45, ''),
  makeEvent(3, 'Курс по промышленной безопасности', '2026-06-15', '09:00', 'training', 'upcoming', 'Учебный центр', 20, ''),
  makeEvent(4, 'Сдача квартального отчёта', '2026-06-30', '18:00', 'deadline', 'upcoming', 'Онлайн', 5, ''),
  makeEvent(5, 'Стратегическая сессия', '2026-06-05', '14:00', 'meeting', 'past', 'Конференц-зал', 15, ''),
  makeEvent(6, 'Тренинг по продажам', '2026-05-28', '10:00', 'training', 'past', 'Зал А', 12, ''),
])

const empStore = useEmployeesStore()
const allDepts = computed(() => [...new Set(empStore.employees.map(e => e.department).filter(Boolean))].sort() as string[])
const audienceSearch = ref('')
const filteredAudienceEmps = computed(() => {
  const base = empStore.employees.filter(e => e.status !== 'ARCHIVED')
  if (!audienceSearch.value.trim()) return base
  const q = audienceSearch.value.toLowerCase()
  return base.filter(e => e.name.toLowerCase().includes(q) || (e.department ?? '').toLowerCase().includes(q))
})
function toggleAudienceItem(item: string) {
  const idx = form.audience.indexOf(item)
  if (idx === -1) form.audience.push(item)
  else form.audience.splice(idx, 1)
}

const view = ref<'list' | 'calendar'>('list')
const search = ref('')
const filterType = ref('')
const filterStatus = ref('')
const showModal = ref(false)
const editingEvent = ref<Event | null>(null)
const form = reactive({ title: '', date: '', time: '10:00', type: 'meeting', location: '', participants: 10, description: '', visibility: 'all' as 'all' | 'departments' | 'people', audience: [] as string[] })

const calYear = ref(2026)
const calMonth = ref(5)
const MONTHS_RU = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']
const calMonthLabel = computed(() => `${MONTHS_RU[calMonth.value]} ${calYear.value}`)
function prevMonth() { if (calMonth.value === 0) { calMonth.value = 11; calYear.value-- } else calMonth.value-- }
function nextMonth() { if (calMonth.value === 11) { calMonth.value = 0; calYear.value++ } else calMonth.value++ }

const calCells = computed(() => {
  const first = new Date(calYear.value, calMonth.value, 1)
  let startDow = first.getDay(); if (startDow === 0) startDow = 7
  const daysInMonth = new Date(calYear.value, calMonth.value + 1, 0).getDate()
  const today = new Date(); today.setHours(0,0,0,0)
  const cells = []
  for (let i = 1; i < startDow; i++) cells.push({ key: `e${i}`, day: 0, isToday: false, events: [] })
  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(calYear.value, calMonth.value, d)
    const evs = events.value.filter(e => e.dateObj.getFullYear() === calYear.value && e.dateObj.getMonth() === calMonth.value && e.dateObj.getDate() === d)
    cells.push({ key: `d${d}`, day: d, isToday: dt.getTime() === today.getTime(), events: evs })
  }
  return cells
})

const upcomingCount = computed(() => events.value.filter(e => e.status === 'upcoming').length)
const filtered = computed(() => {
  let list = events.value
  if (filterType.value) list = list.filter(e => e.type === filterType.value)
  if (filterStatus.value) list = list.filter(e => e.status === filterStatus.value)
  if (search.value) { const q = search.value.toLowerCase(); list = list.filter(e => e.title.toLowerCase().includes(q)) }
  return list
})

function typeColor(t: string) { return { meeting: '#0079C2', training: '#8b5cf6', corporate: '#22c55e', deadline: '#ef4444' }[t] ?? '#6b7280' }
function typeLabel(t: string) { return { meeting: 'Совещание', training: 'Обучение', corporate: 'Корпоратив', deadline: 'Дедлайн' }[t] ?? t }
function statusLabel(s: string) { return { upcoming: 'Предстоит', ongoing: 'Идёт', past: 'Прошло' }[s] ?? s }

function openCreate() { editingEvent.value = null; audienceSearch.value = ''; Object.assign(form, { title: '', date: '', time: '10:00', type: 'meeting', location: '', participants: 10, description: '', visibility: 'all', audience: [] }); showModal.value = true }
function editEvent(ev: Event) { editingEvent.value = ev; audienceSearch.value = ''; Object.assign(form, { title: ev.title, date: ev.date, time: ev.time, type: ev.type, location: ev.location, participants: ev.participants, description: ev.description, visibility: ev.visibility, audience: [...ev.audience] }); showModal.value = true }
function saveEvent() {
  if (!form.title.trim() || !form.date) return
  const [y, m, d] = form.date.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  const newEv: Event = { id: editingEvent.value?.id ?? Date.now(), title: form.title, date: form.date, day: String(d).padStart(2,'0'), month: dt.toLocaleString('ru', { month: 'short' }), time: form.time, type: form.type, status: 'upcoming', location: form.location, participants: form.participants, description: form.description, dateObj: dt, visibility: form.visibility, audience: [...form.audience] }
  if (editingEvent.value) {
    const idx = events.value.findIndex(e => e.id === editingEvent.value!.id)
    if (idx !== -1) events.value[idx] = newEv
  } else {
    events.value.push(newEv)
  }
  showModal.value = false
}
const deleteTarget = ref<number | null>(null)
const toast = ref('')
function showToast(msg: string) { toast.value = msg; setTimeout(() => toast.value = '', 2500) }
function deleteEvent(id: number) { deleteTarget.value = id }
function doDeleteEvent() {
  if (deleteTarget.value !== null) {
    events.value = events.value.filter(e => e.id !== deleteTarget.value)
    deleteTarget.value = null
    showToast('Событие удалено')
  }
}
</script>

<style scoped>
.events-page { width: 100%; }
.events-page__header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; gap: 16px; flex-wrap: wrap; }
.events-page__title { font-size: 22px; font-weight: 800; color: #111827; margin-bottom: 4px; }
.events-page__sub { font-size: 13px; color: #6b7280; }
.events-page__filters { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; background: #fff; border-radius: 12px; padding: 12px 16px; border: 1px solid #e5e9ef; margin-bottom: 16px; }
.search-wrap { position: relative; flex: 1; min-width: 200px; }
.search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #9ca3af; pointer-events: none; }
.search-input { width: 100%; padding: 8px 12px 8px 32px; border-radius: 8px; border: 1px solid #e5e9ef; font-size: 13px; outline: none; background: #f9fafb; color: #111827; }
.search-input:focus { border-color: #0079C2; background: #fff; }
.filter-select { padding: 8px 12px; border-radius: 8px; border: 1px solid #e5e9ef; font-size: 13px; background: #f9fafb; color: #374151; outline: none; cursor: pointer; }

.view-toggle { display: flex; background: #f3f4f6; border-radius: 8px; padding: 3px; gap: 3px; }
.view-btn { display: flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 6px; border: none; background: transparent; font-size: 12px; font-weight: 500; color: #6b7280; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
.view-btn--active { background: #fff; color: #111827; font-weight: 600; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }

.events-list { display: flex; flex-direction: column; gap: 10px; }
.events-empty { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 48px; color: #9ca3af; background: #fff; border-radius: 12px; border: 1px solid #e5e9ef; }

.event-card { background: #fff; border-radius: 12px; border: 1px solid #e5e9ef; display: flex; align-items: stretch; overflow: hidden; transition: box-shadow 0.15s; }
.event-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.07); }
.event-card__date-col { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 16px; min-width: 64px; background: #f8fafc; border-right: 1px solid #e5e9ef; }
.event-card__day { font-size: 22px; font-weight: 800; color: #111827; line-height: 1; }
.event-card__month { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
.event-card__color-bar { width: 4px; flex-shrink: 0; }
.event-card__body { flex: 1; padding: 14px 16px; display: flex; flex-direction: column; gap: 6px; }
.event-card__top { display: flex; align-items: center; gap: 8px; }
.event-card__type-badge { font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 20px; }
.event-card__status { font-size: 11px; color: #6b7280; }
.event-card__status--upcoming { color: #0079C2; font-weight: 600; }
.event-card__status--past { color: #9ca3af; }
.event-card__title { font-size: 14px; font-weight: 700; color: #111827; }
.event-card__meta { display: flex; gap: 14px; font-size: 12px; color: #6b7280; flex-wrap: wrap; }
.event-card__meta span { display: flex; align-items: center; gap: 4px; }
.event-card__meta svg { flex-shrink: 0; }
.event-card__actions { display: flex; flex-direction: column; gap: 4px; padding: 12px; justify-content: center; }

.icon-btn { width: 30px; height: 30px; border-radius: 6px; background: transparent; border: 1px solid #e5e9ef; color: #6b7280; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; }
.icon-btn:hover { border-color: #0079C2; color: #0079C2; background: #f0f9ff; }
.icon-btn--danger:hover { border-color: #ef4444; color: #ef4444; background: #fef2f2; }

/* Календарь */
.calendar-view { background: #fff; border-radius: 12px; border: 1px solid #e5e9ef; padding: 20px; }
.calendar-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.cal-month-title { font-size: 16px; font-weight: 700; color: #111827; }
.cal-nav { width: 32px; height: 32px; border-radius: 8px; border: 1px solid #e5e9ef; background: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #6b7280; transition: all 0.15s; }
.cal-nav:hover { border-color: #0079C2; color: #0079C2; }
.calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
.cal-day-header { text-align: center; font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; padding: 8px 4px; }
.cal-cell { min-height: 72px; border-radius: 8px; padding: 6px; border: 1px solid transparent; transition: border-color 0.15s; }
.cal-cell--empty { background: transparent; }
.cal-cell:not(.cal-cell--empty) { background: #f9fafb; cursor: pointer; }
.cal-cell:not(.cal-cell--empty):hover { border-color: #0079C2; }
.cal-cell--today { background: #e0f2fe; border-color: #0079C2; }
.cal-cell--has-events { border-color: #e5e9ef; }
.cal-cell__num { font-size: 13px; font-weight: 600; color: #374151; display: block; margin-bottom: 4px; }
.cal-cell--today .cal-cell__num { color: #0079C2; }
.cal-cell__events { display: flex; gap: 3px; flex-wrap: wrap; }
.cal-event-dot { width: 8px; height: 8px; border-radius: 50%; }
.cal-event-more { font-size: 10px; color: #6b7280; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px; }
.modal { background: #fff; border-radius: 16px; width: 100%; max-width: 480px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); max-height: 90vh; overflow-y: auto; }
.modal__header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 0; position: sticky; top: 0; background: #fff; z-index: 1; }
.modal__header h2 { font-size: 16px; font-weight: 700; color: #111827; }
.modal__close { width: 32px; height: 32px; border-radius: 6px; background: #f3f4f6; border: none; color: #6b7280; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.modal__body { padding: 16px 24px; display: flex; flex-direction: column; gap: 12px; }
.modal__footer { display: flex; gap: 10px; justify-content: flex-end; padding: 16px 24px 20px; border-top: 1px solid #f3f4f6; position: sticky; bottom: 0; background: #fff; }
.form-label { font-size: 12px; font-weight: 700; color: #374151; margin-bottom: -6px; }
.form-input { width: 100%; padding: 9px 12px; border-radius: 8px; border: 1px solid #e5e9ef; font-size: 13px; outline: none; background: #f9fafb; color: #111827; font-family: inherit; }
.form-input:focus { border-color: #0079C2; background: #fff; }
.form-textarea { resize: vertical; }

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

/* Audience selector */
.audience-section { display: flex; flex-direction: column; gap: 8px; background: #f9fafb; border: 1px solid #e5e9ef; border-radius: 8px; padding: 12px; }
.audience-hint { font-size: 12px; color: #6b7280; margin: 0; }
.audience-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.audience-tag { padding: 5px 12px; border-radius: 20px; border: 1.5px solid #e5e9ef; background: #fff; font-size: 12px; font-weight: 500; color: #374151; cursor: pointer; transition: all 0.15s; font-family: inherit; }
.audience-tag:hover { border-color: #0079C2; color: #0079C2; }
.audience-tag--on { background: #0079C2; border-color: #0079C2; color: #fff; }
.audience-list { display: flex; flex-direction: column; gap: 2px; max-height: 180px; overflow-y: auto; }
.audience-emp { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 6px; cursor: pointer; transition: background 0.12s; }
.audience-emp:hover { background: #fff; }
.audience-emp input[type=checkbox] { flex-shrink: 0; accent-color: #0079C2; width: 14px; height: 14px; cursor: pointer; }
.audience-emp__name { font-size: 13px; font-weight: 500; color: #111827; flex: 1; }
.audience-emp__dept { font-size: 11px; color: #9ca3af; }
.audience-empty { font-size: 12px; color: #9ca3af; text-align: center; padding: 8px 0; margin: 0; }
.audience-selected { font-size: 12px; color: #0079C2; font-weight: 600; margin: 0; }
</style>