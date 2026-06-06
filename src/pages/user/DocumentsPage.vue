<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { fetchDocuments, acknowledgeDocument } from '@/api/mockClient'
import type { Document } from '@/api/mockData'
import { useAuthStore } from '@/store/auth'
import MobileNavigation from '@/widgets/MobileNavigation.vue'
import AppPageHeader from '@/shared/ui/AppPageHeader.vue'
import AppEmptyState from '@/shared/ui/AppEmptyState.vue'
import AppNotificationsDrawer from '@/shared/ui/AppNotificationsDrawer.vue'
import { useHaptic } from '@/shared/composables/useHaptic'
import { useToast } from '@/shared/composables/useToast'
import { useNotifications } from '@/shared/composables/useNotifications'

const auth = useAuthStore()
const haptic = useHaptic()
const toast = useToast()
const { unreadCount } = useNotifications()
const showNotifications = ref(false)

const docs = ref<Document[]>([])
const loading = ref(true)
const search = ref('')
const activeFilter = ref('Все')
const openedDocs = ref<Set<string>>(new Set())
const ackLoading = ref<Set<string>>(new Set())

const filters = ['Все', 'Требуют ознакомления', 'Ознакомлен', 'Справочные']

onMounted(async () => {
  docs.value = await fetchDocuments()
  loading.value = false
})

const filteredDocs = computed(() => {
  let result = docs.value
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    result = result.filter(d => d.title.toLowerCase().includes(q) || d.category.toLowerCase().includes(q))
  }
  if (activeFilter.value === 'Требуют ознакомления') result = result.filter(d => d.requiresAck && !auth.isDocAcknowledged(d.id))
  if (activeFilter.value === 'Ознакомлен') result = result.filter(d => auth.isDocAcknowledged(d.id))
  if (activeFilter.value === 'Справочные') result = result.filter(d => !d.requiresAck)
  return result
})

function openDoc(doc: Document) {
  haptic.tap()
  openedDocs.value = new Set([...openedDocs.value, doc.id])
  toast.success(`«${doc.title.replace(/\.\w+$/, '')}» открыт для ознакомления`)
}

function canAck(docId: string): boolean {
  return openedDocs.value.has(docId) && !auth.isDocAcknowledged(docId)
}

function formatDue(d: string): string {
  if (!d || d === '—') return ''
  return new Date(d).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })
}

async function acknowledge(doc: Document) {
  if (!canAck(doc.id) || ackLoading.value.has(doc.id)) return
  haptic.light()
  ackLoading.value = new Set([...ackLoading.value, doc.id])
  // Optimistic update
  auth.acknowledgeDoc(doc.id)
  try {
    await acknowledgeDocument(doc.id, auth.employee!.id)
    haptic.success()
    toast.success(`Ознакомление с «${doc.title}» подтверждено`)
  } catch {
    haptic.error()
    toast.error('Ошибка подтверждения. Попробуйте снова.')
  } finally {
    const next = new Set(ackLoading.value)
    next.delete(doc.id)
    ackLoading.value = next
  }
}

function fileIcon(title: string): { bg: string; color: string; ext: string } {
  if (title.endsWith('.pdf'))  return { bg: '#fee2e2', color: '#dc2626', ext: 'PDF' }
  if (title.endsWith('.docx')) return { bg: '#dbeafe', color: '#1d4ed8', ext: 'DOC' }
  if (title.endsWith('.xlsx')) return { bg: '#d1fae5', color: '#065f46', ext: 'XLS' }
  return { bg: '#f1f5f9', color: '#64748b', ext: 'DOC' }
}
</script>

<template>
  <div class="docs-page">
    <AppPageHeader bell :badge-count="unreadCount" @bell-click="showNotifications = true" />
    <AppNotificationsDrawer :open="showNotifications" @close="showNotifications = false" />

    <div class="docs-page__top">
      <h1 class="docs-page__title">Документы</h1>
    </div>

    <!-- Поиск -->
    <div class="docs-page__search-wrap">
      <div class="docs-page__search">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input
          v-model="search"
          class="docs-page__search-input"
          placeholder="Поиск документов"
          type="search"
        />
      </div>
    </div>

    <!-- Фильтры -->
    <div class="docs-page__filters">
      <button
        v-for="f in filters"
        :key="f"
        class="docs-page__filter"
        :class="{ 'is-active': activeFilter === f }"
        @click="activeFilter = f"
      >
        {{ f }}
      </button>
    </div>

    <!-- Скелетон -->
    <div v-if="loading" class="docs-page__list">
      <div v-for="i in 3" :key="i" class="docs-page__skeleton" />
    </div>

    <!-- Список документов -->
    <div v-else class="docs-page__list">
      <div v-for="doc in filteredDocs" :key="doc.id" class="docs-page__card">
        <!-- Иконка файла -->
        <div class="docs-page__file-icon" :style="{ background: fileIcon(doc.title).bg }">
          <span :style="{ color: fileIcon(doc.title).color }">{{ fileIcon(doc.title).ext }}</span>
        </div>

        <div class="docs-page__card-body">
          <div class="docs-page__card-head">
            <h3 class="docs-page__doc-title">{{ doc.title }}</h3>
            <!-- Статус badge -->
            <span v-if="auth.isDocAcknowledged(doc.id)" class="docs-page__badge badge--ack">Ознакомлен</span>
            <span v-else-if="doc.requiresAck" class="docs-page__badge badge--req">Обязательный</span>
            <span v-else class="docs-page__badge badge--ref">Справочный</span>
          </div>

          <div class="docs-page__meta">
            Версия {{ doc.version }} &nbsp;•&nbsp; {{ doc.category }}
            <span v-if="doc.requiresAck && !auth.isDocAcknowledged(doc.id) && formatDue(doc.dueDate)" class="docs-page__due">
              · До {{ formatDue(doc.dueDate) }}
            </span>
          </div>

          <!-- Статус ознакомления -->
          <div v-if="auth.isDocAcknowledged(doc.id)" class="docs-page__status status--done">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            Ознакомлен
          </div>
          <div v-else-if="doc.requiresAck" class="docs-page__status status--pending">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Не ознакомлен
          </div>
        </div>

        <!-- Кнопки действий -->
        <div v-if="doc.requiresAck && !auth.isDocAcknowledged(doc.id)" class="docs-page__actions">
          <button class="docs-page__open-btn" @click="openDoc(doc)">
            {{ openedDocs.has(doc.id) ? 'Открыт' : 'Открыть' }}
          </button>
          <button
            class="docs-page__ack-btn"
            :disabled="!canAck(doc.id)"
            :class="{ 'is-loading': ackLoading.has(doc.id) }"
            @click="acknowledge(doc)"
          >
            Ознакомлен
          </button>
        </div>
        <div v-else class="docs-page__actions">
          <button class="docs-page__open-btn" @click="openDoc(doc)">Открыть</button>
          <svg class="docs-page__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>

      <AppEmptyState
        v-if="filteredDocs.length === 0"
        type="docs"
        :title="search ? 'Ничего не найдено' : 'Документов нет'"
        :subtitle="search ? `По запросу «${search}» документы не найдены` : 'В этой категории документов нет'"
      />
    </div>

    <div class="nav-spacer" />
    <MobileNavigation />
  </div>
</template>

<style scoped>
.docs-page { background: var(--c-bg); min-height: 100dvh; }

.docs-page__top { padding: var(--gap-md) var(--gap-md) var(--gap-xs); }
.docs-page__title { font-size: var(--fs-xl); font-weight: 700; }

/* ── Поиск ── */
.docs-page__search-wrap { padding: var(--gap-xs) var(--gap-md); }
.docs-page__search {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
  background: var(--c-surface);
  border: 1.5px solid var(--c-border);
  border-radius: var(--r-xl);
  padding: 0 var(--gap-md);
  height: 44px;
  color: var(--c-text-3);
  transition: border-color var(--dur-fast);
}
.docs-page__search:focus-within { border-color: var(--c-accent); }
.docs-page__search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: var(--fs-base);
  color: var(--c-text);
  font-family: var(--font-body);
}
.docs-page__search-input::placeholder { color: var(--c-text-3); }

/* ── Фильтры ── */
.docs-page__filters {
  display: flex;
  gap: 6px;
  padding: var(--gap-xs) var(--gap-md) var(--gap-md);
  flex-wrap: wrap;
}
.docs-page__filter {
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
  transition: all var(--dur-fast);
  white-space: nowrap;
}
.docs-page__filter.is-active {
  background: var(--c-accent);
  border-color: var(--c-accent);
  color: #fff;
}

/* ── Список ── */
.docs-page__list { padding: 0 var(--gap-md); display: flex; flex-direction: column; gap: var(--gap-md); }

.docs-page__skeleton {
  height: 90px;
  background: var(--c-surface);
  border-radius: var(--r-xl);
  animation: shimmer 1.2s ease-in-out infinite;
}
@keyframes shimmer { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }

/* ── Карточка ── */
.docs-page__card {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-xl);
  padding: var(--gap-md);
  display: grid;
  grid-template-columns: 52px 1fr auto;
  gap: var(--gap-md);
  align-items: start;
  box-shadow: var(--shadow-sm);
}

.docs-page__file-icon {
  width: 44px; height: 54px;
  border-radius: var(--r-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
}

.docs-page__card-body { flex: 1; }
.docs-page__card-head { display: flex; align-items: flex-start; gap: var(--gap-sm); margin-bottom: 4px; flex-wrap: wrap; }
.docs-page__doc-title { font-size: var(--fs-sm); font-weight: 600; line-height: 1.4; flex: 1; }

.docs-page__badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: var(--r-full);
  white-space: nowrap;
  flex-shrink: 0;
}
.badge--ack { background: #d1fae5; color: #166534; }
.badge--req { background: #fff7ed; color: #c2410c; }
.badge--ref { background: var(--c-bg-2); color: var(--c-text-3); }

.docs-page__meta { font-size: 11px; color: var(--c-text-3); margin-bottom: 4px; display: flex; flex-wrap: wrap; gap: 2px; align-items: center; }
.docs-page__due { color: #c2410c; font-weight: 600; }

.docs-page__status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--fs-sm);
  font-weight: 500;
}
.status--done { color: var(--c-success); }
.status--pending { color: var(--c-warn); }

/* ── Кнопки ── */
.docs-page__actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--gap-xs);
}

.docs-page__open-btn {
  font-size: var(--fs-xs);
  font-weight: 600;
  color: var(--c-text-2);
  border: 1px solid var(--c-border);
  border-radius: var(--r-md);
  /* min touch target */
  min-height: 36px;
  padding: 0 12px;
  cursor: pointer;
  font-family: var(--font-body);
  background: transparent;
  white-space: nowrap;
  display: flex;
  align-items: center;
  transition: background var(--dur-fast);
}
.docs-page__open-btn:active { background: var(--c-bg-2); }

.docs-page__ack-btn {
  font-size: var(--fs-xs);
  font-weight: 700;
  color: var(--c-accent);
  border: 1.5px solid var(--c-accent);
  border-radius: var(--r-md);
  min-height: 36px;
  padding: 0 12px;
  cursor: pointer;
  font-family: var(--font-body);
  background: var(--c-accent-dim);
  white-space: nowrap;
  display: flex;
  align-items: center;
  transition: all var(--dur-fast);
}
.docs-page__ack-btn:not(:disabled):active {
  background: rgba(0, 121, 194, 0.2);
  transform: scale(0.96);
}
.docs-page__ack-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.docs-page__chevron { color: var(--c-text-3); margin-top: 14px; }

.docs-page__empty { text-align: center; color: var(--c-text-3); font-size: var(--fs-sm); padding: var(--gap-xl) 0; }
</style>
