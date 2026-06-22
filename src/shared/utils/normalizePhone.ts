export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('7')) return '+' + digits
  if (digits.length === 11 && digits.startsWith('8')) return '+7' + digits.slice(1)
  if (digits.length === 10) return '+7' + digits
  return raw.trim()
}

export function formatPhone(raw: string): string {
  const normalized = normalizePhone(raw)
  const match = normalized.match(/^\+7(\d{3})(\d{3})(\d{2})(\d{2})$/)
  if (!match) return raw.trim()
  return `+7 (${match[1]}) ${match[2]}-${match[3]}-${match[4]}`
}
