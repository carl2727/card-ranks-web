/**
 * Framework-freie Collection-/Card-Helfer.
 * Portiert aus models.py (Card/Collection, Normalisierung, Ranking).
 */
import type { Card, Collection, DataField, DataFieldType } from '../types'
import { CURRENT_SCHEMA_VERSION, DEFAULT_MMR, MAX_DATA_FIELDS } from '../types'

const ALLOWED_TYPES: readonly DataFieldType[] = ['int', 'float', 'string']

/** Kurze, eindeutige ID (ersetzt md5(name+time) aus der Desktop-App). */
export function generateId(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 10)
}

/** Tags trimmen, leere entfernen, Duplikate (case-insensitive) entfernen – stabile Reihenfolge. */
export function normalizeTags(tags: readonly string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const raw of tags) {
    const tag = String(raw).trim()
    if (!tag) continue
    const key = tag.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    result.push(tag)
  }
  return result
}

/** Datenfeld-Definitionen bereinigen: max. 12, gültige Typen, Dedupe nach Name. */
export function normalizeDataFields(fields: readonly DataField[]): DataField[] {
  const seen = new Set<string>()
  const result: DataField[] = []
  for (const raw of fields) {
    if (result.length >= MAX_DATA_FIELDS) break
    const name = String(raw?.name ?? '').trim()
    if (!name) continue
    const key = name.toLowerCase()
    if (seen.has(key)) continue
    const type: DataFieldType = ALLOWED_TYPES.includes(raw?.type as DataFieldType)
      ? (raw.type as DataFieldType)
      : 'string'
    seen.add(key)
    result.push({ name, type })
  }
  return result
}

/** Einen Rohwert auf den Feldtyp zwingen; leere/ungültige Werte werden null. */
export function coerceValue(
  value: unknown,
  type: DataFieldType,
): number | string | null {
  if (value === null || value === undefined || value === '') return null
  if (type === 'int') {
    const n = parseInt(String(value), 10)
    return Number.isNaN(n) ? null : n
  }
  if (type === 'float') {
    const n = Number(value)
    return Number.isNaN(n) ? null : n
  }
  return String(value)
}

/** dataValues einer Karte an die Feld-Definitionen der Sammlung angleichen. */
export function applyDataFields(fields: readonly DataField[], card: Card): Card {
  const current = card.dataValues ?? {}
  const dataValues: Record<string, number | string | null> = {}
  for (const field of fields) {
    dataValues[field.name] = coerceValue(current[field.name], field.type)
  }
  return { ...card, dataValues }
}

export function createCollection(name: string, dataFields: readonly DataField[] = []): Collection {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    name: name.trim(),
    dataFields: normalizeDataFields(dataFields),
    cards: [],
  }
}

export interface CreateCardOptions {
  mmr?: number
  image?: string | null
  alternativeImage?: string | null
  tags?: readonly string[]
  dataValues?: Record<string, number | string | null>
}

export function createCard(name: string, options: CreateCardOptions = {}): Card {
  return {
    id: generateId(),
    name: name.trim(),
    mmr: options.mmr ?? DEFAULT_MMR,
    image: options.image ?? null,
    alternativeImage: options.alternativeImage ?? null,
    tags: normalizeTags(options.tags ?? []),
    dataValues: options.dataValues ?? {},
  }
}

/** Karten absteigend nach MMR (reine Kopie, mutiert nicht). */
export function sortedByMmr(cards: readonly Card[]): Card[] {
  return [...cards].sort((a, b) => b.mmr - a.mmr)
}

export interface RankedCard extends Card {
  rank: number
}

/** Abgeleitete Ränge (1-basiert) nach MMR – rank wird nicht persistiert. */
export function rankedCards(cards: readonly Card[]): RankedCard[] {
  return sortedByMmr(cards).map((card, index) => ({ ...card, rank: index + 1 }))
}
