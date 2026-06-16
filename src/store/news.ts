import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockNews } from '@/api/mockData'

export interface NewsItem {
  id: string
  title: string
  category: string
  teaser: string
  content: string
  date: string
  isImportant: boolean
  author: string
  status: 'published' | 'draft'
  views: number
}

export const useNewsStore = defineStore('news', () => {
  const items = ref<NewsItem[]>(
    mockNews.map(n => ({
      id: n.id,
      title: n.title,
      category: n.category,
      teaser: n.teaser,
      content: n.content,
      date: n.date,
      isImportant: n.isImportant,
      author: n.author,
      status: (n.published ? 'published' : 'draft') as 'published' | 'draft',
      views: 0,
    }))
  )

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
