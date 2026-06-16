// Репозиторий событий календаря. Источник данных — mockData.ts.
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mockEvents } from '@/api/mockData'
import type { CalEvent, EventType, EventStatus } from '@/api/mockData'

// Ре-экспорт типов для обратной совместимости импортов из страниц.
export type { CalEvent, EventType, EventStatus }

export const useEventsStore = defineStore('events', () => {
  const items = ref<CalEvent[]>(mockEvents)

  function add(ev: Omit<CalEvent, 'id'>) {
    items.value.push({ ...ev, id: Date.now() })
  }

  function update(id: number, patch: Partial<CalEvent>) {
    const found = items.value.find(e => e.id === id)
    if (found) Object.assign(found, patch)
  }

  function remove(id: number) {
    items.value = items.value.filter(e => e.id !== id)
  }

  return { items, add, update, remove }
})
