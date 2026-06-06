// ============================================================
// STORE: AUTH — изолированное хранилище сессии
// Импортирует ТОЛЬКО из @/api/* — никаких импортов из router/
// ============================================================
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Employee, UserRole } from '@/api/mockData'

export const useAuthStore = defineStore('auth', () => {
  // ── Состояние ─────────────────────────────────────────────
  const employee = ref<Employee | null>(null)
  const pendingPhone = ref<string>('')
  const acknowledgedDocs = ref<Set<string>>(new Set())
  const onboardingDone = ref<boolean>(false)

  // ── Вычисляемые ───────────────────────────────────────────
  const isAuthenticated = computed(() => employee.value !== null)
  const role = computed<UserRole | null>(() => employee.value?.role ?? null)
  const isHR = computed(() => role.value === 'HR')
  const completedOnboarding = computed(() => employee.value?.onboardingProgress ?? [])

  // ── Мутации ───────────────────────────────────────────────
  function setEmployee(emp: Employee) {
    employee.value = emp
    // Восстановить прогресс из mock-данных
    const savedProgress = emp.onboardingProgress ?? []
    if (savedProgress.length === 6) {
      onboardingDone.value = true
    }
  }

  function setPendingPhone(phone: string) {
    pendingPhone.value = phone
  }

  function logout() {
    employee.value = null
    pendingPhone.value = ''
    acknowledgedDocs.value = new Set()
    onboardingDone.value = false
  }

  function acknowledgeDoc(docId: string) {
    acknowledgedDocs.value = new Set([...acknowledgedDocs.value, docId])
  }

  function isDocAcknowledged(docId: string): boolean {
    return acknowledgedDocs.value.has(docId)
  }

  function setOnboardingProgress(ids: number[]) {
    if (employee.value) {
      employee.value.onboardingProgress = ids
    }
  }

  function completeOnboarding() {
    onboardingDone.value = true
  }

  return {
    employee,
    pendingPhone,
    onboardingDone,
    isAuthenticated,
    role,
    isHR,
    completedOnboarding,
    setEmployee,
    setPendingPhone,
    logout,
    acknowledgeDoc,
    isDocAcknowledged,
    setOnboardingProgress,
    completeOnboarding,
  }
})
