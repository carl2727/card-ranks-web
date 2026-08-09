/**
 * Bildkomprimierung für den Import.
 * Gemäß ADR-0002 werden Bilder als Base64-data:-URI in die Sammlung eingebettet;
 * um die JSON-Größe zu begrenzen, werden sie vorher verkleinert und (per Default)
 * als WebP kodiert.
 */

export interface CompressOptions {
  /** Maximale Kantenlänge in px (Seitenverhältnis bleibt erhalten). */
  maxEdge?: number
  /** Qualität 0..1 (nur für verlustbehaftete Formate wie WebP/JPEG). */
  quality?: number
  /** Ziel-MIME-Typ. */
  mimeType?: string
}

/**
 * Liest eine Bilddatei, skaliert sie auf maxEdge herunter und liefert einen
 * komprimierten data:-URI zurück.
 */
export async function fileToCompressedDataUrl(
  file: File,
  options: CompressOptions = {},
): Promise<string> {
  const { maxEdge = 800, quality = 0.85, mimeType = 'image/webp' } = options

  const bitmap = await createImageBitmap(file)
  try {
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height))
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D-Kontext nicht verfügbar')
    ctx.drawImage(bitmap, 0, 0, width, height)

    return canvas.toDataURL(mimeType, quality)
  } finally {
    bitmap.close()
  }
}

/** Grobe Größenabschätzung eines data:-URI in Bytes (Base64-Anteil). */
export function dataUrlByteSize(dataUrl: string): number {
  const commaIndex = dataUrl.indexOf(',')
  if (commaIndex === -1) return 0
  const base64 = dataUrl.slice(commaIndex + 1)
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0
  return Math.floor((base64.length * 3) / 4) - padding
}
