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

// A message the server meant for the user (a rejected file, say), as opposed to a crash.
export class PlainError extends Error {}

export async function readQuote(input: { text: string } | { image: File }): Promise<ReadResult> {
  const form = new FormData()
  if ('image' in input) form.append('image', input.image)
  else form.append('text', input.text)
  const response = await fetch('/api/read', { method: 'POST', body: form })
  if (response.status >= 400 && response.status < 500) {
    const body = await response.json().catch(() => null)
    throw new PlainError(body?.detail ?? `Reading failed (${response.status})`)
  }
  if (!response.ok) throw new Error(`Reading failed (${response.status})`)
  return response.json()
}
