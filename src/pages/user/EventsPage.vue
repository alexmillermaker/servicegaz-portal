<script setup lang="ts">
import { ref, computed } from 'vue'
import MobileNavigation from '@/widgets/MobileNavigation.vue'
import AppPageHeader from '@/shared/ui/AppPageHeader.vue'
import AppEmptyState from '@/shared/ui/AppEmptyState.vue'
import AppNotificationsDrawer from '@/shared/ui/AppNotificationsDrawer.vue'
import { useHaptic } from '@/shared/composables/useHaptic'
import { useNotifications } from '@/shared/composables/useNotifications'
import { useEventsStore } from '@/store/events'
import type { CalEvent, EventType } from '@/store/events'

const haptic = useHaptic()
const { unreadCount } = useNotifications()
const showNotifications = ref(false)

const eventsStore = useEventsStore()
const events = computed(() => eventsStore.items)

const filter = ref<'all' | 'upcoming' | 'past'>('all')

const filtered = computed(() => {
  if (filter.value === 'upcoming') return events.value.filter(e => e.status === 'upcoming' || e.status === 'ongoing')
  if (filter.value === 'past') return events.value.filter(e => e.status === 'past')
  return events.value
})

const openedEvent = ref<CalEvent | null>(null)
const showParticipants = ref(false)

function openEvent(ev: CalEvent) {
  haptic.tap()
  openedEvent.value = ev
  showParticipants.value = false
}

function typeColor(type: EventType) {
  return { meeting: '#0079C2', training: '#7c3aed', corporate: '#d97706', deadline: '#dc2626' }[type]
}

function typeLabel(type: EventType) {
  return { meeting: 'Совещание', training: 'Обучение', corporate: 'Корпоратив', deadline: 'Дедлайн' }[type]
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}

function formatDay(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ru-RU', { day: '2-digit' })
}

function formatMonth(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ru-RU', { month: 'short' })
}
</script>

<template>
  <div class="events-page">
    <AppPageHeader bell :badge-count="unreadCount" @bell-click="showNotifications = true" />
    <AppNotificationsDrawer :open="showNotifications" @close="showNotifications = false" />

    <div class="events-page__top">
      <h1 class="events-page__title">События</h1>
    </div>

    <div class="events-page__filters">
      <button class="events-page__filter" :class="{ 'is-active': filter === 'all' }" @click="filter = 'all'">Все</button>
      <button class="events-page__filter" :class="{ 'is-active': filter === 'upcoming' }" @click="filter = 'upcoming'">Предстоящие</button>
      <button class="events-page__filter" :class="{ 'is-active': filter === 'past' }" @click="filter = 'past'">Прошедшие</button>
    </div>

    <div class="events-page__list">
      <div
        v-for="ev in filtered"
        :key="ev.id"
        class="event-card"
        :class="{ 'event-card--past': ev.status === 'past' }"
        @click="openEvent(ev)"
      >
        <div class="event-card__date-col">
          <span class="event-card__day">{{ formatDay(ev.date) }}</span>
          <span class="event-card__month">{{ formatMonth(ev.date) }}</span>
        </div>
        <div class="event-card__color-bar" :style="{ background: typeColor(ev.type) }"></div>
        <div class="event-card__body">
          <span class="event-card__type-badge" :style="{ background: typeColor(ev.type) + '22', color: typeColor(ev.type) }">{{ typeLabel(ev.type) }}</span>
          <h3 class="event-card__title">{{ ev.title }}</h3>
          <div class="event-card__meta">
            <span class="event-card__meta-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {{ ev.time }}
            </span>
            <span class="event-card__meta-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {{ ev.location }}
            </span>
            <span class="event-card__meta-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              {{ ev.participants }} уч.
            </span>
          </div>
        </div>
        <svg class="event-card__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
      </div>

      <AppEmptyState
        v-if="filtered.length === 0"
        type="news"
        title="Событий нет"
        subtitle="В этой категории пока нет событий"
      />
    </div>

    <div class="nav-spacer" />
    <MobileNavigation />

    <!-- Детали события -->
    <Teleport to="body">
      <div v-if="openedEvent" class="event-sheet-overlay" @click.self="openedEvent = null">
        <div class="event-sheet">
          <div class="event-sheet__header">
            <div class="event-sheet__color-line" :style="{ background: typeColor(openedEvent.type) }"></div>
            <div class="event-sheet__header-body">
              <span class="event-sheet__type-badge" :style="{ background: typeColor(openedEvent.type) + '22', color: typeColor(openedEvent.type) }">{{ typeLabel(openedEvent.type) }}</span>
              <button class="event-sheet__close" @click="openedEvent = null">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <h2 class="event-sheet__title">{{ openedEvent.title }}</h2>
          </div>
          <div class="event-sheet__body">
            <div class="event-sheet__row">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span>{{ formatDate(openedEvent.date) }}</span>
            </div>
            <div class="event-sheet__row">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>{{ openedEvent.time }}</span>
            </div>
            <div class="event-sheet__row">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>{{ openedEvent.location }}</span>
            </div>
            <div class="event-sheet__row event-sheet__row--clickable" @click="showParticipants = !showParticipants">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              <span>{{ openedEvent.participants }} участников</span>
              <svg class="event-sheet__chevron" :class="{ 'is-open': showParticipants }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            <div v-if="showParticipants" class="event-sheet__participants">
              <div v-for="name in openedEvent.participantNames" :key="name" class="event-sheet__participant">
                <span class="event-sheet__participant-dot" />
                {{ name }}
              </div>
            </div>
            <p v-if="openedEvent.description" class="event-sheet__desc">{{ openedEvent.description }}</p>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.events-page { background: var(--c-bg); min-height: 100dvh; }

.events-page__top { padding: var(--gap-md) var(--gap-md) var(--gap-xs); }
.events-page__title { font-size: var(--fs-xl); font-weight: 700; }

/* ── Фильтры ── */
.events-page__filters {
  display: flex;
  gap: 6px;
  padding: var(--gap-xs) var(--gap-md) var(--gap-md);
  flex-wrap: wrap;
}
.events-page__filter {
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
.events-page__filter.is-active {
  background: var(--c-accent);
  border-color: var(--c-accent);
  color: #fff;
}

/* ── Список ── */
.events-page__list { padding: 0 var(--gap-md) var(--gap-md); display: flex; flex-direction: column; gap: var(--gap-sm); }

/* ── Карточка ── */
.event-card {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-xl);
  display: grid;
  grid-template-columns: 44px 4px 1fr 20px;
  gap: var(--gap-sm);
  align-items: center;
  padding: var(--gap-md);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: box-shadow var(--dur-fast);
}
.event-card:active { box-shadow: var(--shadow-md); }
.event-card--past { opacity: 0.6; }

.event-card__date-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}
.event-card__day { font-size: 22px; font-weight: 800; line-height: 1; color: var(--c-text); }
.event-card__month { font-size: 11px; font-weight: 600; color: var(--c-text-3); text-transform: uppercase; }

.event-card__color-bar { width: 4px; height: 48px; border-radius: 4px; }

.event-card__body { flex: 1; min-width: 0; }
.event-card__type-badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--r-full);
  margin-bottom: 3px;
}
.event-card__title { font-size: var(--fs-sm); font-weight: 700; line-height: 1.3; margin-bottom: 4px; }
.event-card__meta { display: flex; gap: 8px; flex-wrap: wrap; }
.event-card__meta-item {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  color: var(--c-text-3);
}
.event-card__chevron { color: var(--c-text-3); flex-shrink: 0; }

/* ── Bottom sheet ── */
.event-sheet-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  z-index: 300;
  display: flex;
  align-items: flex-end;
}
.event-sheet {
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  background: var(--c-surface);
  border-radius: var(--r-xl) var(--r-xl) 0 0;
  overflow: hidden;
  max-height: 80dvh;
  overflow-y: auto;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
.event-sheet__color-line { height: 4px; }
.event-sheet__header { padding: var(--gap-md) var(--gap-md) var(--gap-sm); }
.event-sheet__header-body { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--gap-sm); }
.event-sheet__type-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: var(--r-full);
}
.event-sheet__close {
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
.event-sheet__title { font-size: var(--fs-md); font-weight: 700; line-height: 1.3; }

.event-sheet__body { padding: 0 var(--gap-md) var(--gap-lg); display: flex; flex-direction: column; gap: var(--gap-sm); }
.event-sheet__row {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
  font-size: var(--fs-sm);
  color: var(--c-text-2);
}
.event-sheet__row svg { color: var(--c-text-3); flex-shrink: 0; }
.event-sheet__row--clickable { cursor: pointer; user-select: none; }
.event-sheet__row--clickable:active { opacity: 0.6; }
.event-sheet__chevron { margin-left: auto; color: var(--c-text-3); transition: transform 0.2s; }
.event-sheet__chevron.is-open { transform: rotate(180deg); }
.event-sheet__participants {
  background: var(--c-bg);
  border-radius: var(--r-md);
  padding: var(--gap-sm) var(--gap-md);
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: -2px;
}
.event-sheet__participant {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
  font-size: var(--fs-sm);
  color: var(--c-text-2);
}
.event-sheet__participant-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--c-accent);
  flex-shrink: 0;
  opacity: 0.7;
}
.event-sheet__desc {
  font-size: var(--fs-sm);
  color: var(--c-text-2);
  line-height: 1.6;
  background: var(--c-bg);
  border-radius: var(--r-md);
  padding: var(--gap-sm) var(--gap-md);
  margin-top: var(--gap-xs);
}
</style>
