// Репозиторий программ адаптации. Источник данных — mockData.ts.
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mockAdaptPlans } from '@/api/mockData'
import type { AdaptPlan, AdaptTask } from '@/api/mockData'

// Ре-экспорт типов для обратной совместимости импортов из страниц.
export type { AdaptPlan, AdaptTask }

export const useAdaptationStore = defineStore('adaptation', () => {
  const plans = ref<AdaptPlan[]>(mockAdaptPlans)

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
