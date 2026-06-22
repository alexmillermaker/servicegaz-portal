// ============================================================
// MOCK CLIENT — имитация бэкенда с сетевой задержкой
// ============================================================
import { mockEmployees, mockDocuments, mockNews } from './mockData'
import type { Employee, Document, NewsItem } from './mockData'
import { employeeLogin, normalizeLogin } from '@/shared/utils/employeeCredentials'

const delay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms))

export type AuthResult =
  | { ok: true; employee: Employee }
  | { ok: false; code: 'NOT_IN_WHITELIST' | 'BLOCKED' | 'ARCHIVED' | 'INVALID_CREDENTIALS' }

// ─── Вход по постоянному логину и паролю ─────────────────────
export async function loginWithPassword(login: string, password: string): Promise<AuthResult> {
  await delay(800)
  const normalized = normalizeLogin(login)
  const emp = mockEmployees.find(employee => normalizeLogin(employeeLogin(employee)) === normalized)

  if (!emp) return { ok: false, code: 'NOT_IN_WHITELIST' }
  if (emp.status === 'BLOCKED') return { ok: false, code: 'BLOCKED' }
  if (emp.status === 'ARCHIVED') return { ok: false, code: 'ARCHIVED' }
  if (emp.password !== password) return { ok: false, code: 'INVALID_CREDENTIALS' }

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
