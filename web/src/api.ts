import type { CheckResult, PartLine } from './types'

export async function checkPrices(lines: PartLine[]): Promise<CheckResult> {
  const response = await fetch('/api/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lines }),
  })
  if (!response.ok) throw new Error(`Checking failed (${response.status})`)
  return response.json()
}
