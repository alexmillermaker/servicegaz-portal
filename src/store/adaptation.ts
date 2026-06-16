import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface AdaptTask { label: string; done: boolean; detail?: string }

export interface AdaptPlan {
  id: number
  employeeId: string
  employee: string
  department: string
  position: string
  programName: string
  progress: number
  status: 'active' | 'completed' | 'overdue'
  startDate: string
  deadline: string
  mentor: string
  tasks: AdaptTask[]
}

export const useAdaptationStore = defineStore('adaptation', () => {
  const plans = ref<AdaptPlan[]>([
    { id: 1, employeeId: 'emp-1', employee: 'Иванов Петр Сергеевич', department: 'ИТ и цифровые решения', position: 'Инженер-конструктор', programName: 'Онбординг разработчика', progress: 65, status: 'active', startDate: '12.05.2026', deadline: '12.07.2026', mentor: 'Смирнов К.Д.', tasks: [{ label: 'Знакомство с командой', done: true, detail: 'Представиться коллегам в отделе и смежных подразделениях.' }, { label: 'Настройка рабочей среды', done: true, detail: 'Получить доступы к корпоративным системам и оборудованию.' }, { label: 'Изучение архитектуры', done: false, detail: 'Ознакомиться с технической документацией проекта.' }, { label: 'Первый pull request', done: false, detail: 'Подготовить и согласовать первый код-ревью.' }] },
    { id: 2, employeeId: 'emp-4', employee: 'Морозова Елена Андреевна', department: 'HR департамент', position: 'HR-менеджер', programName: 'Онбординг HR-специалиста', progress: 100, status: 'completed', startDate: '01.04.2026', deadline: '01.06.2026', mentor: 'Карпова А.В.', tasks: [{ label: 'Знакомство с процессами', done: true }, { label: 'Изучение CRM', done: true }, { label: 'Первый самостоятельный найм', done: true }, { label: 'Аттестация', done: true }] },
    { id: 3, employeeId: 'emp-3', employee: 'Кузнецов Дмитрий Олегович', department: 'Производственный блок', position: 'Инженер', programName: 'Адаптация инженера', progress: 30, status: 'overdue', startDate: '01.03.2026', deadline: '01.05.2026', mentor: 'Волков Д.Р.', tasks: [{ label: 'Инструктаж по ОТ и ТБ', done: true }, { label: 'Изучение регламентов', done: false }, { label: 'Работа под наблюдением', done: false }, { label: 'Самостоятельная смена', done: false }] },
    { id: 4, employeeId: 'emp-2', employee: 'Сидорова Анна Викторовна', department: 'Финансовый департамент', position: 'Бухгалтер', programName: 'Онбординг бухгалтера', progress: 45, status: 'active', startDate: '20.05.2026', deadline: '20.07.2026', mentor: 'Карпова А.В.', tasks: [{ label: 'Знакомство с 1С', done: true }, { label: 'Изучение учётной политики', done: true }, { label: 'Первичная документация', done: false }, { label: 'Отчётный период', done: false }] },
  ])

  function findByEmployeeId(empId: string): AdaptPlan | undefined {
    return plans.value.find(p => p.employeeId === empId)
  }

  function add(plan: Omit<AdaptPlan, 'id'>): void {
    plans.value.unshift({ ...plan, id: Date.now() })
  }

  function update(id: number, patch: Partial<AdaptPlan>): void {
    const found = plans.value.find(p => p.id === id)
    if (found) Object.assign(found, patch)
  }

  function toggleComplete(id: number): void {
    const found = plans.value.find(p => p.id === id)
    if (!found) return
    if (found.status === 'completed') {
      found.status = 'active'
      found.progress = found.tasks.length
        ? Math.round(found.tasks.filter(t => t.done).length / found.tasks.length * 100)
        : 0
    } else {
      found.status = 'completed'
      found.progress = 100
      found.tasks.forEach(t => { t.done = true })
    }
  }

  return { plans, findByEmployeeId, add, update, toggleComplete }
})
