import { ref, computed, readonly } from 'vue'

export interface AppNotification {
  id: number
  title: string
  body: string
  type: 'info' | 'warning' | 'success' | 'hr'
  time: string
  read: boolean
}

const notifications = ref<AppNotification[]>([
  { id: 1, title: 'Новый документ', body: 'Добавлен документ «Правила внутреннего трудового распорядка». Необходимо ознакомиться.', type: 'hr', time: 'Сегодня, 09:15', read: false },
  { id: 2, title: 'Задача адаптации', body: 'Пройдите вводный инструктаж по безопасности до конца рабочего дня.', type: 'warning', time: 'Сегодня, 08:40', read: false },
  { id: 3, title: 'Добро пожаловать!', body: 'Рады видеть вас в команде ГК «СЕРВИСГАЗ». Заполните профиль и ознакомьтесь с материалами.', type: 'success', time: 'Вчера, 16:00', read: true },
  { id: 4, title: 'Новость компании', body: 'Опубликована новость о расширении производственных мощностей.', type: 'info', time: 'Вчера, 10:30', read: true },
])

let _id = notifications.value.length + 1

export function useNotifications() {
  const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

  function markRead(id: number) {
    const n = notifications.value.find(n => n.id === id)
    if (n) n.read = true
  }

  function markAllRead() {
    notifications.value.forEach(n => { n.read = true })
  }

  function push(notification: Omit<AppNotification, 'id' | 'read' | 'time'>) {
    notifications.value.unshift({
      ...notification,
      id: ++_id,
      read: false,
      time: 'Только что',
    })
  }

  return {
    notifications: readonly(notifications),
    unreadCount,
    markRead,
    markAllRead,
    push,
  }
}
