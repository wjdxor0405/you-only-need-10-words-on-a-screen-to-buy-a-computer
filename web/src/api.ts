import type { CheckResult, PartLine, ReadResult } from './types'

export async function checkPrices(lines: PartLine[]): Promise<CheckResult> {
  const response = await fetch('/api/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lines }),
  })
  if (!response.ok) throw new Error(`Checking failed (${response.status})`)
  return response.json()
}

export async function readQuote(text: string): Promise<ReadResult> {
  const form = new FormData()
  form.append('text', text)
  const response = await fetch('/api/read', { method: 'POST', body: form })
  if (!response.ok) throw new Error(`Reading failed (${response.status})`)
  return response.json()
}
