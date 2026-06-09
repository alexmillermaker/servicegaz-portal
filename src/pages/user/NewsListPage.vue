<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { fetchNews } from '@/api/mockClient'
import type { NewsItem } from '@/api/mockData'
import MobileNavigation from '@/widgets/MobileNavigation.vue'
import AppPageHeader from '@/shared/ui/AppPageHeader.vue'
import AppEmptyState from '@/shared/ui/AppEmptyState.vue'
import AppNotificationsDrawer from '@/shared/ui/AppNotificationsDrawer.vue'
import { useHaptic } from '@/shared/composables/useHaptic'
import { useFocusTrap } from '@/shared/composables/useFocusTrap'
import { useSwipeDismiss } from '@/shared/composables/useSwipeDismiss'
import { useNotifications } from '@/shared/composables/useNotifications'

const haptic = useHaptic()
const focusTrap = useFocusTrap()
const swipe = useSwipeDismiss(() => closeModal())
const { unreadCount } = useNotifications()
const showNotifications = ref(false)

const news = ref<NewsItem[]>([])
const loading = ref(false)
const refreshing = ref(false)
const activeFilter = ref('Все')
const modalItem = ref<NewsItem | null>(null)
const sheetEl = ref<HTMLElement | null>(null)

const filters = ['Все', 'Важные', 'HR', 'Производство', 'События']

const filteredNews = computed(() => {
  if (activeFilter.value === 'Все') return news.value
  if (activeFilter.value === 'Важные') return news.value.filter(n => n.isImportant)
  return news.value.filter(n => n.category === activeFilter.value)
})

async function loadNews() {
  loading.value = true
  news.value = await fetchNews()
  loading.value = false
}

async function pullRefresh() {
  if (refreshing.value) return
  refreshing.value = true
  haptic.light()
  news.value = await fetchNews()
  refreshing.value = false
  haptic.success()
}

onMounted(loadNews)

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })
}

async function openModal(item: NewsItem) {
  modalItem.value = item
  haptic.tap()
  document.body.style.overflow = 'hidden'
  await nextTick()
  if (sheetEl.value) focusTrap.activate(sheetEl.value)
}
function closeModal() {
  focusTrap.deactivate()
  modalItem.value = null
  document.body.style.overflow = ''
}

// ── Реакции ──
type EmojiKey = '👍' | '❤️' | '🔥' | '😮' | '🎉'
const EMOJIS: EmojiKey[] = ['👍', '❤️', '🔥', '😮', '🎉']

const reactions = ref<Record<string, Record<EmojiKey, number>>>({})
const myReactions = ref<Record<string, EmojiKey | null>>({})

function initReactions(id: string) {
  if (!reactions.value[id]) {
    reactions.value[id] = { '👍': Math.floor(Math.random() * 8), '❤️': Math.floor(Math.random() * 5), '🔥': Math.floor(Math.random() * 4), '😮': Math.floor(Math.random() * 3), '🎉': Math.floor(Math.random() * 6) }
    myReactions.value[id] = null
  }
}

function react(newsId: string, emoji: EmojiKey) {
  initReactions(newsId)
  const prev = myReactions.value[newsId]
  if (prev === emoji) {
    reactions.value[newsId][emoji]--
    myReactions.value[newsId] = null
    haptic.tap()
  } else {
    if (prev) reactions.value[newsId][prev]--
    reactions.value[newsId][emoji]++
    myReactions.value[newsId] = emoji
    haptic.light()
  }
}

function totalReactions(id: string): number {
  initReactions(id)
  return Object.values(reactions.value[id]).reduce((a, b) => a + b, 0)
}

// ── Pull-to-refresh ──
let ptrStartY = 0
let ptrActive = false

function onPtrStart(e: TouchEvent) {
  const el = e.currentTarget as HTMLElement
  if (el.scrollTop === 0) {
    ptrStartY = e.touches[0].clientY
    ptrActive = true
  }
}
function onPtrMove(e: TouchEvent) {
  if (!ptrActive) return
  if (e.touches[0].clientY - ptrStartY > 60 && !refreshing.value) {
    pullRefresh()
    ptrActive = false
  }
}
function onPtrEnd() { ptrActive = false }

// Цвет/буква иконки по категории
function categoryIcon(item: NewsItem): { bg: string; color: string; letter: string } {
  if (item.isImportant) return { bg: '#fee2e2', color: '#dc2626', letter: '!' }
  const map: Record<string, { bg: string; color: string; letter: string }> = {
    'HR':           { bg: '#dbeafe', color: '#1d4ed8', letter: 'H' },
    'Производство': { bg: '#d1fae5', color: '#065f46', letter: 'П' },
    'Выставки':     { bg: '#ede9fe', color: '#6d28d9', letter: 'В' },
    'События':      { bg: '#dbeafe', color: '#1d4ed8', letter: 'С' },
    'Кадры':        { bg: '#d1fae5', color: '#065f46', letter: 'К' },
    'Обучение':     { bg: '#fff7ed', color: '#c2410c', letter: 'О' },
    'История':      { bg: '#f0fdf4', color: '#166534', letter: 'И' },
  }
  return map[item.category] ?? { bg: '#f1f5f9', color: '#64748b', letter: item.category[0] }
}
</script>

<template>
  <div class="news-page">
    <AppPageHeader bell :badge-count="unreadCount" @bell-click="showNotifications = true" />
    <AppNotificationsDrawer :open="showNotifications" @close="showNotifications = false" />

    <!-- Pull-to-refresh spinner -->
    <Transition name="ptr">
      <div v-if="refreshing" class="news-page__ptr">
        <svg class="news-page__ptr-spin" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--c-accent)" stroke-width="2.5" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        Обновление...
      </div>
    </Transition>

    <div class="news-page__top">
      <h1 class="news-page__title">Новости</h1>
    </div>

    <!-- Фильтры -->
    <div class="news-page__filters">
      <button
        v-for="f in filters"
        :key="f"
        class="news-page__filter"
        :class="{ 'is-active': activeFilter === f }"
        @click="activeFilter = f"
      >{{ f }}</button>
    </div>

    <!-- Скелетон -->
    <div v-if="loading" class="news-page__list">
      <div v-for="i in 4" :key="i" class="news-page__skeleton" />
    </div>

    <!-- Список (pull-to-refresh) -->
    <div v-else class="news-page__list" @touchstart="onPtrStart" @touchmove="onPtrMove" @touchend="onPtrEnd">
      <article
        v-for="item in filteredNews"
        :key="item.id"
        class="news-page__card"
        @click="() => { initReactions(item.id); openModal(item) }"
      >
        <!-- Иконка категории -->
        <div class="news-page__card-icon" :style="{ background: categoryIcon(item).bg }">
          <span :style="{ color: categoryIcon(item).color, fontSize: item.isImportant ? '18px' : '16px', fontWeight: '700' }">
            {{ categoryIcon(item).letter }}
          </span>
        </div>

        <div class="news-page__card-body">
          <div class="news-page__card-meta">
            <span class="news-page__category" :style="{ color: categoryIcon(item).color }">
              {{ item.category.toUpperCase() }}
            </span>
            <time class="news-page__date">{{ formatDate(item.date) }}</time>
          </div>

          <h2 class="news-page__card-title">{{ item.title }}</h2>

          <p class="news-page__teaser">{{ item.teaser }}</p>

          <!-- Реакции-превью + кнопка -->
          <div class="news-page__card-foot">
            <div class="news-page__reactions-mini" v-if="totalReactions(item.id) > 0">
              <template v-for="emoji in EMOJIS" :key="emoji">
                <span v-if="reactions[item.id]?.[emoji] > 0" class="news-page__reaction-mini">
                  {{ emoji }} {{ reactions[item.id][emoji] }}
                </span>
              </template>
            </div>
            <button class="news-page__read-more" @click.stop="() => { initReactions(item.id); openModal(item) }">
              Читать полностью
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
      </article>

      <AppEmptyState
        v-if="filteredNews.length === 0"
        type="news"
        title="Нет новостей"
        subtitle="В этой категории пока нет публикаций"
      />
    </div>

    <div class="nav-spacer" />
    <MobileNavigation />

    <!-- ═══ МОДАЛЬНОЕ ОКНО СТАТЬИ ═══ -->
    <Transition name="modal-sheet">
      <div v-if="modalItem" class="modal-overlay" @click.self="closeModal">
        <div
          ref="sheetEl"
          class="modal-sheet"
          :style="swipe.sheetStyle.value"
          @touchstart="swipe.onTouchStart"
          @touchmove="swipe.onTouchMove"
          @touchend="swipe.onTouchEnd"
        >
          <!-- Handle -->
          <div class="modal-sheet__handle" />

          <!-- Шапка -->
          <div class="modal-sheet__header">
            <div class="modal-sheet__cat">
              <div class="modal-sheet__cat-icon" :style="{ background: categoryIcon(modalItem).bg }">
                <span :style="{ color: categoryIcon(modalItem).color, fontWeight: '700' }">
                  {{ categoryIcon(modalItem).letter }}
                </span>
              </div>
              <div>
                <p class="modal-sheet__cat-name" :style="{ color: categoryIcon(modalItem).color }">{{ modalItem.category }}</p>
                <time class="modal-sheet__date">{{ formatDate(modalItem.date) }}</time>
              </div>
            </div>
            <button class="modal-sheet__close" @click="closeModal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Контент -->
          <div class="modal-sheet__body">
            <h1 class="modal-sheet__title">{{ modalItem.title }}</h1>

            <!-- Важность -->
            <div v-if="modalItem.isImportant" class="modal-sheet__important">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Важная новость
            </div>

            <p class="modal-sheet__content">{{ modalItem.content }}</p>

            <!-- Разделитель -->
            <div class="modal-sheet__divider" />

            <!-- Реакции -->
            <div class="modal-sheet__reactions-section">
              <p class="modal-sheet__reactions-title">Реакции</p>
              <div class="modal-sheet__reactions">
                <button
                  v-for="emoji in EMOJIS"
                  :key="emoji"
                  class="modal-sheet__reaction-btn"
                  :class="{ 'is-active': myReactions[modalItem.id] === emoji }"
                  @click="react(modalItem.id, emoji)"
                >
                  <span class="modal-sheet__reaction-emoji">{{ emoji }}</span>
                  <span class="modal-sheet__reaction-count">{{ reactions[modalItem.id]?.[emoji] ?? 0 }}</span>
                </button>
              </div>
              <p v-if="myReactions[modalItem.id]" class="modal-sheet__reaction-hint">
                Вы поставили {{ myReactions[modalItem.id] }}. Нажмите снова, чтобы убрать.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.news-page { background: var(--c-bg); min-height: 100dvh; }

/* ── Pull-to-refresh ── */
.news-page__ptr {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--gap-sm);
  padding: var(--gap-sm);
  font-size: var(--fs-sm);
  color: var(--c-accent);
  font-weight: 600;
}
.news-page__ptr-spin {
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.ptr-enter-active, .ptr-leave-active { transition: all 0.25s var(--ease-out); }
.ptr-enter-from, .ptr-leave-to { opacity: 0; transform: translateY(-12px); }

.news-page__top { padding: var(--gap-md) var(--gap-md) var(--gap-xs); }
.news-page__title { font-size: var(--fs-xl); font-weight: 700; }

/* ── Фильтры ── */
.news-page__filters {
  display: flex;
  gap: var(--gap-sm);
  padding: var(--gap-xs) var(--gap-md) var(--gap-md);
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.news-page__filters::-webkit-scrollbar { display: none; }
.news-page__filter {
  flex-shrink: 0;
  padding: 6px 16px;
  border-radius: var(--r-full);
  font-size: var(--fs-sm);
  font-weight: 600;
  font-family: var(--font-body);
  border: 1.5px solid var(--c-border);
  background: var(--c-surface);
  color: var(--c-text-2);
  cursor: pointer;
  transition: all var(--dur-fast);
}
.news-page__filter.is-active {
  background: var(--c-accent);
  border-color: var(--c-accent);
  color: #fff;
}

/* ── Список ── */
.news-page__list {
  padding: 0 var(--gap-md);
  display: flex;
  flex-direction: column;
  gap: var(--gap-md);
}

.news-page__skeleton {
  height: 130px;
  background: var(--c-surface);
  border-radius: var(--r-xl);
  animation: shimmer 1.2s ease-in-out infinite;
}
@keyframes shimmer { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }

/* ── Карточка ── */
.news-page__card {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-xl);
  padding: var(--gap-md);
  display: flex;
  gap: var(--gap-md);
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--dur-fast), transform var(--dur-fast);
}
.news-page__card:active { transform: scale(0.99); }
.news-page__card:hover { box-shadow: var(--shadow-md); }

.news-page__card-icon {
  width: 50px;
  height: 60px;
  border-radius: var(--r-md);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.news-page__card-body { flex: 1; min-width: 0; }

.news-page__card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.news-page__category { font-size: 11px; font-weight: 700; letter-spacing: 0.05em; }
.news-page__date { font-size: 11px; color: var(--c-text-3); }

.news-page__card-title {
  font-size: var(--fs-base);
  font-weight: 700;
  line-height: 1.4;
  margin-bottom: 6px;
  color: var(--c-text);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-page__teaser {
  font-size: var(--fs-sm);
  color: var(--c-text-2);
  line-height: 1.5;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-page__card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--gap-sm);
}

.news-page__reactions-mini {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.news-page__reaction-mini {
  font-size: 11px;
  color: var(--c-text-3);
  background: var(--c-bg-2);
  border-radius: var(--r-full);
  padding: 1px 7px;
}

.news-page__read-more {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: var(--fs-sm);
  color: var(--c-accent);
  font-weight: 600;
  font-family: var(--font-body);
  cursor: pointer;
  white-space: nowrap;
  background: none;
  border: none;
  /* Расширяем tap-область без изменения визуала */
  padding: 8px 0;
  margin: -8px 0;
  min-height: var(--touch-min);
}

.news-page__empty { text-align: center; color: var(--c-text-3); font-size: var(--fs-sm); padding: var(--gap-xl) 0; }

/* ══════════════════════════════════════
   МОДАЛЬНОЕ ОКНО
══════════════════════════════════════ */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 300;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  backdrop-filter: blur(3px);
}

.modal-sheet {
  width: 100%;
  max-width: 480px;
  background: var(--c-surface);
  border-radius: var(--r-xl) var(--r-xl) 0 0;
  max-height: 92dvh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.modal-sheet__handle {
  width: 36px;
  height: 4px;
  background: var(--c-border-2);
  border-radius: var(--r-full);
  margin: 10px auto 0;
  flex-shrink: 0;
}

.modal-sheet__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--gap-md) var(--gap-md) 0;
  flex-shrink: 0;
}

.modal-sheet__cat {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
}

.modal-sheet__cat-icon {
  width: 38px;
  height: 38px;
  border-radius: var(--r-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
}

.modal-sheet__cat-name {
  font-size: var(--fs-sm);
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.modal-sheet__date { font-size: 12px; color: var(--c-text-3); }

.modal-sheet__close {
  min-width: var(--touch-min);
  min-height: var(--touch-min);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--c-bg-2);
  color: var(--c-text-2);
  cursor: pointer;
  border: none;
  transition: background var(--dur-fast), transform var(--dur-fast);
  flex-shrink: 0;
}
.modal-sheet__close:hover  { background: var(--c-border); }
.modal-sheet__close:active { transform: scale(0.88); background: var(--c-border); }

.modal-sheet__body {
  overflow-y: auto;
  flex: 1;
  padding: var(--gap-md) var(--gap-md) var(--gap-xl);
  -webkit-overflow-scrolling: touch;
}

.modal-sheet__title {
  font-size: var(--fs-xl);
  font-weight: 800;
  line-height: 1.3;
  margin-bottom: var(--gap-md);
}

.modal-sheet__important {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
  background: #fff7ed;
  color: #c2410c;
  font-size: var(--fs-sm);
  font-weight: 600;
  border-radius: var(--r-lg);
  padding: 8px var(--gap-md);
  margin-bottom: var(--gap-md);
}

.modal-sheet__content {
  font-size: var(--fs-base);
  color: var(--c-text-2);
  line-height: 1.7;
  white-space: pre-wrap;
}

.modal-sheet__divider {
  height: 1px;
  background: var(--c-border);
  margin: var(--gap-lg) 0;
}

.modal-sheet__reactions-section {}
.modal-sheet__reactions-title {
  font-size: var(--fs-sm);
  font-weight: 700;
  color: var(--c-text-3);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: var(--gap-md);
}

.modal-sheet__reactions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.modal-sheet__reaction-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: var(--r-full);
  border: 1.5px solid var(--c-border);
  background: var(--c-bg-2);
  font-family: var(--font-body);
  cursor: pointer;
  transition: all var(--dur-fast);
  font-size: var(--fs-sm);
}
.modal-sheet__reaction-btn:active { transform: scale(0.94); }
.modal-sheet__reaction-btn.is-active {
  border-color: var(--c-accent);
  background: var(--c-accent-dim);
}

.modal-sheet__reaction-emoji { font-size: 16px; line-height: 1; }
.modal-sheet__reaction-count { font-size: 12px; font-weight: 600; color: var(--c-text-2); }
.modal-sheet__reaction-btn.is-active .modal-sheet__reaction-count { color: var(--c-accent); }

.modal-sheet__reaction-hint {
  margin-top: var(--gap-sm);
  font-size: var(--fs-xs);
  color: var(--c-text-3);
}

/* ── Анимация модального окна ── */
.modal-sheet-enter-active, .modal-sheet-leave-active {
  transition: opacity 0.28s var(--ease-out);
}
.modal-sheet-enter-active .modal-sheet, .modal-sheet-leave-active .modal-sheet {
  transition: transform 0.32s var(--ease-out);
}
.modal-sheet-enter-from, .modal-sheet-leave-to { opacity: 0; }
.modal-sheet-enter-from .modal-sheet, .modal-sheet-leave-to .modal-sheet {
  transform: translateY(100%);
}
</style>
