/**
 * MMR-/Elo-System – framework-freie, reine Logik.
 * 1:1 portiert aus der Desktop-App (mmr_system.py). Siehe docs/adr/0003-tech-stack.md
 * (reine Logik bleibt UI-unabhängig und unit-testbar).
 */

export const DEFAULT_K_FACTOR = 32

/** Erwartete Gewinnwahrscheinlichkeit für A gegen B (0..1). */
export function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400))
}

/** MMR-Änderung für Gewinner und Verlierer (gerundet). */
export function ratingChange(
  winnerRating: number,
  loserRating: number,
  kFactor: number = DEFAULT_K_FACTOR,
): { winnerChange: number; loserChange: number } {
  const expectedWinner = expectedScore(winnerRating, loserRating)
  const expectedLoser = expectedScore(loserRating, winnerRating)
  return {
    winnerChange: Math.round(kFactor * (1 - expectedWinner)),
    loserChange: Math.round(kFactor * (0 - expectedLoser)),
  }
}

/** Neue MMR-Werte nach einem Match. MMR fällt nie unter 0. */
export function updateRatings(
  winnerRating: number,
  loserRating: number,
  kFactor: number = DEFAULT_K_FACTOR,
): { winner: number; loser: number } {
  const { winnerChange, loserChange } = ratingChange(winnerRating, loserRating, kFactor)
  return {
    winner: winnerRating + winnerChange,
    loser: Math.max(0, loserRating + loserChange),
  }
}
