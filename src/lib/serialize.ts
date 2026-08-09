/**
 * JSON-Serialisierung, Validierung und Migration von Sammlungen.
 * Format-Definition: docs/adr/0002-storage-strategy.md
 * Eine Sammlung = eine selbst-enthaltene JSON-Datei (Bilder als Base64).
 */
import type { Card, Collection, DataField } from '../types'
import { CURRENT_SCHEMA_VERSION, DEFAULT_MMR } from '../types'
import { normalizeDataFields, normalizeTags } from './collection'

export type ParseResult =
  | { ok: true; collection: Collection }
  | { ok: false; error: string }

export function serializeCollection(collection: Collection): string {
  return JSON.stringify(collection, null, 2)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/** Nur data:-URIs sind im Web als eingebettetes Bild nutzbar (siehe ADR-0002). */
function sanitizeImage(value: unknown): string | null {
  return typeof value === 'string' && value.startsWith('data:') ? value : null
}

function parseCard(raw: unknown): Card | null {
  if (!isRecord(raw)) return null
  const name = typeof raw.name === 'string' ? raw.name : ''
  if (!name.trim()) return null

  const mmr = typeof raw.mmr === 'number' && Number.isFinite(raw.mmr) ? raw.mmr : DEFAULT_MMR
  const id =
    typeof raw.id === 'string' && raw.id
      ? raw.id
      : crypto.randomUUID().replace(/-/g, '').slice(0, 10)

  const rawTags = Array.isArray(raw.tags) ? raw.tags.map((t) => String(t)) : []
  const dataValues = isRecord(raw.dataValues)
    ? (raw.dataValues as Record<string, number | string | null>)
    : {}

  return {
    id,
    name,
    mmr,
    image: sanitizeImage(raw.image),
    alternativeImage: sanitizeImage(raw.alternativeImage),
    tags: normalizeTags(rawTags),
    dataValues,
  }
}

/**
 * Konvertiert das alte Desktop-Format (snake_case, Bildpfade) in das Web-Format.
 * Bildpfade können im Browser nicht geladen werden und werden verworfen (null);
 * die Bilder müssten neu hochgeladen werden. Siehe ADR-0002 (Migrationspfad).
 */
function migrateLegacy(raw: Record<string, unknown>): Collection {
  const dataFields: DataField[] = Array.isArray(raw.data_fields)
    ? normalizeDataFields(raw.data_fields as DataField[])
    : []
  const rawCards = Array.isArray(raw.cards) ? raw.cards : []
  const cards: Card[] = []
  for (const rc of rawCards) {
    if (!isRecord(rc)) continue
    const card = parseCard({
      id: rc.id,
      name: rc.name,
      mmr: rc.mmr,
      // Legacy nutzte image_path (Dateipfad) – im Web nicht ladbar → verworfen.
      image: undefined,
      alternativeImage: undefined,
      tags: rc.tags,
      dataValues: rc.data_values,
    })
    if (card) cards.push(card)
  }
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    name: typeof raw.name === 'string' ? raw.name : 'Importiert',
    dataFields,
    cards,
  }
}

/** JSON-Text validieren und als Collection zurückgeben (inkl. Legacy-Migration). */
export function parseCollection(json: string): ParseResult {
  let raw: unknown
  try {
    raw = JSON.parse(json)
  } catch {
    return { ok: false, error: 'Ungültiges JSON – Datei konnte nicht gelesen werden.' }
  }
  if (!isRecord(raw)) return { ok: false, error: 'JSON enthält kein Objekt.' }
  if (typeof raw.name !== 'string' || !raw.name.trim()) {
    return { ok: false, error: 'Sammlung hat keinen gültigen Namen.' }
  }

  // Legacy-Erkennung: altes Format nutzte data_fields (snake_case) und kein schemaVersion.
  const isLegacy = raw.schemaVersion === undefined && 'data_fields' in raw
  if (isLegacy) {
    return { ok: true, collection: migrateLegacy(raw) }
  }

  const rawCards = Array.isArray(raw.cards) ? raw.cards : []
  const cards: Card[] = []
  for (const rc of rawCards) {
    const card = parseCard(rc)
    if (card) cards.push(card)
  }
  const dataFields = Array.isArray(raw.dataFields)
    ? normalizeDataFields(raw.dataFields as DataField[])
    : []

  return {
    ok: true,
    collection: {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      name: raw.name,
      dataFields,
      cards,
    },
  }
}

function sanitizeFilename(name: string): string {
  return name.trim().replace(/[^\w.-]+/g, '_') || 'collection'
}

/** Sammlung als .json-Datei im Browser herunterladen. */
export function downloadCollection(collection: Collection): void {
  const blob = new Blob([serializeCollection(collection)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${sanitizeFilename(collection.name)}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

/** Eine vom Nutzer gewählte Datei einlesen und parsen. */
export async function readCollectionFile(file: File): Promise<ParseResult> {
  const text = await file.text()
  return parseCollection(text)
}
