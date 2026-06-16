import { defineStore } from 'pinia'
import { ref } from 'vue'

export type EventType = 'meeting' | 'training' | 'corporate' | 'deadline'
export type EventStatus = 'upcoming' | 'ongoing' | 'past'

export interface CalEvent {
  id: number
  title: string
  date: string
  time: string
  type: EventType
  status: EventStatus
  location: string
  participants: number
  participantNames: string[]
  description: string
  visibility: 'all' | 'departments' | 'people'
  audience: string[]
}

export const useEventsStore = defineStore('events', () => {
  const items = ref<CalEvent[]>([
    { id: 1, title: 'Еженедельная планёрка HR', date: '2026-06-09', time: '10:00', type: 'meeting', status: 'upcoming', location: 'Переговорная №2', participants: 8, participantNames: ['Карина Белова', 'Дмитрий Орлов', 'Анна Соколова', 'Павел Крылов', 'Ирина Лебедева', 'Сергей Новиков', 'Ольга Фёдорова', 'Алексей Зайцев'], description: 'Еженедельный отчёт по показателям HR-отдела.', visibility: 'all', audience: [] },
    { id: 2, title: 'Летний корпоратив', date: '2026-06-21', time: '16:00', type: 'corporate', status: 'upcoming', location: 'Загородная база', participants: 45, participantNames: ['Весь коллектив компании (45 человек)'], description: 'Ежегодный летний корпоратив всей компании.', visibility: 'all', audience: [] },
    { id: 3, title: 'Курс по промышленной безопасности', date: '2026-06-15', time: '09:00', type: 'training', status: 'upcoming', location: 'Учебный центр', participants: 20, participantNames: ['Группа технических специалистов', 'Михаил Власов', 'Виктор Громов', 'Николай Тихонов', 'Андрей Котов', 'Роман Щербаков', 'Илья Морозов', 'Юрий Воронов', 'Денис Беляев', 'Максим Сидоров'], description: 'Обязательный курс по ПБ для технических специалистов.', visibility: 'all', audience: [] },
    { id: 4, title: 'Сдача квартального отчёта', date: '2026-06-30', time: '18:00', type: 'deadline', status: 'upcoming', location: 'Онлайн', participants: 5, participantNames: ['Карина Белова', 'Дмитрий Орлов', 'Ирина Лебедева', 'Павел Крылов', 'Анна Соколова'], description: 'Последний срок подачи отчётности за Q2 2026.', visibility: 'all', audience: [] },
    { id: 5, title: 'Стратегическая сессия', date: '2026-06-05', time: '14:00', type: 'meeting', status: 'past', location: 'Конференц-зал', participants: 15, participantNames: ['Руководящий состав', 'Карина Белова', 'Дмитрий Орлов', 'Сергей Новиков', 'Анна Соколова', 'Павел Крылов'], description: '', visibility: 'all', audience: [] },
    { id: 6, title: 'Тренинг по продажам', date: '2026-05-28', time: '10:00', type: 'training', status: 'past', location: 'Зал А', participants: 12, participantNames: ['Отдел продаж', 'Ольга Фёдорова', 'Алексей Зайцев', 'Роман Щербаков', 'Денис Беляев'], description: '', visibility: 'all', audience: [] },
  ])

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
