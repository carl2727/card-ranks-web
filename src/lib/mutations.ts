/**
 * Reine Collection-Mutationen (immutabel). Framework-frei und testbar.
 * Zentralisiert die Logik, die in der Desktop-App über Collection-Methoden lief
 * (add/remove card, set_data_fields, MMR-Update nach Match).
 */
import type { Card, Collection, DataField } from '../types'
import { applyDataFields, normalizeDataFields } from './collection'
import { updateRatings } from './mmr'

/** Datenfelder der Sammlung setzen und alle Karten daran angleichen. */
export function withDataFields(collection: Collection, fields: readonly DataField[]): Collection {
  const dataFields = normalizeDataFields(fields)
  return {
    ...collection,
    dataFields,
    cards: collection.cards.map((card) => applyDataFields(dataFields, card)),
  }
}

/** Karte einfügen oder (nach id) ersetzen; Datenwerte werden angeglichen. */
export function upsertCard(collection: Collection, card: Card): Collection {
  const applied = applyDataFields(collection.dataFields, card)
  const exists = collection.cards.some((c) => c.id === card.id)
  const cards = exists
    ? collection.cards.map((c) => (c.id === card.id ? applied : c))
    : [...collection.cards, applied]
  return { ...collection, cards }
}

export function removeCard(collection: Collection, id: string): Collection {
  return { ...collection, cards: collection.cards.filter((c) => c.id !== id) }
}

/** MMR beider beteiligten Karten nach einem 1v1-Match aktualisieren. */
export function applyMatch(
  collection: Collection,
  winnerId: string,
  loserId: string,
): Collection {
  const winner = collection.cards.find((c) => c.id === winnerId)
  const loser = collection.cards.find((c) => c.id === loserId)
  if (!winner || !loser) return collection

  const next = updateRatings(winner.mmr, loser.mmr)
  const cards = collection.cards.map((c) => {
    if (c.id === winnerId) return { ...c, mmr: next.winner }
    if (c.id === loserId) return { ...c, mmr: next.loser }
    return c
  })
  return { ...collection, cards }
}
