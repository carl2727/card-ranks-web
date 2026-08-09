/**
 * IndexedDB-Persistenz für Sammlungen (Arbeitsspeicher zur Laufzeit, siehe ADR-0002).
 * localStorage wäre für Base64-Bilder zu klein; IndexedDB hält beliebig große Werte.
 * Der Sammlungsname dient als eindeutiger Schlüssel.
 */
import type { DBSchema, IDBPDatabase } from 'idb'
import { openDB } from 'idb'
import type { Collection } from '../types'

interface CardRanksDB extends DBSchema {
  collections: {
    key: string
    value: Collection
  }
}

const DB_NAME = 'card-ranks'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase<CardRanksDB>> | null = null

function getDb(): Promise<IDBPDatabase<CardRanksDB>> {
  if (!dbPromise) {
    dbPromise = openDB<CardRanksDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('collections')) {
          db.createObjectStore('collections', { keyPath: 'name' })
        }
      },
    })
  }
  return dbPromise
}

export async function saveCollection(collection: Collection): Promise<void> {
  const db = await getDb()
  await db.put('collections', collection)
}

export async function loadCollection(name: string): Promise<Collection | undefined> {
  const db = await getDb()
  return db.get('collections', name)
}

export async function listCollectionNames(): Promise<string[]> {
  const db = await getDb()
  return db.getAllKeys('collections')
}

export async function getAllCollections(): Promise<Collection[]> {
  const db = await getDb()
  return db.getAll('collections')
}

export async function deleteCollection(name: string): Promise<void> {
  const db = await getDb()
  await db.delete('collections', name)
}
