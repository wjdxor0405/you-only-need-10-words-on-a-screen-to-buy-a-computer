// Mirrors server/app/models.py.

export const PART_TYPES = ['CPU', 'GPU', 'Motherboard', 'RAM', 'Storage', 'PSU', 'Case', 'Cooler', 'Other'] as const
export type PartType = (typeof PART_TYPES)[number]

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
  verdict: Verdict
  headline: string
  cant_verify_reason: null | 'not_in_sample' | 'name_too_vague'
  typical_price_usd: null | number
  listings: Listing[]
  swap_risk: boolean
}

export interface CheckResult {
  results: LineResult[]
  rule_text: string
  sample_data_note: string
  total_usd: number
}
