<template>
  <div class="learning-page">
    <div class="learning-page__header">
      <div>
        <h1 class="learning-page__title">Обучение</h1>
        <p class="learning-page__sub">{{ courses.length }} курсов · {{ activeEnrollments }} активных записей</p>
      </div>
      <button class="btn btn--primary" @click="openCreate">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Добавить курс
      </button>
    </div>

    <div class="learning-page__filters">
      <div class="search-wrap">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="search-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="search" placeholder="Поиск курсов…" class="search-input" />
      </div>
      <select v-model="filterCategory" class="filter-select">
        <option value="">Все категории</option>
        <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
      </select>
      <select v-model="filterStatus" class="filter-select">
        <option value="">Все статусы</option>
        <option value="active">Активен</option>
        <option value="draft">Черновик</option>
        <option value="archived">Архив</option>
      </select>
    </div>

    <div class="learning-stats">
      <div class="learning-stat">
        <span class="learning-stat__val">{{ courses.filter(c=>c.status==='active').length }}</span>
        <span class="learning-stat__label">Активных курсов</span>
      </div>
      <div class="learning-stat">
        <span class="learning-stat__val">{{ activeEnrollments }}</span>
        <span class="learning-stat__label">Слушателей</span>
      </div>
      <div class="learning-stat">
        <span class="learning-stat__val">{{ avgCompletion }}%</span>
        <span class="learning-stat__label">Средняя завершаемость</span>
      </div>
      <div class="learning-stat">
        <span class="learning-stat__val">{{ courses.filter(c=>c.mandatory).length }}</span>
        <span class="learning-stat__label">Обязательных</span>
      </div>
    </div>

    <div class="learning-table-wrap">
      <table class="learning-table">
        <thead>
          <tr>
            <th>Курс</th><th>Категория</th><th>Записано</th><th>Завершили</th>
            <th>Прогресс</th><th>Дедлайн</th><th>Статус</th><th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="course in filtered" :key="course.id" class="learning-table__row">
            <td>
              <div class="course-cell">
                <div class="course-cell__icon" :style="{ background: catColor(course.category)+'22', color: catColor(course.category) }">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                </div>
                <div>
                  <div class="course-cell__name">{{ course.title }}</div>
                  <div class="course-cell__meta">{{ course.duration }} ·
                    <span v-if="course.mandatory" style="color:#ef4444;font-weight:600">Обязательный</span>
                    <span v-else style="color:#6b7280">Дополнительный</span>
                  </div>
                </div>
              </div>
            </td>
            <td><span class="cat-badge" :style="{ background: catColor(course.category)+'18', color: catColor(course.category) }">{{ course.category }}</span></td>
            <td class="learning-table__center">{{ course.enrollments.length }}</td>
            <td class="learning-table__center">{{ course.enrollments.filter(e=>e.status==='completed').length }}</td>
            <td>
              <div class="mini-bar"><div class="mini-bar__fill" :style="{ width: courseCompletion(course)+'%', background: courseCompletion(course)>=80?'#22c55e':'#0079C2' }"></div></div>
              <span class="mini-bar__pct">{{ courseCompletion(course) }}%</span>
            </td>
            <td class="learning-table__date">{{ course.deadline || '—' }}</td>
            <td>
              <span class="status-badge" :class="`status-badge--${course.status}`">
                {{ { active:'Активен', draft:'Черновик', archived:'Архив' }[course.status] }}
              </span>
            </td>
            <td>
              <div style="display:flex;gap:4px">
                <button class="icon-btn" @click="editCourse(course)" title="Редактировать">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="icon-btn icon-btn--blue" @click="openEnrollments(course)" title="Слушатели">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </button>
                <button class="icon-btn icon-btn--danger" @click="confirmArchive(course)" title="Архивировать">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="filtered.length===0"><td colspan="8" class="learning-table__empty">Курсы не найдены</td></tr>
        </tbody>
      </table>
    </div>

    <!-- Модал создания/редактирования курса -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal=false">
        <div class="modal">
          <div class="modal__header">
            <h2>{{ editingCourse ? 'Редактировать курс' : 'Добавить курс' }}</h2>
            <button class="modal__close" @click="showModal=false">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal__body">
            <div>
              <label class="form-label">Название курса</label>
              <input v-model="form.title" class="form-input" placeholder="Название курса" />
            </div>
            <div class="form-grid-2">
              <div>
                <label class="form-label">Категория</label>
                <select v-model="form.category" class="form-input">
                  <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
                </select>
              </div>
              <div>
                <label class="form-label">Длительность</label>
                <input v-model="form.duration" class="form-input" placeholder="4 часа" />
              </div>
            </div>
            <div>
              <label class="form-label">Дедлайн прохождения</label>
              <input v-model="form.deadline" type="date" class="form-input" />
            </div>
            <div>
              <label class="form-label">Статус</label>
              <select v-model="form.status" class="form-input">
                <option value="draft">Черновик</option>
                <option value="active">Активен</option>
              </select>
            </div>
            <label class="check-label">
              <input type="checkbox" v-model="form.mandatory" class="check-input" />
              <span>Обязательный для прохождения</span>
            </label>
          </div>
          <div class="modal__footer">
            <button class="btn btn--outline" @click="showModal=false">Отмена</button>
            <button class="btn btn--primary" @click="saveCourse" :disabled="!form.title.trim()">
              {{ editingCourse ? 'Сохранить' : 'Добавить' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Модал слушателей -->
    <Teleport to="body">
      <div v-if="showEnrollments && selectedCourse" class="modal-overlay" @click.self="showEnrollments=false">
        <div class="modal modal--wide">
          <div class="modal__header">
            <div>
              <h2>Слушатели курса</h2>
              <p class="modal__sub">{{ selectedCourse.title }} · {{ selectedCourse.enrollments.length }} записано</p>
            </div>
            <button class="modal__close" @click="showEnrollments=false">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal__body">
            <!-- Поиск для добавления -->
            <div class="enroll-add">
              <div class="search-wrap" style="flex:1">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="search-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input v-model="enrollSearch" class="search-input" placeholder="Начните вводить имя или отдел для добавления сотрудника…" />
              </div>
            </div>

            <!-- Подсказки -->
            <div v-if="enrollSearch.trim() && availableToAdd.length > 0" class="add-suggestions">
              <div v-for="emp in availableToAdd" :key="emp.id" class="add-suggestion" @click="addEnrollment(emp)">
                <div class="enroll-avatar" style="background:#e0f2fe;color:#0079C2;font-size:13px;font-weight:700">{{ emp.name[0] }}</div>
                <div class="enroll-info" style="flex:1">
                  <span class="enroll-name">{{ emp.name }}</span>
                  <span class="enroll-dept">{{ emp.department }} · {{ emp.phone }}</span>
                </div>
                <button class="btn btn--primary btn--xs" @click.stop="addEnrollment(emp)">+ Записать</button>
              </div>
            </div>
            <div v-else-if="enrollSearch.trim() && availableToAdd.length === 0" class="enroll-empty-hint">
              Все найденные сотрудники уже записаны на этот курс
            </div>

            <!-- Вкладки -->
            <div class="enroll-tabs">
              <button
                v-for="tab in enrollTabs" :key="tab.key"
                class="enroll-tab" :class="{ 'enroll-tab--active': enrollTab===tab.key }"
                @click="enrollTab=tab.key"
              >
                {{ tab.label }} <span class="enroll-tab-count">{{ tab.count }}</span>
              </button>
            </div>

            <!-- Список -->
            <div class="enroll-list">
              <div v-for="enroll in filteredEnrollments" :key="enroll.id" class="enroll-row">
                <div class="enroll-avatar" :style="{ background: enroll.status==='completed'?'#22c55e':enroll.status==='overdue'?'#ef4444':'#0079C2' }">
                  {{ enroll.name[0] }}
                </div>
                <div class="enroll-info" style="flex:1;min-width:0">
                  <span class="enroll-name">{{ enroll.name }}</span>
                  <span class="enroll-dept">{{ enroll.department }} · Записан {{ enroll.enrolledDate }}</span>
                </div>
                <div class="enroll-progress">
                  <div class="mini-bar" style="width:90px">
                    <div class="mini-bar__fill" :style="{ width: enroll.progress+'%', background: enroll.status==='completed'?'#22c55e':enroll.status==='overdue'?'#ef4444':'#0079C2' }"></div>
                  </div>
                  <span class="mini-bar__pct">{{ enroll.progress }}%</span>
                </div>
                <span class="status-badge" :class="`status-badge--enroll-${enroll.status}`">
                  {{ { active:'Обучается', completed:'Завершил', overdue:'Просрочил' }[enroll.status] }}
                </span>
                <button class="icon-btn icon-btn--danger" @click="removeEnrollment(enroll.id)" title="Отчислить">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                </button>
              </div>
              <div v-if="filteredEnrollments.length===0" class="enroll-empty">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                <p>Нет слушателей в этой категории</p>
              </div>
            </div>
          </div>
          <div class="modal__footer">
            <div class="modal__footer-info">
              Всего: {{ selectedCourse.enrollments.length }} &nbsp;·&nbsp;
              Завершили: {{ selectedCourse.enrollments.filter(e=>e.status==='completed').length }} &nbsp;·&nbsp;
              Просрочили: {{ selectedCourse.enrollments.filter(e=>e.status==='overdue').length }}
            </div>
            <button class="btn btn--outline" @click="showEnrollments=false">Закрыть</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Подтверждение архивирования -->
    <Teleport to="body">
      <div v-if="archiveTarget" class="modal-overlay" @click.self="archiveTarget=null">
        <div class="modal modal--sm">
          <div class="modal__header">
            <h2>Архивировать курс?</h2>
            <button class="modal__close" @click="archiveTarget=null">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal__body">
            <p style="font-size:14px;color:#374151;line-height:1.6">
              Курс <b>«{{ archiveTarget?.title }}»</b> будет переведён в архив.
              Записи слушателей сохранятся, но новые записи будут недоступны.
            </p>
          </div>
          <div class="modal__footer">
            <button class="btn btn--outline" @click="archiveTarget=null">Отмена</button>
            <button class="btn btn--danger" @click="doArchive">Архивировать</button>
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
import { storeToRefs } from 'pinia'
import { useLearningStore } from '@/store/learning'
import { useEmployeesStore } from '@/store/employees'
import type { Course, Enrollment } from '@/store/learning'

const learningStore = useLearningStore()
const empStore = useEmployeesStore()
const { courses } = storeToRefs(learningStore)

const allEmployees = computed(() => empStore.employees.filter(e => e.status !== 'ARCHIVED'))

const categories = ['Безопасность', 'IT', 'Soft skills', 'Право', 'Управление', 'Производство']
const search = ref('')
const filterCategory = ref('')
const filterStatus = ref('')

const showModal = ref(false)
const editingCourse = ref<Course | null>(null)
const form = reactive({ title: '', category: 'IT', duration: '', deadline: '', status: 'draft' as 'active' | 'draft', mandatory: false })

const showEnrollments = ref(false)
const selectedCourse = ref<Course | null>(null)
const enrollSearch = ref('')
const enrollTab = ref('all')

const archiveTarget = ref<Course | null>(null)

const toast = ref('')
function showToast(msg: string) { toast.value = msg; setTimeout(() => toast.value = '', 2500) }

const activeEnrollments = computed(() =>
  courses.value.filter(c => c.status === 'active').reduce((s, c) => s + c.enrollments.length, 0)
)
const avgCompletion = computed(() => {
  const active = courses.value.filter(c => c.status === 'active' && c.enrollments.length > 0)
  if (!active.length) return 0
  return Math.round(active.reduce((s, c) => s + courseCompletion(c), 0) / active.length)
})
const filtered = computed(() => {
  let list = courses.value
  if (filterCategory.value) list = list.filter(c => c.category === filterCategory.value)
  if (filterStatus.value) list = list.filter(c => c.status === filterStatus.value)
  if (search.value) { const q = search.value.toLowerCase(); list = list.filter(c => c.title.toLowerCase().includes(q)) }
  return list
})

function courseCompletion(course: Course) {
  if (!course.enrollments.length) return 0
  return Math.round(course.enrollments.reduce((s, e) => s + e.progress, 0) / course.enrollments.length)
}

const availableToAdd = computed(() => {
  if (!selectedCourse.value || !enrollSearch.value.trim()) return []
  const q = enrollSearch.value.toLowerCase()
  const enrolledIds = new Set(selectedCourse.value.enrollments.map(e => e.employeeId))
  return allEmployees.value.filter(emp =>
    !enrolledIds.has(emp.id) &&
    (emp.name.toLowerCase().includes(q) || emp.department.toLowerCase().includes(q) || emp.phone.includes(q))
  )
})

const enrollTabs = computed(() => {
  if (!selectedCourse.value) return []
  const e = selectedCourse.value.enrollments
  return [
    { key: 'all',       label: 'Все',         count: e.length },
    { key: 'active',    label: 'Обучается',   count: e.filter(x => x.status === 'active').length },
    { key: 'completed', label: 'Завершили',   count: e.filter(x => x.status === 'completed').length },
    { key: 'overdue',   label: 'Просрочили',  count: e.filter(x => x.status === 'overdue').length },
  ]
})

const filteredEnrollments = computed(() => {
  if (!selectedCourse.value) return []
  return enrollTab.value === 'all'
    ? selectedCourse.value.enrollments
    : selectedCourse.value.enrollments.filter(e => e.status === enrollTab.value)
})

function catColor(cat: string) {
  const map: Record<string, string> = {
    'Безопасность': '#ef4444', 'IT': '#0079C2', 'Soft skills': '#8b5cf6',
    'Право': '#f59e0b', 'Управление': '#22c55e', 'Производство': '#6b7280'
  }
  return map[cat] ?? '#6b7280'
}

function openCreate() {
  editingCourse.value = null
  Object.assign(form, { title: '', category: 'IT', duration: '', deadline: '', status: 'draft', mandatory: false })
  showModal.value = true
}

function editCourse(course: Course) {
  editingCourse.value = course
  Object.assign(form, { title: course.title, category: course.category, duration: course.duration, deadline: course.deadline, status: course.status, mandatory: course.mandatory })
  showModal.value = true
}

function saveCourse() {
  if (!form.title.trim()) return
  if (editingCourse.value) {
    learningStore.update(editingCourse.value.id, { title: form.title, category: form.category, duration: form.duration, deadline: form.deadline, status: form.status, mandatory: form.mandatory })
    showToast('Курс обновлён')
  } else {
    learningStore.add({ title: form.title, category: form.category, duration: form.duration, deadline: form.deadline, status: form.status, mandatory: form.mandatory, enrollments: [] })
    showToast('Курс добавлен')
  }
  showModal.value = false
}

function openEnrollments(course: Course) {
  selectedCourse.value = course
  enrollSearch.value = ''
  enrollTab.value = 'all'
  showEnrollments.value = true
}

function addEnrollment(emp: { id: string; name: string; department: string; phone: string }) {
  if (!selectedCourse.value) return
  const enrollment: Enrollment = {
    id: Date.now(), employeeId: emp.id, name: emp.name, department: emp.department, phone: emp.phone,
    progress: 0, status: 'active', enrolledDate: new Date().toLocaleDateString('ru-RU')
  }
  learningStore.addEnrollment(selectedCourse.value.id, enrollment)
  enrollSearch.value = ''
  showToast(`${emp.name} записан на курс`)
}

function removeEnrollment(enrollId: number) {
  if (!selectedCourse.value) return
  const name = selectedCourse.value.enrollments.find(e => e.id === enrollId)?.name
  learningStore.removeEnrollment(selectedCourse.value.id, enrollId)
  showToast(`${name} отчислен с курса`)
}

function confirmArchive(course: Course) { archiveTarget.value = course }

function doArchive() {
  if (archiveTarget.value) {
    learningStore.archive(archiveTarget.value.id)
    showToast('Курс переведён в архив')
    archiveTarget.value = null
  }
}
</script>

<style scoped>
.learning-page { width: 100%; }
.learning-page__header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; gap: 16px; flex-wrap: wrap; }
.learning-page__title { font-size: 22px; font-weight: 800; color: #111827; margin-bottom: 4px; }
.learning-page__sub { font-size: 13px; color: #6b7280; }
.learning-page__filters { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; background: #fff; border-radius: 12px; padding: 12px 16px; border: 1px solid #e5e9ef; margin-bottom: 16px; }
.search-wrap { position: relative; flex: 1; min-width: 200px; }
.search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #9ca3af; pointer-events: none; }
.search-input { width: 100%; padding: 8px 12px 8px 32px; border-radius: 8px; border: 1px solid #e5e9ef; font-size: 13px; outline: none; background: #f9fafb; color: #111827; font-family: inherit; }
.search-input:focus { border-color: #0079C2; background: #fff; }
.filter-select { padding: 8px 12px; border-radius: 8px; border: 1px solid #e5e9ef; font-size: 13px; background: #f9fafb; color: #374151; outline: none; cursor: pointer; font-family: inherit; }
.learning-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
.learning-stat { background: #fff; border-radius: 12px; border: 1px solid #e5e9ef; padding: 16px 20px; display: flex; flex-direction: column; }
.learning-stat__val { font-size: 26px; font-weight: 800; color: #111827; line-height: 1.1; }
.learning-stat__label { font-size: 12px; color: #6b7280; margin-top: 2px; }
.learning-table-wrap { background: #fff; border-radius: 12px; border: 1px solid #e5e9ef; overflow: auto; }
.learning-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.learning-table thead { background: #f8fafc; border-bottom: 1px solid #e5e9ef; }
.learning-table th { padding: 11px 14px; text-align: left; font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }
.learning-table__row { border-bottom: 1px solid #f3f4f6; transition: background 0.1s; }
.learning-table__row:last-child { border-bottom: none; }
.learning-table__row:hover { background: #f9fafb; }
.learning-table td { padding: 12px 14px; vertical-align: middle; }
.learning-table__center { text-align: center; font-size: 13px; font-weight: 600; color: #111827; }
.learning-table__date { font-size: 12px; color: #6b7280; white-space: nowrap; }
.learning-table__empty { text-align: center; padding: 48px; color: #9ca3af; }
.course-cell { display: flex; align-items: center; gap: 10px; }
.course-cell__icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.course-cell__name { font-size: 13px; font-weight: 600; color: #111827; }
.course-cell__meta { font-size: 11px; color: #6b7280; margin-top: 1px; }
.cat-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; white-space: nowrap; }
.mini-bar { height: 5px; background: #f3f4f6; border-radius: 3px; overflow: hidden; min-width: 80px; margin-bottom: 2px; }
.mini-bar__fill { height: 100%; border-radius: 3px; transition: width 0.4s ease; }
.mini-bar__pct { font-size: 11px; color: #6b7280; }
.status-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; white-space: nowrap; }
.status-badge--active { background: #e0f2fe; color: #0369a1; }
.status-badge--draft { background: #f3f4f6; color: #6b7280; }
.status-badge--archived { background: #e5e7eb; color: #9ca3af; }
.status-badge--enroll-active { background: #e0f2fe; color: #0369a1; }
.status-badge--enroll-completed { background: #d1fae5; color: #065f46; }
.status-badge--enroll-overdue { background: #fee2e2; color: #b91c1c; }
.icon-btn { width: 30px; height: 30px; border-radius: 6px; background: transparent; border: 1px solid #e5e9ef; color: #6b7280; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; flex-shrink: 0; }
.icon-btn:hover { border-color: #0079C2; color: #0079C2; background: #f0f9ff; }
.icon-btn--blue { border-color: #bfdbfe; color: #0079C2; background: #f0f9ff; }
.icon-btn--danger:hover { border-color: #ef4444; color: #ef4444; background: #fef2f2; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px; }
.modal { background: #fff; border-radius: 16px; width: 100%; max-width: 480px; box-shadow: 0 24px 64px rgba(0,0,0,0.25); max-height: 90vh; display: flex; flex-direction: column; }
.modal--wide { max-width: 720px; }
.modal--sm { max-width: 400px; }
.modal__header { display: flex; align-items: flex-start; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid #f3f4f6; flex-shrink: 0; }
.modal__header h2 { font-size: 16px; font-weight: 700; color: #111827; }
.modal__sub { font-size: 12px; color: #6b7280; margin-top: 2px; }
.modal__close { width: 32px; height: 32px; border-radius: 6px; background: #f3f4f6; border: none; color: #6b7280; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
.modal__body { padding: 16px 24px; display: flex; flex-direction: column; gap: 14px; overflow-y: auto; }
.modal__footer { display: flex; gap: 10px; justify-content: flex-end; align-items: center; padding: 16px 24px; border-top: 1px solid #f3f4f6; flex-shrink: 0; }
.modal__footer-info { flex: 1; font-size: 12px; color: #6b7280; }
.form-label { font-size: 12px; font-weight: 700; color: #374151; display: block; margin-bottom: 5px; }
.form-input { width: 100%; padding: 9px 12px; border-radius: 8px; border: 1px solid #e5e9ef; font-size: 13px; outline: none; background: #f9fafb; color: #111827; font-family: inherit; }
.form-input:focus { border-color: #0079C2; background: #fff; }
.form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.check-label { display: flex; align-items: center; gap: 10px; font-size: 13px; color: #374151; cursor: pointer; }
.check-input { width: 16px; height: 16px; accent-color: #0079C2; cursor: pointer; }
.enroll-add { display: flex; gap: 10px; align-items: center; }
.add-suggestions { border: 1px solid #e5e9ef; border-radius: 10px; overflow: hidden; margin-top: -8px; }
.add-suggestion { display: flex; align-items: center; gap: 12px; padding: 10px 14px; cursor: pointer; transition: background 0.1s; border-bottom: 1px solid #f3f4f6; }
.add-suggestion:last-child { border-bottom: none; }
.add-suggestion:hover { background: #f0f9ff; }
.enroll-empty-hint { font-size: 12px; color: #9ca3af; text-align: center; padding: 12px; background: #f9fafb; border-radius: 8px; }
.enroll-tabs { display: flex; gap: 3px; background: #f3f4f6; border-radius: 8px; padding: 3px; }
.enroll-tab { padding: 5px 12px; border-radius: 6px; border: none; background: transparent; font-size: 12px; font-weight: 500; color: #6b7280; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: all 0.15s; font-family: inherit; }
.enroll-tab--active { background: #fff; color: #111827; font-weight: 700; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
.enroll-tab-count { font-size: 11px; background: #e5e7eb; border-radius: 10px; padding: 1px 6px; }
.enroll-tab--active .enroll-tab-count { background: #dbeafe; color: #1d4ed8; }
.enroll-list { display: flex; flex-direction: column; }
.enroll-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
.enroll-row:last-child { border-bottom: none; }
.enroll-avatar { width: 34px; height: 34px; border-radius: 8px; color: #fff; font-size: 14px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: #0079C2; }
.enroll-name { font-size: 13px; font-weight: 600; color: #111827; display: block; }
.enroll-dept { font-size: 11px; color: #6b7280; }
.enroll-progress { display: flex; flex-direction: column; align-items: center; gap: 2px; flex-shrink: 0; }
.enroll-empty { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 32px; color: #9ca3af; text-align: center; }
.btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all 0.15s; font-family: inherit; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn--xs { padding: 4px 10px; font-size: 11px; border-radius: 6px; }
.btn--primary { background: #0079C2; color: #fff; }
.btn--primary:not(:disabled):hover { background: #005fa3; }
.btn--outline { background: #fff; border: 1px solid #e5e9ef; color: #374151; }
.btn--outline:hover { border-color: #0079C2; color: #0079C2; }
.btn--danger { background: #ef4444; color: #fff; }
.btn--danger:hover { background: #dc2626; }
.toast { position: fixed; bottom: 24px; right: 24px; background: #111827; color: #fff; padding: 12px 20px; border-radius: 10px; font-size: 13px; font-weight: 600; z-index: 9999; box-shadow: 0 4px 16px rgba(0,0,0,0.25); }
.toast-enter-active { transition: all 0.25s ease; }
.toast-leave-active { transition: all 0.2s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(10px); }
</style>
