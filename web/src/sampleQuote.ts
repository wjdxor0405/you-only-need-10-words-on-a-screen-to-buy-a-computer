import type { PartLine } from './types'

// A quote designed to produce every verdict against server/data/prices.json:
// Reasonable (CPU, board, RAM, case), Unusually low (GPU), Worth questioning (PSU),
// Can't verify: name too vague + swap risk (SSD), Can't verify: not in sample (cooler).
export const SAMPLE_LINES: PartLine[] = [
  { part_type: 'CPU', name: 'AMD Ryzen 5 7600 6-Core Processor', price_usd: 199 },
  { part_type: 'Motherboard', name: 'MSI PRO B650M-A WIFI', price_usd: 159 },
  { part_type: 'RAM', name: 'Corsair Vengeance 32GB (2x16GB) DDR5-6000 CL30', price_usd: 105 },
  { part_type: 'GPU', name: 'MSI GeForce RTX 4060 Ventus 2X 8GB', price_usd: 195 },
  { part_type: 'Storage', name: 'SSD 1TB', price_usd: 79 },
  { part_type: 'PSU', name: 'Corsair RM650e 650W 80+ Gold', price_usd: 109 },
  { part_type: 'Case', name: 'NZXT H5 Flow', price_usd: 95 },
  { part_type: 'Cooler', name: 'Thermalright Peerless Assassin 120 SE', price_usd: 38 },
]

// The same quote as a shop would send it, for "Try a sample quote".
export const SAMPLE_QUOTE_TEXT = `Custom PC build — quote #1042
CPU: AMD Ryzen 5 7600 6-Core Processor ............ $199.00
Motherboard: MSI PRO B650M-A WIFI .................. $159.00
Memory: Corsair Vengeance 32GB (2x16GB) DDR5-6000 CL30 ... $105.00
Graphics: MSI GeForce RTX 4060 Ventus 2X 8GB ........ $195.00
Storage: SSD 1TB ................................... $79.00
Power supply: Corsair RM650e 650W 80+ Gold ......... $109.00
Case: NZXT H5 Flow ................................. $95.00
CPU cooler: Thermalright Peerless Assassin 120 SE .. $38.00
Assembly and testing ............................... $60.00
Total .............................................. $1,039.00`
