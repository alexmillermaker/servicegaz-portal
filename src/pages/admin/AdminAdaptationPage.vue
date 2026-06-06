<template>
  <div class="adapt-page">
    <div class="adapt-page__header">
      <div>
        <h1 class="adapt-page__title">Адаптация сотрудников</h1>
        <p class="adapt-page__sub">{{ plans.length }} программ · {{ activePlans }} активных · {{ completedPlans }} завершено</p>
      </div>
      <button class="btn btn--primary" @click="openCreate">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Новая программа
      </button>
    </div>

    <div class="adapt-page__stats">
      <div class="stat-card">
        <div class="stat-card__icon" style="background:#e0f2fe;color:#0369a1">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
        </div>
        <div><span class="stat-card__val">{{ activePlans }}</span><span class="stat-card__label">На адаптации</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon" style="background:#fef9c3;color:#a16207">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <div><span class="stat-card__val">{{ overdueCount }}</span><span class="stat-card__label">Просрочено</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon" style="background:#d1fae5;color:#065f46">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
        </div>
        <div><span class="stat-card__val">{{ completedPlans }}</span><span class="stat-card__label">Завершено</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon" style="background:#f3e8ff;color:#6b21a8">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18 M9 21V9"/></svg>
        </div>
        <div><span class="stat-card__val">{{ avgPct }}%</span><span class="stat-card__label">Средний прогресс</span></div>
      </div>
    </div>

    <div class="adapt-page__filters">
      <div class="search-wrap">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="search-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="search" placeholder="Поиск по сотруднику или программе…" class="search-input" />
      </div>
      <select v-model="filterStatus" class="filter-select">
        <option value="">Все статусы</option>
        <option value="active">Активна</option>
        <option value="completed">Завершена</option>
        <option value="overdue">Просрочена</option>
      </select>
      <select v-model="filterDept" class="filter-select">
        <option value="">Все отделы</option>
        <option v-for="d in depts" :key="d" :value="d">{{ d }}</option>
      </select>
    </div>

    <div class="adapt-page__list">
      <div v-for="plan in filtered" :key="plan.id" class="plan-card">
        <div class="plan-card__head">
          <div class="plan-card__avatar">{{ plan.employee[0] }}</div>
          <div class="plan-card__info">
            <span class="plan-card__employee">{{ plan.employee }}</span>
            <span class="plan-card__dept">{{ plan.department }} · {{ plan.position }}</span>
          </div>
          <span class="plan-card__status" :class="`plan-card__status--${plan.status}`">
            {{ { active: 'Активна', completed: 'Завершена', overdue: 'Просрочена' }[plan.status] }}
          </span>
        </div>
        <div class="plan-card__program-row">
          <span class="plan-card__program-label">Программа:</span>
          <span class="plan-card__program-name">{{ plan.programName }}</span>
        </div>
        <div class="plan-card__progress">
          <div class="plan-card__progress-labels">
            <span>Прогресс</span><span style="font-weight:700;color:#111827">{{ plan.progress }}%</span>
          </div>
          <div class="plan-card__bar"><div class="plan-card__bar-fill"
            :style="{ width: plan.progress + '%', background: plan.status === 'overdue' ? '#ef4444' : plan.status === 'completed' ? '#22c55e' : '#0079C2' }"></div></div>
        </div>
        <div class="plan-card__tasks">
          <div v-for="(task, ti) in plan.tasks" :key="ti" class="plan-task" :class="{ 'plan-task--done': task.done }">
            <svg v-if="task.done" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/></svg>
            <span>{{ task.label }}</span>
          </div>
        </div>
        <div class="plan-card__footer">
          <div class="plan-card__dates">
            <span>Начало: {{ plan.startDate }}</span>
            <span>Дедлайн: <b :style="plan.status === 'overdue' ? 'color:#ef4444' : ''">{{ plan.deadline }}</b></span>
            <span>Куратор: {{ plan.mentor }}</span>
          </div>
          <div style="display:flex;gap:6px">
            <button class="btn btn--outline btn--sm" @click="openEdit(plan)">Редактировать</button>
            <button class="btn btn--sm" :class="plan.status === 'completed' ? 'btn--outline' : 'btn--primary'" @click="toggleComplete(plan)">
              {{ plan.status === 'completed' ? 'Возобновить' : 'Завершить' }}
            </button>
          </div>
        </div>
      </div>
      <div v-if="filtered.length === 0" class="adapt-page__empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
        <p>Нет программ адаптации по выбранным фильтрам</p>
      </div>
    </div>

    <!-- Модал создания/редактирования -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <div class="modal__header">
            <h2>{{ editingPlan ? 'Редактировать программу' : 'Новая программа адаптации' }}</h2>
            <button class="modal__close" @click="closeModal">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal__body">
            <div class="form-row-2">
              <div>
                <label class="form-label">Сотрудник</label>
                <input v-model="form.employee" class="form-input" placeholder="Иванов Иван Иванович" />
              </div>
              <div>
                <label class="form-label">Отдел</label>
                <select v-model="form.department" class="form-input">
                  <option>IT</option><option>HR</option><option>Производство</option><option>Бухгалтерия</option><option>Продажи</option>
                </select>
              </div>
            </div>
            <div class="form-row-2">
              <div>
                <label class="form-label">Должность</label>
                <input v-model="form.position" class="form-input" placeholder="Разработчик" />
              </div>
              <div>
                <label class="form-label">Куратор</label>
                <input v-model="form.mentor" class="form-input" placeholder="Карпова А.В." />
              </div>
            </div>
            <label class="form-label">Программа адаптации</label>
            <select v-model="form.programName" class="form-input">
              <option>Онбординг разработчика</option>
              <option>Онбординг HR-специалиста</option>
              <option>Адаптация инженера</option>
              <option>Онбординг бухгалтера</option>
              <option>Общий онбординг</option>
            </select>
            <div class="form-row-2">
              <div>
                <label class="form-label">Дата начала</label>
                <input v-model="form.startDate" type="date" class="form-input" />
              </div>
              <div>
                <label class="form-label">Дедлайн</label>
                <input v-model="form.deadline" type="date" class="form-input" />
              </div>
            </div>
            <label class="form-label">Задачи адаптации</label>
            <div class="tasks-editor">
              <div v-for="(task, idx) in form.tasks" :key="idx" class="task-editor-row">
                <input v-model="task.label" class="form-input" placeholder="Название задачи" style="flex:1" />
                <button class="icon-btn icon-btn--danger" @click="form.tasks.splice(idx,1)">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <button class="btn btn--outline btn--sm" @click="form.tasks.push({ label: '', done: false })">+ Добавить задачу</button>
            </div>
          </div>
          <div class="modal__footer">
            <button class="btn btn--outline" @click="closeModal">Отмена</button>
            <button class="btn btn--primary" @click="savePlan" :disabled="!form.employee.trim()">
              {{ editingPlan ? 'Сохранить' : 'Создать программу' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Тост -->
    <Teleport to="body">
      <Transition name="toast"><div v-if="toastMsg" class="toast">{{ toastMsg }}</div></Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'

interface Task { label: string; done: boolean }
interface Plan { id: number; employee: string; department: string; position: string; programName: string; progress: number; status: 'active'|'completed'|'overdue'; startDate: string; deadline: string; mentor: string; tasks: Task[] }

const plans = ref<Plan[]>([
  { id: 1, employee: 'Иванов Павел', department: 'IT', position: 'Разработчик', programName: 'Онбординг разработчика', progress: 65, status: 'active', startDate: '12.05.2026', deadline: '12.07.2026', mentor: 'Смирнов К.Д.', tasks: [{ label: 'Знакомство с командой', done: true }, { label: 'Настройка рабочей среды', done: true }, { label: 'Изучение архитектуры', done: false }, { label: 'Первый pull request', done: false }] },
  { id: 2, employee: 'Петрова Анна', department: 'HR', position: 'Рекрутер', programName: 'Онбординг HR-специалиста', progress: 100, status: 'completed', startDate: '01.04.2026', deadline: '01.06.2026', mentor: 'Карпова А.В.', tasks: [{ label: 'Знакомство с процессами', done: true }, { label: 'Изучение CRM', done: true }, { label: 'Первый самостоятельный найм', done: true }, { label: 'Аттестация', done: true }] },
  { id: 3, employee: 'Козлов Дмитрий', department: 'Производство', position: 'Инженер', programName: 'Адаптация инженера', progress: 30, status: 'overdue', startDate: '01.03.2026', deadline: '01.05.2026', mentor: 'Волков Д.Р.', tasks: [{ label: 'Инструктаж по ОТ и ТБ', done: true }, { label: 'Изучение регламентов', done: false }, { label: 'Работа под наблюдением', done: false }, { label: 'Самостоятельная смена', done: false }] },
  { id: 4, employee: 'Новикова Светлана', department: 'Бухгалтерия', position: 'Бухгалтер', programName: 'Онбординг бухгалтера', progress: 45, status: 'active', startDate: '20.05.2026', deadline: '20.07.2026', mentor: 'Карпова А.В.', tasks: [{ label: 'Знакомство с 1С', done: true }, { label: 'Изучение учётной политики', done: true }, { label: 'Первичная документация', done: false }, { label: 'Отчётный период', done: false }] },
])

const search = ref(''); const filterStatus = ref(''); const filterDept = ref('')
const showModal = ref(false); const editingPlan = ref<Plan | null>(null)
const toastMsg = ref('')
const form = reactive({ employee: '', department: 'IT', position: '', mentor: '', programName: 'Онбординг разработчика', startDate: '', deadline: '', tasks: [] as Task[] })

const depts = computed(() => [...new Set(plans.value.map(p => p.department))])
const activePlans = computed(() => plans.value.filter(p => p.status === 'active').length)
const completedPlans = computed(() => plans.value.filter(p => p.status === 'completed').length)
const overdueCount = computed(() => plans.value.filter(p => p.status === 'overdue').length)
const avgPct = computed(() => plans.value.length ? Math.round(plans.value.reduce((s, p) => s + p.progress, 0) / plans.value.length) : 0)

const filtered = computed(() => {
  let list = plans.value
  if (filterStatus.value) list = list.filter(p => p.status === filterStatus.value)
  if (filterDept.value) list = list.filter(p => p.department === filterDept.value)
  if (search.value) { const q = search.value.toLowerCase(); list = list.filter(p => p.employee.toLowerCase().includes(q) || p.programName.toLowerCase().includes(q)) }
  return list
})

function openCreate() {
  editingPlan.value = null
  const today = new Date().toISOString().split('T')[0]
  const deadline = new Date(Date.now() + 60*24*60*60*1000).toISOString().split('T')[0]
  Object.assign(form, { employee: '', department: 'IT', position: '', mentor: '', programName: 'Онбординг разработчика', startDate: today, deadline, tasks: [{ label: 'Знакомство с командой', done: false }, { label: 'Изучение процессов', done: false }] })
  showModal.value = true
}

function openEdit(plan: Plan) {
  editingPlan.value = plan
  const fmt = (s: string) => { const [d,m,y] = s.split('.'); return `${y}-${m}-${d}` }
  Object.assign(form, { employee: plan.employee, department: plan.department, position: plan.position, mentor: plan.mentor, programName: plan.programName, startDate: fmt(plan.startDate), deadline: fmt(plan.deadline), tasks: plan.tasks.map(t => ({ ...t })) })
  showModal.value = true
}

function closeModal() { showModal.value = false }

function savePlan() {
  if (!form.employee.trim()) return
  const fmtDate = (s: string) => { if (!s) return '—'; const [y,m,d] = s.split('-'); return `${d}.${m}.${y}` }
  const tasks = form.tasks.filter(t => t.label.trim())
  const done = tasks.filter(t => t.done).length
  const progress = tasks.length ? Math.round(done / tasks.length * 100) : 0

  if (editingPlan.value) {
    const p = plans.value.find(p => p.id === editingPlan.value!.id)
    if (p) Object.assign(p, { employee: form.employee, department: form.department, position: form.position, mentor: form.mentor, programName: form.programName, startDate: fmtDate(form.startDate), deadline: fmtDate(form.deadline), tasks, progress })
    showToast('Программа обновлена')
  } else {
    plans.value.unshift({ id: Date.now(), employee: form.employee, department: form.department, position: form.position, mentor: form.mentor, programName: form.programName, startDate: fmtDate(form.startDate), deadline: fmtDate(form.deadline), tasks, progress, status: 'active' })
    showToast('Программа создана')
  }
  showModal.value = false
}

function toggleComplete(plan: Plan) {
  plan.status = plan.status === 'completed' ? 'active' : 'completed'
  if (plan.status === 'completed') { plan.progress = 100; plan.tasks.forEach(t => t.done = true) }
  showToast(plan.status === 'completed' ? 'Программа завершена' : 'Программа возобновлена')
}

function showToast(msg: string) { toastMsg.value = msg; setTimeout(() => toastMsg.value = '', 2500) }
</script>

<style scoped>
.adapt-page { width: 100%; }
.adapt-page__header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; gap: 16px; flex-wrap: wrap; }
.adapt-page__title { font-size: 22px; font-weight: 800; color: #111827; margin-bottom: 4px; }
.adapt-page__sub { font-size: 13px; color: #6b7280; }
.adapt-page__stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 20px; }
.stat-card { background: #fff; border-radius: 12px; border: 1px solid #e5e9ef; padding: 16px; display: flex; align-items: center; gap: 14px; }
.stat-card__icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-card__val { font-size: 24px; font-weight: 800; color: #111827; line-height: 1.1; display: block; }
.stat-card__label { font-size: 12px; color: #6b7280; }
.adapt-page__filters { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; background: #fff; border-radius: 12px; padding: 12px 16px; border: 1px solid #e5e9ef; margin-bottom: 16px; }
.search-wrap { position: relative; flex: 1; min-width: 200px; }
.search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #9ca3af; pointer-events: none; }
.search-input { width: 100%; padding: 8px 12px 8px 32px; border-radius: 8px; border: 1px solid #e5e9ef; font-size: 13px; outline: none; background: #f9fafb; color: #111827; }
.search-input:focus { border-color: #0079C2; background: #fff; }
.filter-select { padding: 8px 12px; border-radius: 8px; border: 1px solid #e5e9ef; font-size: 13px; background: #f9fafb; color: #374151; outline: none; cursor: pointer; }
.adapt-page__list { display: flex; flex-direction: column; gap: 12px; }
.adapt-page__empty { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 48px; color: #9ca3af; background: #fff; border-radius: 12px; border: 1px solid #e5e9ef; }
.plan-card { background: #fff; border-radius: 12px; border: 1px solid #e5e9ef; padding: 18px 20px; display: flex; flex-direction: column; gap: 14px; }
.plan-card__head { display: flex; align-items: center; gap: 12px; }
.plan-card__avatar { width: 40px; height: 40px; border-radius: 10px; background: #0079C2; color: #fff; font-size: 16px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.plan-card__info { flex: 1; }
.plan-card__employee { font-size: 15px; font-weight: 700; color: #111827; display: block; }
.plan-card__dept { font-size: 12px; color: #6b7280; }
.plan-card__status { padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; white-space: nowrap; flex-shrink: 0; }
.plan-card__status--active { background: #e0f2fe; color: #0369a1; }
.plan-card__status--completed { background: #d1fae5; color: #065f46; }
.plan-card__status--overdue { background: #fee2e2; color: #b91c1c; }
.plan-card__program-row { display: flex; align-items: center; gap: 8px; font-size: 13px; }
.plan-card__program-label { color: #6b7280; }
.plan-card__program-name { font-weight: 600; color: #111827; }
.plan-card__progress { display: flex; flex-direction: column; gap: 6px; }
.plan-card__progress-labels { display: flex; justify-content: space-between; font-size: 12px; color: #6b7280; }
.plan-card__bar { height: 6px; background: #f3f4f6; border-radius: 4px; overflow: hidden; }
.plan-card__bar-fill { height: 100%; border-radius: 4px; transition: width 0.5s ease; }
.plan-card__tasks { display: flex; flex-wrap: wrap; gap: 8px; }
.plan-task { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #374151; }
.plan-task--done { color: #6b7280; text-decoration: line-through; }
.plan-card__footer { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; padding-top: 10px; border-top: 1px solid #f3f4f6; }
.plan-card__dates { display: flex; gap: 16px; font-size: 12px; color: #6b7280; flex-wrap: wrap; }
/* Модал */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px; }
.modal { background: #fff; border-radius: 16px; width: 100%; max-width: 540px; box-shadow: 0 24px 64px rgba(0,0,0,0.25); max-height: 90vh; display: flex; flex-direction: column; }
.modal__header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid #f3f4f6; flex-shrink: 0; }
.modal__header h2 { font-size: 16px; font-weight: 700; color: #111827; }
.modal__close { width: 32px; height: 32px; border-radius: 6px; background: #f3f4f6; border: none; color: #6b7280; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.modal__body { padding: 20px 24px; display: flex; flex-direction: column; gap: 14px; overflow-y: auto; }
.modal__footer { display: flex; gap: 10px; justify-content: flex-end; padding: 16px 24px; border-top: 1px solid #f3f4f6; flex-shrink: 0; }
.form-label { font-size: 12px; font-weight: 700; color: #374151; display: block; margin-bottom: 5px; }
.form-input { width: 100%; padding: 9px 12px; border-radius: 8px; border: 1px solid #e5e9ef; font-size: 13px; outline: none; background: #f9fafb; color: #111827; font-family: inherit; }
.form-input:focus { border-color: #0079C2; background: #fff; }
.form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.tasks-editor { display: flex; flex-direction: column; gap: 8px; }
.task-editor-row { display: flex; gap: 8px; align-items: center; }
.icon-btn { width: 32px; height: 32px; border-radius: 6px; background: transparent; border: 1px solid #e5e9ef; color: #6b7280; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; flex-shrink: 0; }
.icon-btn--danger:hover { border-color: #ef4444; color: #ef4444; background: #fef2f2; }
/* Тост */
.toast { position: fixed; bottom: 24px; right: 24px; background: #111827; color: #fff; padding: 12px 20px; border-radius: 10px; font-size: 13px; font-weight: 600; z-index: 9999; box-shadow: 0 4px 16px rgba(0,0,0,0.25); }
.toast-enter-active { transition: all 0.25s ease; }
.toast-leave-active { transition: all 0.2s ease; }
.toast-enter-from,.toast-leave-to { opacity: 0; transform: translateY(10px); }
/* Кнопки */
.btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all 0.15s; font-family: inherit; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn--sm { padding: 6px 14px; font-size: 12px; }
.btn--primary { background: #0079C2; color: #fff; }
.btn--primary:not(:disabled):hover { background: #005fa3; }
.btn--outline { background: #fff; border: 1px solid #e5e9ef; color: #374151; }
.btn--outline:hover { border-color: #0079C2; color: #0079C2; }
</style>