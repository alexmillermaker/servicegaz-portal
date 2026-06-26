<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import MobileNavigation from '@/widgets/MobileNavigation.vue'
import AppPageHeader from '@/shared/ui/AppPageHeader.vue'
import { useAuthStore } from '@/store/auth'
import { useAdaptationStore } from '@/store/adaptation'
import type { AdaptTask } from '@/store/adaptation'
import { onboardingTasks } from '@/api/mockData'
import { saveOnboardingProgress } from '@/api/mockClient'
import { useToast } from '@/shared/composables/useToast'
import { useHaptic } from '@/shared/composables/useHaptic'

const auth = useAuthStore()
const router = useRouter()
const adaptStore = useAdaptationStore()
const toast = useToast()
const haptic = useHaptic()
const completing = ref(false)

const plan = computed(() => auth.employee?.id ? adaptStore.findByEmployeeId(auth.employee.id) : undefined)

const tasks = computed<AdaptTask[]>(() => plan.value?.tasks ?? onboardingTasks.map(task => ({
  label: task.text,
  done: auth.completedOnboarding.includes(task.id),
})))
const doneCount = computed(() => tasks.value.filter(t => t.done).length)
const progress = computed(() => tasks.value.length ? Math.round(doneCount.value / tasks.value.length * 100) : 0)
const allDone = computed(() => tasks.value.length > 0 && doneCount.value === tasks.value.length)
const isCompleted = computed(() => plan.value?.status === 'completed' || (!plan.value && auth.onboardingDone))

function persistProgress(nextDoneIndexes: number[]) {
  if (!auth.employee) return
  auth.setOnboardingProgress(nextDoneIndexes)
  void saveOnboardingProgress(auth.employee.id, nextDoneIndexes)
}

function toggleTask(index: number) {
  if (isCompleted.value || !auth.employee) return
  haptic.tap()

  if (plan.value) {
    const nextTasks = plan.value.tasks.map((task, taskIndex) => taskIndex === index ? { ...task, done: !task.done } : { ...task })
    const nextDoneIndexes = nextTasks.flatMap((task, taskIndex) => task.done ? [taskIndex] : [])
    const nextProgress = nextTasks.length ? Math.round((nextDoneIndexes.length / nextTasks.length) * 100) : 0
    adaptStore.update(plan.value.id, { tasks: nextTasks, progress: nextProgress })
    persistProgress(nextDoneIndexes)
    return
  }

  const nextDoneIndexes = tasks.value.flatMap((task, taskIndex) => (taskIndex === index ? !task.done : task.done) ? [taskIndex] : [])
  persistProgress(nextDoneIndexes)
}

async function finishOnboarding() {
  if (!allDone.value || isCompleted.value || completing.value || !auth.employee) return
  completing.value = true
  haptic.heavy()
  const doneIndexes = tasks.value.map((_, index) => index)
  await saveOnboardingProgress(auth.employee.id, doneIndexes)
  auth.setOnboardingProgress(doneIndexes)
  auth.completeOnboarding()
  if (plan.value) adaptStore.update(plan.value.id, { progress: 100, status: 'completed' })
  completing.value = false
  toast.success('Адаптация успешно завершена!')
}

const planInfo = computed(() => {
  if (plan.value) {
    return { programName: plan.value.programName, mentor: plan.value.mentor, startDate: plan.value.startDate, deadline: plan.value.deadline }
  }
  const hire = auth.employee?.hireDate
  const deadline = (() => {
    if (!hire) return '—'
    const d = new Date(hire); d.setDate(d.getDate() + 90)
    return d.toLocaleDateString('ru-RU')
  })()
  return { programName: 'Онбординг сотрудника', mentor: 'Морозова Е.А.', startDate: hire ?? '—', deadline }
})

function formatDate(s: string) {
  if (!s || s === '—') return '—'
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(s)) return s
  return new Date(s).toLocaleDateString('ru-RU')
}

const statusLabel = computed(() => {
  if (plan.value) return { active: 'В процессе', completed: 'Завершено', overdue: 'Просрочено' }[plan.value.status] ?? 'В процессе'
  if (progress.value === 100) return 'Завершено'
  const d = new Date(auth.employee?.hireDate ?? ''); d.setDate(d.getDate() + 90)
  if (d < new Date()) return 'Просрочено'
  return 'В процессе'
})

const statusClass = computed(() => {
  if (statusLabel.value === 'Завершено') return 'status--done'
  if (statusLabel.value === 'Просрочено') return 'status--overdue'
  return 'status--active'
})
</script>

<template>
  <div class="adapt-page">
    <AppPageHeader back @back="router.back()" />

    <div class="adapt-page__top">
      <h1 class="adapt-page__title">Моя адаптация</h1>
      <span class="adapt-page__status" :class="statusClass">{{ statusLabel }}</span>
    </div>

    <!-- Инфо-карточка -->
    <div class="adapt-page__info-card">
      <div class="info-row">
        <span class="info-row__label">Программа</span>
        <span class="info-row__val">{{ planInfo.programName }}</span>
      </div>
      <div class="info-row">
        <span class="info-row__label">Куратор</span>
        <span class="info-row__val">{{ planInfo.mentor }}</span>
      </div>
      <div class="info-row">
        <span class="info-row__label">Дата начала</span>
        <span class="info-row__val">{{ formatDate(planInfo.startDate) }}</span>
      </div>
      <div class="info-row">
        <span class="info-row__label">Дедлайн</span>
        <span class="info-row__val">{{ planInfo.deadline }}</span>
      </div>
    </div>

    <!-- Прогресс -->
    <div class="adapt-page__progress-block">
      <div class="progress-header">
        <span class="progress-header__label">Прогресс</span>
        <span class="progress-header__val">{{ doneCount }} / {{ tasks.length }} задач</span>
        <span class="progress-header__pct">{{ progress }}%</span>
      </div>
      <div class="progress-bar">
        <div
          class="progress-bar__fill"
          :style="{
            width: progress + '%',
            background: progress === 100 ? 'var(--c-success)' : statusLabel === 'Просрочено' ? 'var(--c-danger)' : 'var(--c-accent)'
          }"
        />
      </div>
    </div>

    <!-- Задачи -->
    <div class="adapt-page__tasks">
      <h2 class="adapt-page__tasks-title">Задачи</h2>
      <p v-if="!isCompleted" class="adapt-page__tasks-hint">Отмечайте задачи самостоятельно по мере выполнения.</p>
      <button
        v-for="(task, ti) in tasks"
        :key="ti"
        type="button"
        class="task-item"
        :class="{ 'task-item--done': task.done }"
        :disabled="isCompleted"
        @click="toggleTask(ti)"
      >
        <div class="task-item__check">
          <svg v-if="task.done" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--c-success)" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--c-border-2)" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/></svg>
        </div>
        <div class="task-item__body">
          <span class="task-item__label">{{ task.label }}</span>
          <span v-if="task.detail" class="task-item__detail">{{ task.detail }}</span>
        </div>
        <div v-if="task.done" class="task-item__done-badge">Готово</div>
      </button>

      <button
        v-if="!isCompleted"
        type="button"
        class="adapt-page__finish-btn"
        :disabled="!allDone || completing"
        @click="finishOnboarding"
      >
        {{ completing ? 'Завершаем…' : 'Завершить адаптацию' }}
      </button>
    </div>

    <div class="nav-spacer" />
    <MobileNavigation />
  </div>
</template>

<style scoped>
.adapt-page { background: var(--c-bg); min-height: 100dvh; }

.adapt-page__top {
  padding: var(--gap-xs) var(--gap-md) var(--gap-md);
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
  flex-wrap: wrap;
}
.adapt-page__title { font-size: var(--fs-xl); font-weight: 700; }
.adapt-page__status {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: var(--r-full);
}
.status--active  { background: #dbeafe; color: #1d4ed8; }
.status--done    { background: #d1fae5; color: var(--c-success); }
.status--overdue { background: #fee2e2; color: var(--c-danger); }

/* ── Инфо-карточка ── */
.adapt-page__info-card {
  margin: 0 var(--gap-md) var(--gap-md);
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-xl);
  padding: var(--gap-sm) var(--gap-md);
  display: flex;
  flex-direction: column;
  gap: 2px;
  box-shadow: var(--shadow-sm);
}
.info-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid var(--c-bg-2); }
.info-row:last-child { border-bottom: none; }
.info-row__label { font-size: var(--fs-sm); color: var(--c-text-3); }
.info-row__val { font-size: var(--fs-sm); font-weight: 600; color: var(--c-text); }

/* ── Прогресс ── */
.adapt-page__progress-block {
  margin: 0 var(--gap-md) var(--gap-md);
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-xl);
  padding: var(--gap-md);
  box-shadow: var(--shadow-sm);
}
.progress-header { display: flex; align-items: center; gap: var(--gap-xs); margin-bottom: var(--gap-sm); }
.progress-header__label { font-size: var(--fs-sm); color: var(--c-text-2); flex: 1; }
.progress-header__val { font-size: var(--fs-sm); color: var(--c-text-3); }
.progress-header__pct { font-size: var(--fs-sm); font-weight: 700; color: var(--c-accent); min-width: 36px; text-align: right; }
.progress-bar { height: 8px; background: var(--c-bg-2); border-radius: var(--r-full); overflow: hidden; }
.progress-bar__fill { height: 100%; border-radius: var(--r-full); transition: width 0.4s var(--ease-out); }

/* ── Задачи ── */
.adapt-page__tasks { padding: 0 var(--gap-md) var(--gap-md); }
.adapt-page__tasks-title { font-size: var(--fs-md); font-weight: 700; margin-bottom: var(--gap-sm); }
.adapt-page__tasks-hint { font-size: var(--fs-xs); color: var(--c-text-3); margin: calc(var(--gap-xs) * -1) 0 var(--gap-sm); }

.task-item {
  width: 100%;
  text-align: left;
  color: var(--c-text);
  font-family: var(--font-body);
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-xl);
  padding: var(--gap-sm) var(--gap-md);
  display: flex;
  align-items: flex-start;
  gap: var(--gap-sm);
  margin-bottom: var(--gap-sm);
  box-shadow: var(--shadow-sm);
  transition: opacity var(--dur-fast);
  cursor: pointer;
}
.task-item:active:not(:disabled) { opacity: 0.72; }
.task-item:disabled { cursor: default; }
.task-item--done { background: #f0fdf4; border-color: #bbf7d0; }

.task-item__check {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}
.task-item__body { flex: 1; min-width: 0; }
.task-item__label { display: block; font-size: var(--fs-sm); font-weight: 600; line-height: 1.3; margin-bottom: 2px; }
.task-item--done .task-item__label { text-decoration: line-through; color: var(--c-text-3); }
.task-item__detail { display: block; font-size: var(--fs-xs); color: var(--c-text-3); line-height: 1.5; }

.task-item__done-badge {
  font-size: 10px;
  font-weight: 700;
  color: var(--c-success);
  background: #d1fae5;
  padding: 2px 8px;
  border-radius: var(--r-full);
  white-space: nowrap;
  flex-shrink: 0;
  align-self: center;
}

.adapt-page__finish-btn {
  width: 100%;
  min-height: 48px;
  margin-top: var(--gap-xs);
  border: none;
  border-radius: var(--r-lg);
  background: var(--c-accent);
  color: #fff;
  font: 700 var(--fs-base) var(--font-body);
  cursor: pointer;
}
.adapt-page__finish-btn:disabled { background: var(--c-bg-2); color: var(--c-text-3); cursor: not-allowed; }
</style>
