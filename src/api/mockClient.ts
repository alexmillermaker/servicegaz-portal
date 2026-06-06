// ============================================================
// MOCK CLIENT — имитация бэкенда с сетевой задержкой
// ============================================================
import { mockEmployees, mockDocuments, mockNews } from './mockData'
import type { Employee, Document, NewsItem } from './mockData'
import { normalizePhone } from '@/shared/utils/normalizePhone'

const delay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms))

export type AuthResult =
  | { ok: true; employee: Employee }
  | { ok: false; code: 'NOT_IN_WHITELIST' | 'BLOCKED' | 'ARCHIVED' | 'INVALID_OTP' }

// ─── Шаг 1: Проверка номера телефона по белому списку ────────
export async function checkPhone(phone: string): Promise<
  | { ok: true }
  | { ok: false; code: 'NOT_IN_WHITELIST' | 'BLOCKED' | 'ARCHIVED' }
> {
  await delay(600)
  const normalized = normalizePhone(phone)
  const emp = mockEmployees.find(e => normalizePhone(e.phone) === normalized)

  if (!emp) return { ok: false, code: 'NOT_IN_WHITELIST' }
  if (emp.status === 'BLOCKED') return { ok: false, code: 'BLOCKED' }
  if (emp.status === 'ARCHIVED') return { ok: false, code: 'ARCHIVED' }
  return { ok: true }
}

// ─── Вход по номеру телефона и паролю (единый шаг) ───────────
export async function loginWithPassword(phone: string, password: string): Promise<AuthResult> {
  await delay(800)
  const normalized = normalizePhone(phone)
  const emp = mockEmployees.find(e => normalizePhone(e.phone) === normalized)

  if (!emp) return { ok: false, code: 'NOT_IN_WHITELIST' }
  if (emp.status === 'BLOCKED') return { ok: false, code: 'BLOCKED' }
  if (emp.status === 'ARCHIVED') return { ok: false, code: 'ARCHIVED' }
  if (emp.otp !== password) return { ok: false, code: 'INVALID_OTP' }

  return { ok: true, employee: emp }
}

// ─── Шаг 2: Верификация OTP-кода ─────────────────────────────
export async function verifyOtp(phone: string, otp: string): Promise<AuthResult> {
  await delay(900)
  const normalized = normalizePhone(phone)
  const emp = mockEmployees.find(e => normalizePhone(e.phone) === normalized)

  if (!emp) return { ok: false, code: 'NOT_IN_WHITELIST' }
  if (emp.status === 'BLOCKED') return { ok: false, code: 'BLOCKED' }
  if (emp.status === 'ARCHIVED') return { ok: false, code: 'ARCHIVED' }
  if (emp.otp !== otp) return { ok: false, code: 'INVALID_OTP' }

  return { ok: true, employee: emp }
}

// ─── Документы КЭДО ──────────────────────────────────────────
export async function fetchDocuments(): Promise<Document[]> {
  await delay(500)
  return mockDocuments
}

// ─── Новости ─────────────────────────────────────────────────
export async function fetchNews(): Promise<NewsItem[]> {
  await delay(400)
  return mockNews
}

// ─── Фиксация ознакомления с документом ─────────────────────
export async function acknowledgeDocument(
  docId: string,
  employeeId: string
): Promise<{ ok: true; timestamp: string }> {
  await delay(700)
  const timestamp = new Date().toISOString()
  console.log(`[КЭДО TX] docId=${docId} empId=${employeeId} ts=${timestamp}`)
  return { ok: true, timestamp }
}

// ─── Сохранение прогресса онбординга ────────────────────────
export async function saveOnboardingProgress(
  employeeId: string,
  completedIds: number[]
): Promise<{ ok: true }> {
  await delay(300)
  const emp = mockEmployees.find(e => e.id === employeeId)
  if (emp) emp.onboardingProgress = completedIds
  return { ok: true }
}

// ─── Список сотрудников для Admin-панели ────────────────────
export async function fetchEmployees(): Promise<Employee[]> {
  await delay(600)
  return mockEmployees
}
