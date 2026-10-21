import type { PartType } from '../types'

// Simple line icons, one per part type, drawn for this project.
const PATHS: Record<PartType, string> = {
  CPU: 'M7 7h10v10H7z M10 10h4v4h-4z M9 3v4 M15 3v4 M9 17v4 M15 17v4 M3 9h4 M3 15h4 M17 9h4 M17 15h4',
  GPU: 'M2 7h20v10H2z M9 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0 M17 10v4 M20 10v4 M4 17v3 M8 17v2',
  Motherboard: 'M4 3h16v18H4z M7 6h5v5H7z M14 6h3v2h-3z M14 10h3v2h-3z M7 14h10 M7 17h10',
  RAM: 'M2 8h20v8H2z M5 11h2v2H5z M9 11h2v2H9z M13 11h2v2h-2z M17 11h2v2h-2z M11 16v2 M4 16v2 M20 16v2',
  Storage: 'M3 9h18v6H3z M6 12h7 M17 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
  PSU: 'M3 5h18v14H3z M13 8l-3 5h4l-3 4',
  Case: 'M7 2h10v20H7z M10 5h4 M10 8h4 M12 17m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0 -3 0',
  Cooler: 'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0 M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0 M12 10c0-3 1-5 4-6 M14 12c3 0 5 1 6 4 M12 14c0 3-1 5-4 6 M10 12c-3 0-5-1-6-4',
  Other: 'M4 7l8-4 8 4v10l-8 4-8-4z M4 7l8 4 8-4 M12 11v10',
}

export default function PartIcon({ type }: { type: PartType }) {
  return (
    <svg className="part-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d={PATHS[type]} />
    </svg>
  )
}
