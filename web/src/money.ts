// Money as the screens show it.

// Up to cents, no trailing zeros: '$1,234.5', '$95'.
export function usd(value: number) {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

// Whole dollars: '$299'.
export function wholeUsd(value: number) {
  return `$${Math.round(value).toLocaleString('en-US')}`
}

// The reasonable range (70–110% of typical) in whole dollars, rounded inward so every dollar
// shown is really inside it. Worked out from whole cents like the server, so float error can't
// move it by a dollar: a typical $299 gives "$210–$328", not "$209–$329".
export function reasonableRange(typical: number) {
  const cents = Math.round(typical * 100)
  return `${wholeUsd(Math.ceil((cents * 70) / 10000))}–${wholeUsd(Math.floor((cents * 110) / 10000))}`
}
