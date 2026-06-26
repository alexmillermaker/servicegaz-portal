// Единый источник данных о сотрудниках.
// Мутирует исходный массив mockEmployees — поэтому mockClient.ts
// автоматически видит изменения без перезагрузки страницы.
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockEmployees } from '@/api/mockData'
import type { Employee, UserRole } from '@/api/mockData'
import { normalizePhone } from '@/shared/utils/normalizePhone'
import { generateSecurePassword } from '@/shared/utils/employeeCredentials'

export const useEmployeesStore = defineStore('employees', () => {
  // Реактивная обёртка над тем же массивом что читает mockClient.ts
  const employees = ref<Employee[]>(mockEmployees)

  const activeCount  = computed(() => employees.value.filter(e => e.status === 'ACTIVE').length)
  const blockedCount = computed(() => employees.value.filter(e => e.status === 'BLOCKED').length)

  function findByPhone(phone: string): Employee | undefined {
    const norm = normalizePhone(phone)
    return employees.value.find(e => normalizePhone(e.phone) === norm)
  }

  // Карточку и постоянные данные для входа создаёт администратор.
  function addEmployee(data: {
    name: string
    phone: string
    email?: string
    position?: string
    department?: string
    role?: UserRole
    password?: string
    managerId?: string
  }): { employee: Employee; password: string } {
    const password = data.password ?? generateSecurePassword()
    const emp: Employee = {
      id: 'emp-' + Date.now(),
      managerId: data.managerId || undefined,
      phone: normalizePhone(data.phone),
      password,
      name: data.name,
      position: data.position ?? '',
      role: data.role ?? 'EMPLOYEE',
      status: 'INVITED',
      department: data.department ?? '',
      hireDate: new Date().toISOString().split('T')[0],
      email: data.email ?? '',
      lastLogin: '—',
      onboardingProgress: [],
    }
    mockEmployees.unshift(emp)          // мутируем исходный массив → mockClient видит его
    employees.value = [...mockEmployees] // форсируем реактивность
    return { employee: emp, password }
  }

  function updateEmployee(id: string, updates: Partial<Employee>) {
    const idx = mockEmployees.findIndex(e => e.id === id)
    if (idx !== -1) {
      Object.assign(mockEmployees[idx], updates)
      employees.value = [...mockEmployees]
    }
  }

  function removeEmployee(id: string) {
    const idx = mockEmployees.findIndex(e => e.id === id)
    if (idx !== -1) {
      mockEmployees.splice(idx, 1)
      employees.value = [...mockEmployees]
    }
  }

  // Включить / отключить доступ к системе
  function setAccess(id: string, active: boolean) {
    updateEmployee(id, { status: active ? 'ACTIVE' : 'BLOCKED' })
  }

  // Восстановление выполняет администратор: старый пароль сразу перестаёт действовать.
  function resetPassword(id: string): string {
    const password = generateSecurePassword()
    updateEmployee(id, { password })
    return password
  }

  return {
    employees,
    activeCount,
    blockedCount,
    findByPhone,
    addEmployee,
    updateEmployee,
    removeEmployee,
    setAccess,
    resetPassword,
    generateSecurePassword,
  }
})
