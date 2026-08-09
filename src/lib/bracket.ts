/**
 * Bracket-/Turnier-Logik – framework-frei und testbar.
 * Portiert aus der Desktop-App: Top-N-Seeding (1vs32, 2vs31, …), Gewinner rücken
 * in Reihenfolge vor bis ins Finale.
 */
import type { Card } from '../types'
import { sortedByMmr } from './collection'

export const MAX_BRACKET_SIZE = 32

/** Größte Zweierpotenz ≤ min(count, 32) – so viele Karten nehmen am Bracket teil. */
export function bracketSize(count: number): number {
  const capped = Math.min(count, MAX_BRACKET_SIZE)
  let size = 1
  while (size * 2 <= capped) size *= 2
  return size
}

/**
 * Seeding-Reihenfolge: [1, N, 2, N-1, …]. Aufeinanderfolgende Paare spielen
 * gegeneinander (1vsN, 2vs(N-1), …), Gewinner behalten ihre Reihenfolge.
 */
export function seedParticipants(cards: readonly Card[], size: number): string[] {
  const top = sortedByMmr(cards).slice(0, size)
  const order: string[] = []
  for (let i = 0; i < size / 2; i++) {
    order.push(top[i].id)
    order.push(top[size - 1 - i].id)
  }
  return order
}

/** Name der aktuellen Runde nach Teilnehmerzahl. */
export function roundName(participantCount: number): string {
  switch (participantCount) {
    case 2:
      return 'Finale'
    case 4:
      return 'Halbfinale'
    case 8:
      return 'Viertelfinale'
    case 16:
      return 'Achtelfinale'
    case 32:
      return 'Sechzehntelfinale'
    default:
      return `${participantCount}er-Runde`
  }
}
