/**
 * Kern-Datentypen für Card Ranks Web.
 * Portiert aus der Desktop-App (models.py). Siehe docs/adr/0002-storage-strategy.md
 * für das Persistenz-/Austauschformat (eine JSON pro Sammlung, Bilder als Base64).
 */

export type DataFieldType = 'int' | 'float' | 'string'

export interface DataField {
  name: string
  type: DataFieldType
}

export interface Card {
  id: string
  name: string
  /** Matchmaking-Rating (Elo). Startwert 1500. */
  mmr: number
  /** Bild als Base64-data:-URI (siehe ADR-0002) oder null. */
  image: string | null
  /** Optionales alternatives Design, ebenfalls als data:-URI. */
  alternativeImage: string | null
  tags: string[]
  /** Werte je konfiguriertem DataField der Sammlung. */
  dataValues: Record<string, number | string | null>
}

export interface Collection {
  /** Schema-Version für zukünftige Migrationen des JSON-Formats. */
  schemaVersion: number
  name: string
  dataFields: DataField[]
  cards: Card[]
}

export const CURRENT_SCHEMA_VERSION = 1
export const DEFAULT_MMR = 1500
export const MAX_DATA_FIELDS = 12
