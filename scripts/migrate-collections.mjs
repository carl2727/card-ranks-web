#!/usr/bin/env node
/**
 * migrate-collections.mjs
 *
 * Konvertiert alte Desktop-Sammlungen (card-ranks, snake_case + image_path) in das
 * neue Web-Format (siehe src/types.ts und docs/adr/0002-storage-strategy.md):
 * eine selbst-enthaltene JSON pro Sammlung mit Bildern als eingebettete Base64-URIs.
 *
 * WICHTIG: Die in den alten JSONs gespeicherten Bildpfade zeigen auf C:\, die
 * Dateien liegen aber inzwischen auf E:\. Das Skript remappt das automatisch.
 *
 * Aufruf:
 *   node scripts/migrate-collections.mjs <input.json | inputDir> [Optionen]
 *
 * Optionen:
 *   --out <dir>           Ausgabeordner (Default: ./migrated neben dem Skript-CWD)
 *   --images-base <path>  Basis, unter der "card_images" tatsächlich liegt
 *                         (Default: E:\Users\carlr\Documents\Card Ranks)
 *   --from-drive <X>      Quell-Laufwerksbuchstabe für simples Remapping (Default: C)
 *   --to-drive <X>        Ziel-Laufwerksbuchstabe für simples Remapping (Default: E)
 *
 * Beispiel:
 *   node scripts/migrate-collections.mjs "E:\\Users\\carlr\\Documents\\Card Ranks\\collections\\NBA_Players.json"
 */
import { readFile, writeFile, mkdir, readdir, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const SCHEMA_VERSION = 1

const MIME_BY_EXT = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.bmp': 'image/bmp',
}

function parseArgs(argv) {
  const args = { _: [] }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith('--')) {
      args[a.slice(2)] = argv[++i]
    } else {
      args._.push(a)
    }
  }
  return args
}

/** Backslashes vereinheitlichen und in Segmente zerlegen. */
function splitPath(p) {
  return p.replace(/\\/g, '/').split('/').filter(Boolean)
}

/**
 * Ermittelt den tatsächlichen, existierenden Pfad einer Bilddatei.
 * Reihenfolge: (1) unter --images-base re-rooten ab "card_images",
 *              (2) Laufwerks-Remap C:->E:, (3) Originalpfad.
 */
function resolveImagePath(originalPath, { imagesBase, fromDrive, toDrive }) {
  if (!originalPath) return null
  const candidates = []

  const segments = splitPath(originalPath)
  const ciIndex = segments.findIndex((s) => s.toLowerCase() === 'card_images')
  if (imagesBase && ciIndex !== -1) {
    candidates.push(path.join(imagesBase, ...segments.slice(ciIndex)))
  }

  // Laufwerks-Remap: "C:\..." -> "E:\..."
  const driveRemapped = originalPath.replace(
    new RegExp(`^${fromDrive}:`, 'i'),
    `${toDrive}:`,
  )
  candidates.push(driveRemapped)
  candidates.push(originalPath)

  for (const c of candidates) {
    if (c && existsSync(c)) return c
  }
  return null
}

async function fileToDataUrl(filePath) {
  const buffer = await readFile(filePath)
  const ext = path.extname(filePath).toLowerCase()
  const mime = MIME_BY_EXT[ext] ?? 'application/octet-stream'
  return `data:${mime};base64,${buffer.toString('base64')}`
}

function migrateCard(raw, resolveOpts) {
  return {
    original: raw,
    id: typeof raw.id === 'string' && raw.id ? raw.id : null,
    name: String(raw.name ?? '').trim(),
    mmr: Number.isFinite(raw.mmr) ? raw.mmr : 1500,
    tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
    dataValues:
      raw.data_values && typeof raw.data_values === 'object' ? raw.data_values : {},
    resolvedImagePath: resolveImagePath(raw.image_path, resolveOpts),
  }
}

async function migrateFile(inputPath, opts) {
  const text = await readFile(inputPath, 'utf8')
  const legacy = JSON.parse(text)

  const dataFields = Array.isArray(legacy.data_fields)
    ? legacy.data_fields
        .filter((f) => f && typeof f.name === 'string' && f.name.trim())
        .map((f) => ({ name: String(f.name).trim(), type: String(f.type ?? 'string') }))
    : []

  const rawCards = Array.isArray(legacy.cards) ? legacy.cards : []
  const cards = []
  let embedded = 0
  let missing = 0

  for (const rc of rawCards) {
    const m = migrateCard(rc, opts)
    if (!m.name) continue

    let image = null
    if (m.resolvedImagePath) {
      image = await fileToDataUrl(m.resolvedImagePath)
      embedded++
    } else if (rc.image_path) {
      missing++
      console.warn(`  ! Bild nicht gefunden für "${m.name}": ${rc.image_path}`)
    }

    cards.push({
      id: m.id ?? Math.random().toString(16).slice(2, 12),
      name: m.name,
      mmr: m.mmr,
      image,
      alternativeImage: null,
      tags: m.tags,
      dataValues: m.dataValues,
    })
  }

  const collection = {
    schemaVersion: SCHEMA_VERSION,
    name: typeof legacy.name === 'string' && legacy.name.trim() ? legacy.name : 'Imported',
    dataFields,
    cards,
  }

  return { collection, embedded, missing }
}

function sanitizeFilename(name) {
  return name.trim().replace(/[^\w.-]+/g, '_') || 'collection'
}

async function collectInputs(inputArg) {
  const info = await stat(inputArg)
  if (info.isDirectory()) {
    const entries = await readdir(inputArg)
    return entries
      .filter((e) => e.toLowerCase().endsWith('.json'))
      .map((e) => path.join(inputArg, e))
  }
  return [inputArg]
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args._.length === 0) {
    console.error('Usage: node scripts/migrate-collections.mjs <input.json | inputDir> [--out <dir>] [--images-base <path>] [--from-drive C] [--to-drive E]')
    process.exit(1)
  }

  const inputArg = args._[0]
  const outDir = args.out ?? path.resolve('migrated')
  const opts = {
    imagesBase: args['images-base'] ?? 'E:\\Users\\carlr\\Documents\\Card Ranks',
    fromDrive: (args['from-drive'] ?? 'C').toUpperCase(),
    toDrive: (args['to-drive'] ?? 'E').toUpperCase(),
  }

  await mkdir(outDir, { recursive: true })
  const inputs = await collectInputs(inputArg)

  console.log(`Migriere ${inputs.length} Datei(en) → ${outDir}`)
  console.log(`Bild-Basis: ${opts.imagesBase} (Remap ${opts.fromDrive}: → ${opts.toDrive}:)\n`)

  let totalEmbedded = 0
  let totalMissing = 0

  for (const input of inputs) {
    console.log(`• ${path.basename(input)}`)
    try {
      const { collection, embedded, missing } = await migrateFile(input, opts)
      const outPath = path.join(outDir, `${sanitizeFilename(collection.name)}.json`)
      await writeFile(outPath, JSON.stringify(collection, null, 2), 'utf8')
      totalEmbedded += embedded
      totalMissing += missing
      console.log(
        `  → ${collection.cards.length} Karten, ${embedded} Bilder eingebettet, ${missing} fehlend`,
      )
      console.log(`  → geschrieben: ${outPath}`)
    } catch (err) {
      console.error(`  ✗ Fehler: ${err.message}`)
    }
  }

  console.log(
    `\nFertig. Insgesamt ${totalEmbedded} Bilder eingebettet, ${totalMissing} fehlend.`,
  )
  console.log('Die erzeugten JSON-Dateien in der Web-App über "Import JSON" laden.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
