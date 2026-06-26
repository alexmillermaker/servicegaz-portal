import type { Employee } from '@/api/mockData'
import { normalizePhone } from './normalizePhone'

const PASSWORD_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%'
const PASSWORD_GROUPS = [
  'ABCDEFGHJKLMNPQRSTUVWXYZ',
  'abcdefghijkmnopqrstuvwxyz',
  '23456789',
  '!@#$%',
]

export function normalizeLogin(value: string): string {
  return normalizePhone(value)
}

export function employeeLogin(employee: Pick<Employee, 'phone'>): string {
  return normalizePhone(employee.phone)
}

function secureIndex(max: number): number {
  const values = new Uint32Array(1)
  const limit = Math.floor(0x100000000 / max) * max
  let value: number
  do {
    crypto.getRandomValues(values)
    value = values[0]
  } while (value >= limit)
  return value % max
}

function secureChar(alphabet: string): string {
  return alphabet[secureIndex(alphabet.length)]
}

export function generateSecurePassword(length = 12): string {
  const safeLength = Math.max(length, PASSWORD_GROUPS.length)
  const chars = PASSWORD_GROUPS.map(secureChar)
  while (chars.length < safeLength) chars.push(secureChar(PASSWORD_ALPHABET))

  for (let index = chars.length - 1; index > 0; index--) {
    const swapIndex = secureIndex(index + 1)
    ;[chars[index], chars[swapIndex]] = [chars[swapIndex], chars[index]]
  }
  return chars.join('')
}
