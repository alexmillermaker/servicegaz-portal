// Репозиторий новостей. Источник данных — mockData.ts.
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockNews } from '@/api/mockData'
import type { NewsItem } from '@/api/mockData'

// Ре-экспорт типа для обратной совместимости импортов из страниц.
export type { NewsItem }

export const useNewsStore = defineStore('news', () => {
  const items = ref<NewsItem[]>(mockNews)

  const published = computed(() => items.value.filter(n => n.status === 'published'))

  function add(data: Omit<NewsItem, 'id' | 'views'>) {
    items.value.unshift({ ...data, id: `news-${Date.now()}`, views: 0 })
  }

  function update(id: string, patch: Partial<NewsItem>) {
    const found = items.value.find(n => n.id === id)
    if (found) Object.assign(found, patch)
  }

  function remove(id: string) {
    items.value = items.value.filter(n => n.id !== id)
  }

  function toggleStatus(id: string) {
    const found = items.value.find(n => n.id === id)
    if (found) found.status = found.status === 'published' ? 'draft' : 'published'
  }

  return { items, published, add, update, remove, toggleStatus }
})
