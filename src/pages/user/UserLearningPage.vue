<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import MobileNavigation from '@/widgets/MobileNavigation.vue'
import AppPageHeader from '@/shared/ui/AppPageHeader.vue'
import AppEmptyState from '@/shared/ui/AppEmptyState.vue'
import { useHaptic } from '@/shared/composables/useHaptic'
import { useLearningStore } from '@/store/learning'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const haptic = useHaptic()
const learningStore = useLearningStore()
const auth = useAuthStore()

type CourseStatus = 'active' | 'completed' | 'overdue'

interface MyCourse {
  id: number
  title: string
  category: string
  duration: string
  deadline: string
  mandatory: boolean
  progress: number
  status: CourseStatus
}

const courses = computed<MyCourse[]>(() => {
  if (!auth.employee?.id) return []
  return learningStore.getEnrollmentsForEmployee(auth.employee.id)
})

type Filter = 'all' | 'mandatory' | 'active' | 'completed'
const filter = ref<Filter>('all')

const filtered = computed(() => {
  if (filter.value === 'mandatory')  return courses.value.filter(c => c.mandatory)
  if (filter.value === 'active')     return courses.value.filter(c => c.status === 'active' || c.status === 'overdue')
  if (filter.value === 'completed')  return courses.value.filter(c => c.status === 'completed')
  return courses.value
})

const openedCourse = ref<MyCourse | null>(null)

function open(c: MyCourse) {
  haptic.tap()
  openedCourse.value = c
}

function catColor(cat: string) {
  const m: Record<string, string> = {
    'Безопасность': '#dc2626',
    'IT':           '#2563eb',
    'Soft skills':  '#7c3aed',
    'Право':        '#d97706',
    'Управление':   '#0891b2',
    'Производство': '#16a34a',
  }
  return m[cat] ?? '#6b7280'
}

function statusLabel(s: CourseStatus) {
  return { active: 'В процессе', completed: 'Завершён', overdue: 'Просрочен' }[s]
}

function statusClass(s: CourseStatus) {
  return { active: 'badge--active', completed: 'badge--done', overdue: 'badge--overdue' }[s]
}

const totalActive = computed(() => courses.value.filter(c => c.status === 'active').length)
const totalDone   = computed(() => courses.value.filter(c => c.status === 'completed').length)
const avgProgress = computed(() => {
  const active = courses.value.filter(c => c.status === 'active')
  if (!active.length) return 0
  return Math.round(active.reduce((s, c) => s + c.progress, 0) / active.length)
})
</script>

<template>
  <div class="learning-page">
    <AppPageHeader back @back="router.back()" />

    <div class="learning-page__top">
      <h1 class="learning-page__title">Моё обучение</h1>
    </div>

    <!-- Статистика -->
    <div class="learning-page__stats">
      <div class="ls-stat">
        <span class="ls-stat__val">{{ totalActive }}</span>
        <span class="ls-stat__label">Активных</span>
      </div>
      <div class="ls-stat">
        <span class="ls-stat__val">{{ totalDone }}</span>
        <span class="ls-stat__label">Завершено</span>
      </div>
      <div class="ls-stat">
        <span class="ls-stat__val">{{ avgProgress }}%</span>
        <span class="ls-stat__label">Средний прогресс</span>
      </div>
    </div>

    <!-- Фильтры -->
    <div class="learning-page__filters">
      <button class="lf-btn" :class="{ 'is-active': filter === 'all' }"       @click="filter = 'all'">Все</button>
      <button class="lf-btn" :class="{ 'is-active': filter === 'mandatory' }" @click="filter = 'mandatory'">Обязательные</button>
      <button class="lf-btn" :class="{ 'is-active': filter === 'active' }"    @click="filter = 'active'">В процессе</button>
      <button class="lf-btn" :class="{ 'is-active': filter === 'completed' }" @click="filter = 'completed'">Завершены</button>
    </div>

    <!-- Список курсов -->
    <div class="learning-page__list">
      <div
        v-for="course in filtered"
        :key="course.id"
        class="course-card"
        @click="open(course)"
      >
        <div class="course-card__icon" :style="{ background: catColor(course.category) + '18', color: catColor(course.category) }">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
        </div>
        <div class="course-card__body">
          <div class="course-card__head">
            <h3 class="course-card__title">{{ course.title }}</h3>
            <span v-if="course.mandatory" class="course-card__mandatory">Обяз.</span>
          </div>
          <div class="course-card__meta">
            <span class="course-card__cat" :style="{ color: catColor(course.category) }">{{ course.category }}</span>
            <span>·</span>
            <span>{{ course.duration }}</span>
            <span v-if="course.deadline !== '—'">· до {{ course.deadline }}</span>
          </div>
          <div class="course-card__progress-row">
            <div class="course-card__bar">
              <div class="course-card__bar-fill"
                :style="{
                  width: course.progress + '%',
                  background: course.status === 'completed' ? 'var(--c-success)' : course.status === 'overdue' ? 'var(--c-danger)' : 'var(--c-accent)'
                }"
              />
            </div>
            <span class="course-card__pct">{{ course.progress }}%</span>
          </div>
          <span class="course-card__status-badge" :class="statusClass(course.status)">{{ statusLabel(course.status) }}</span>
        </div>
        <svg class="course-card__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
      </div>

      <AppEmptyState
        v-if="filtered.length === 0"
        type="docs"
        title="Курсов нет"
        subtitle="В этой категории нет курсов"
      />
    </div>

    <div class="nav-spacer" />
    <MobileNavigation />

    <!-- Детали курса -->
    <Teleport to="body">
      <div v-if="openedCourse" class="course-sheet-overlay" @click.self="openedCourse = null">
        <div class="course-sheet">
          <div class="course-sheet__header">
            <div class="course-sheet__icon" :style="{ background: catColor(openedCourse.category) + '18', color: catColor(openedCourse.category) }">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            </div>
            <button class="course-sheet__close" @click="openedCourse = null">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="course-sheet__body">
            <h2 class="course-sheet__title">{{ openedCourse.title }}</h2>
            <div class="course-sheet__row">
              <span class="course-sheet__row-label">Категория</span>
              <span :style="{ color: catColor(openedCourse.category), fontWeight: 600 }">{{ openedCourse.category }}</span>
            </div>
            <div class="course-sheet__row">
              <span class="course-sheet__row-label">Продолжительность</span>
              <span>{{ openedCourse.duration }}</span>
            </div>
            <div class="course-sheet__row">
              <span class="course-sheet__row-label">Дедлайн</span>
              <span>{{ openedCourse.deadline }}</span>
            </div>
            <div class="course-sheet__row">
              <span class="course-sheet__row-label">Тип</span>
              <span>{{ openedCourse.mandatory ? 'Обязательный' : 'Дополнительный' }}</span>
            </div>
            <div class="course-sheet__row">
              <span class="course-sheet__row-label">Статус</span>
              <span class="course-card__status-badge" :class="statusClass(openedCourse.status)">{{ statusLabel(openedCourse.status) }}</span>
            </div>
            <div class="course-sheet__progress">
              <div class="course-sheet__progress-header">
                <span>Прогресс</span>
                <span style="font-weight:700">{{ openedCourse.progress }}%</span>
              </div>
              <div class="course-sheet__bar">
                <div class="course-sheet__bar-fill"
                  :style="{
                    width: openedCourse.progress + '%',
                    background: openedCourse.status === 'completed' ? 'var(--c-success)' : 'var(--c-accent)'
                  }"
                />
              </div>
            </div>
            <p class="course-sheet__hint">Для прохождения курса обратитесь к HR-менеджеру или куратору.</p>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.learning-page { background: var(--c-bg); min-height: 100dvh; }

.learning-page__top { padding: var(--gap-xs) var(--gap-md) var(--gap-sm); }
.learning-page__title { font-size: var(--fs-xl); font-weight: 700; }

/* ── Статистика ── */
.learning-page__stats {
  display: flex;
  gap: var(--gap-sm);
  padding: 0 var(--gap-md) var(--gap-md);
}
.ls-stat {
  flex: 1;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-xl);
  padding: var(--gap-sm) var(--gap-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  box-shadow: var(--shadow-sm);
}
.ls-stat__val { font-size: var(--fs-md); font-weight: 800; color: var(--c-accent); }
.ls-stat__label { font-size: 10px; color: var(--c-text-3); text-align: center; }

/* ── Фильтры ── */
.learning-page__filters {
  display: flex;
  gap: 6px;
  padding: 0 var(--gap-md) var(--gap-md);
  flex-wrap: wrap;
}
.lf-btn {
  flex-shrink: 0;
  padding: 6px 12px;
  border-radius: var(--r-full);
  font-size: 12px;
  font-weight: 600;
  font-family: var(--font-body);
  border: 1.5px solid var(--c-border);
  background: var(--c-surface);
  color: var(--c-text-2);
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--dur-fast);
}
.lf-btn.is-active { background: var(--c-accent); border-color: var(--c-accent); color: #fff; }

/* ── Список ── */
.learning-page__list { padding: 0 var(--gap-md); display: flex; flex-direction: column; gap: var(--gap-sm); }

/* ── Карточка курса ── */
.course-card {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-xl);
  padding: var(--gap-md);
  display: flex;
  align-items: flex-start;
  gap: var(--gap-sm);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: box-shadow var(--dur-fast);
}
.course-card:active { box-shadow: var(--shadow-md); }

.course-card__icon {
  width: 44px; height: 44px;
  border-radius: var(--r-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.course-card__body { flex: 1; min-width: 0; }
.course-card__head { display: flex; align-items: flex-start; gap: var(--gap-xs); margin-bottom: 3px; }
.course-card__title { font-size: var(--fs-sm); font-weight: 700; line-height: 1.3; flex: 1; }
.course-card__mandatory {
  font-size: 10px;
  font-weight: 700;
  color: var(--c-danger);
  background: #fee2e2;
  padding: 2px 6px;
  border-radius: var(--r-full);
  white-space: nowrap;
  flex-shrink: 0;
}
.course-card__meta { display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--c-text-3); margin-bottom: 6px; flex-wrap: wrap; }
.course-card__cat { font-weight: 600; }

.course-card__progress-row { display: flex; align-items: center; gap: var(--gap-sm); margin-bottom: 6px; }
.course-card__bar { flex: 1; height: 6px; background: var(--c-bg-2); border-radius: var(--r-full); overflow: hidden; }
.course-card__bar-fill { height: 100%; border-radius: var(--r-full); transition: width 0.4s var(--ease-out); }
.course-card__pct { font-size: 11px; font-weight: 700; color: var(--c-text-2); min-width: 30px; text-align: right; }

.course-card__status-badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--r-full);
}
.badge--active  { background: #dbeafe; color: #1d4ed8; }
.badge--done    { background: #d1fae5; color: var(--c-success); }
.badge--overdue { background: #fee2e2; color: var(--c-danger); }

.course-card__chevron { color: var(--c-text-3); flex-shrink: 0; margin-top: 4px; }

/* ── Bottom sheet ── */
.course-sheet-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  z-index: 300;
  display: flex;
  align-items: flex-end;
}
.course-sheet {
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  background: var(--c-surface);
  border-radius: var(--r-xl) var(--r-xl) 0 0;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  max-height: 80dvh;
  overflow-y: auto;
}
.course-sheet__header {
  padding: var(--gap-md) var(--gap-md) var(--gap-sm);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.course-sheet__icon {
  width: 48px; height: 48px;
  border-radius: var(--r-md);
  display: flex;
  align-items: center;
  justify-content: center;
}
.course-sheet__close {
  width: 32px; height: 32px;
  border-radius: var(--r-full);
  background: var(--c-bg-2);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--c-text-2);
}
.course-sheet__body { padding: 0 var(--gap-md) var(--gap-lg); }
.course-sheet__title { font-size: var(--fs-md); font-weight: 700; margin-bottom: var(--gap-md); line-height: 1.3; }

.course-sheet__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--c-bg-2);
  font-size: var(--fs-sm);
}
.course-sheet__row-label { color: var(--c-text-3); }

.course-sheet__progress { margin-top: var(--gap-md); }
.course-sheet__progress-header { display: flex; justify-content: space-between; font-size: var(--fs-sm); color: var(--c-text-2); margin-bottom: 6px; }
.course-sheet__bar { height: 8px; background: var(--c-bg-2); border-radius: var(--r-full); overflow: hidden; }
.course-sheet__bar-fill { height: 100%; border-radius: var(--r-full); transition: width 0.4s var(--ease-out); }

.course-sheet__hint {
  margin-top: var(--gap-md);
  font-size: var(--fs-sm);
  color: var(--c-text-3);
  background: var(--c-bg);
  border-radius: var(--r-md);
  padding: var(--gap-sm) var(--gap-md);
  line-height: 1.6;
}
</style>
