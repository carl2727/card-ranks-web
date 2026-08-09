/**
 * MMR-Tier-Farben – portiert aus comparison_widget.py (get_rank_color).
 * Reine Logik, UI-unabhängig.
 */

export interface Tier {
  name: string
  min: number
  /** Hex-Farbe für Kartenhintergrund/Akzent. */
  color: string
}

/** Absteigend nach Schwelle – erster Treffer gilt. */
export const TIERS: Tier[] = [
  { name: 'Lila', min: 1850, color: '#9C27B0' },
  { name: 'Orange', min: 1650, color: '#FF9800' },
  { name: 'Gelb', min: 1550, color: '#FFEB3B' },
  { name: 'Blau', min: 1500, color: '#2196F3' },
  { name: 'Grün', min: 1400, color: '#4CAF50' },
  { name: 'Grau', min: 0, color: '#9E9E9E' },
]

export function tierForMmr(mmr: number): Tier {
  return TIERS.find((t) => mmr >= t.min) ?? TIERS[TIERS.length - 1]
}

export function tierColor(mmr: number): string {
  return tierForMmr(mmr).color
}
