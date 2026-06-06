<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import MobileNavigation from '@/widgets/MobileNavigation.vue'
import AppPageHeader from '@/shared/ui/AppPageHeader.vue'
import { useAuthStore } from '@/store/auth'

const auth = useAuthStore()
const router = useRouter()

interface AdaptTask {
  id: number
  label: string
  detail: string
}

const TASKS: AdaptTask[] = [
  { id: 0, label: 'Знакомство с командой', detail: 'Представиться коллегам в отделе и смежных подразделениях.' },
  { id: 1, label: 'Изучение регламентов компании', detail: 'Ознакомиться с основными регламентами и политиками ГК «СЕРВИСГАЗ».' },
  { id: 2, label: 'Настройка рабочего места', detail: 'Получить доступы к корпоративным системам и оборудованию.' },
  { id: 3, label: 'Подписание документов', detail: 'Подписать трудовой договор, NDA и должностную инструкцию.' },
  { id: 4, label: 'Вводный инструктаж по ПБ', detail: 'Пройти инструктаж по промышленной безопасности и охране труда.' },
  { id: 5, label: 'Знакомство с платформой UNITorg', detail: 'Изучить основные функции системы: профиль, документы, новости.' },
  { id: 6, label: 'Первый рабочий отчёт', detail: 'Подготовить и направить куратору отчёт об итогах первых двух недель.' },
]

const completedIds = computed(() => new Set(auth.employee?.onboardingProgress ?? []))
const doneCount = computed(() => completedIds.value.size)
const progress = computed(() => Math.round(doneCount.value / TASKS.length * 100))

const planInfo = {
  programName: 'Онбординг сотрудника',
  mentor: 'Морозова Е.А.',
  startDate: auth.employee?.hireDate ?? '—',
  deadline: (() => {
    const hire = auth.employee?.hireDate
    if (!hire) return '—'
    const d = new Date(hire)
    d.setDate(d.getDate() + 90)
    return d.toLocaleDateString('ru-RU')
  })(),
}

function formatDate(s: string) {
  if (!s || s === '—') return '—'
  return new Date(s).toLocaleDateString('ru-RU')
}

const statusLabel = computed(() => {
  if (progress.value === 100) return 'Завершено'
  const deadline = new Date(auth.employee?.hireDate ?? '')
  deadline.setDate(deadline.getDate() + 90)
  if (deadline < new Date()) return 'Просрочено'
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
        <span class="progress-header__val">{{ doneCount }} / {{ TASKS.length }} задач</span>
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
      <div
        v-for="task in TASKS"
        :key="task.id"
        class="task-item"
        :class="{ 'task-item--done': completedIds.has(task.id) }"
      >
        <div class="task-item__check">
          <svg v-if="completedIds.has(task.id)" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--c-success)" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--c-border-2)" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/></svg>
        </div>
        <div class="task-item__body">
          <span class="task-item__label">{{ task.label }}</span>
          <span class="task-item__detail">{{ task.detail }}</span>
        </div>
        <div v-if="completedIds.has(task.id)" class="task-item__done-badge">Готово</div>
      </div>
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
.adapt-page__tasks { padding: 0 var(--gap-md); }
.adapt-page__tasks-title { font-size: var(--fs-md); font-weight: 700; margin-bottom: var(--gap-sm); }

.task-item {
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
}
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
</style>
