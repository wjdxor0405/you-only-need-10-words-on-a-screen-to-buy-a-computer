// Mirrors server/app/models.py.

export const PART_TYPES = ['CPU', 'GPU', 'Motherboard', 'RAM', 'Storage', 'PSU', 'Case', 'Cooler', 'Other'] as const
export type PartType = (typeof PART_TYPES)[number]

// Part types in plain words. Mirrors PART_LABELS in server/app/verdict.py.
export const PART_LABEL: Record<PartType, string> = {
  CPU: 'Processor',
  GPU: 'Graphics card',
  Motherboard: 'Motherboard',
  RAM: 'Memory',
  Storage: 'Storage',
  PSU: 'Power supply',
  Case: 'Case',
  Cooler: 'CPU cooler',
  Other: 'Other part',
}

export type Verdict = 'reasonable' | 'worth_questioning' | 'unusually_low' | 'cant_verify'

export interface PartLine {
  part_type: PartType
  name: string
  price_usd: number
}

export interface Listing {
  store: string
  price_usd: number
  date: string
}

export interface LineResult {
  line: PartLine
  key_words: null | string // the words of the name that matched, as written: "RTX 4060"
  verdict: Verdict
  headline: string
  cant_verify_reason: null | 'not_in_sample' | 'name_too_vague'
  typical_price_usd: null | number
  listings: Listing[]
  swap_risk: boolean
  ask_seller: null | string
  part_label: string // plain part name, e.g. "Graphics card"
}

export interface CheckResult {
  results: LineResult[]
  rule_text: string
  sample_data_note: string
}

export interface ReadResult {
  lines: PartLine[]
  problem: null | { kind: 'unreadable' | 'not_a_quote'; message: string }
}
