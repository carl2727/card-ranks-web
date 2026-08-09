/**
 * Globaler App-Zustand (Zustand).
 * Hält die Liste der Sammlungsnamen und die aktuell geöffnete Sammlung und
 * orchestriert die Persistenz über die IndexedDB-Schicht (lib/db).
 */
import { create } from 'zustand'
import type { Collection } from './types'
import { createCollection } from './lib/collection'
import { downloadCollection } from './lib/serialize'
import * as db from './lib/db'

interface AppState {
  /** Namen aller gespeicherten Sammlungen. */
  names: string[]
  /** Aktuell geöffnete Sammlung oder null. */
  active: Collection | null
  ready: boolean

  /** Sammlungsliste aus der DB neu laden. */
  refresh: () => Promise<void>
  /** Neue, leere Sammlung anlegen, speichern und öffnen. */
  create: (name: string) => Promise<{ ok: boolean; error?: string }>
  /** Vorhandene Sammlung öffnen. */
  open: (name: string) => Promise<void>
  close: () => void
  /** Importierte Sammlung speichern und öffnen (Namenskonflikt wird gemeldet). */
  importCollection: (collection: Collection) => Promise<{ ok: boolean; error?: string }>
  /** Aktive Sammlung transformieren und persistieren. */
  updateActive: (mutator: (current: Collection) => Collection) => Promise<void>
  /** Aktive Sammlung als JSON herunterladen. */
  exportActive: () => void
  /** Sammlung löschen (schließt sie, falls aktiv). */
  remove: (name: string) => Promise<void>
}

export const useAppStore = create<AppState>((set, get) => ({
  names: [],
  active: null,
  ready: false,

  refresh: async () => {
    const names = await db.listCollectionNames()
    names.sort((a, b) => a.localeCompare(b))
    set({ names, ready: true })
  },

  create: async (name) => {
    const trimmed = name.trim()
    if (!trimmed) return { ok: false, error: 'Name must not be empty.' }
    if (get().names.includes(trimmed)) {
      return { ok: false, error: 'A collection with this name already exists.' }
    }
    const collection = createCollection(trimmed)
    await db.saveCollection(collection)
    await get().refresh()
    set({ active: collection })
    return { ok: true }
  },

  open: async (name) => {
    const collection = await db.loadCollection(name)
    if (collection) set({ active: collection })
  },

  close: () => set({ active: null }),

  importCollection: async (collection) => {
    if (get().names.includes(collection.name)) {
      return {
        ok: false,
        error: `A collection named "${collection.name}" already exists.`,
      }
    }
    await db.saveCollection(collection)
    await get().refresh()
    set({ active: collection })
    return { ok: true }
  },

  updateActive: async (mutator) => {
    const current = get().active
    if (!current) return
    const next = mutator(current)
    await db.saveCollection(next)
    set({ active: next })
    if (next.name !== current.name) await get().refresh()
  },

  exportActive: () => {
    const current = get().active
    if (current) downloadCollection(current)
  },

  remove: async (name) => {
    await db.deleteCollection(name)
    if (get().active?.name === name) set({ active: null })
    await get().refresh()
  },
}))
