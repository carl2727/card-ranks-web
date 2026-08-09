import { useState } from 'react'
import type { DragEvent, FormEvent, KeyboardEvent } from 'react'
import type { Card } from '../types'
import { useAppStore } from '../store'
import { createCard, normalizeTags } from '../lib/collection'
import { upsertCard } from '../lib/mutations'
import { fileToCompressedDataUrl } from '../lib/image'
import { Modal } from './Modal'

interface Props {
  card?: Card
  onClose: () => void
}

export function CardEditor({ card, onClose }: Props) {
  const active = useAppStore((s) => s.active)
  const updateActive = useAppStore((s) => s.updateActive)

  const [name, setName] = useState(card?.name ?? '')
  const [image, setImage] = useState<string | null>(card?.image ?? null)
  const [altImage, setAltImage] = useState<string | null>(card?.alternativeImage ?? null)
  const [tags, setTags] = useState<string[]>(card?.tags ?? [])
  const [tagInput, setTagInput] = useState('')
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    for (const [key, value] of Object.entries(card?.dataValues ?? {})) {
      initial[key] = value === null ? '' : String(value)
    }
    return initial
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!active) return null
  const dataFields = active.dataFields

  async function loadImage(file: File | undefined, target: 'image' | 'alt') {
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      const dataUrl = await fileToCompressedDataUrl(file)
      if (target === 'image') setImage(dataUrl)
      else setAltImage(dataUrl)
    } catch {
      setError('Image could not be processed.')
    } finally {
      setBusy(false)
    }
  }

  function onDrop(event: DragEvent, target: 'image' | 'alt') {
    event.preventDefault()
    void loadImage(event.dataTransfer.files?.[0], target)
  }

  function addTag() {
    const next = normalizeTags([...tags, tagInput])
    setTags(next)
    setTagInput('')
  }

  function onTagKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      addTag()
    }
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Name must not be empty.')
      return
    }
    const next: Card = card
      ? { ...card, name: trimmed, image, alternativeImage: altImage, tags, dataValues: values }
      : createCard(trimmed, { image, alternativeImage: altImage, tags, dataValues: values })
    await updateActive((c) => upsertCard(c, next))
    onClose()
  }

  return (
    <Modal title={card ? 'Edit card' : 'New card'} onClose={onClose}>
      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-400">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-violet-500"
            autoFocus
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          {(['image', 'alt'] as const).map((target) => {
            const current = target === 'image' ? image : altImage
            const label = target === 'image' ? 'Image' : 'Alternative design'
            return (
              <div key={target} className="flex flex-col gap-1 text-sm">
                <span className="text-slate-400">{label}</span>
                <label
                  onDrop={(e) => onDrop(e, target)}
                  onDragOver={(e) => e.preventDefault()}
                  className="flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-700 bg-slate-950 text-center text-xs text-slate-500 hover:border-violet-500"
                >
                  {current ? (
                    <img src={current} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span>Click or drop a file</span>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => loadImage(e.target.files?.[0], target)}
                  />
                </label>
                {current && (
                  <button
                    type="button"
                    onClick={() => (target === 'image' ? setImage(null) : setAltImage(null))}
                    className="text-xs text-slate-500 hover:text-red-400"
                  >
                    Remove image
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex flex-col gap-1 text-sm">
          <span className="text-slate-400">Tags</span>
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-200"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => setTags(tags.filter((t) => t !== tag))}
                  className="text-slate-500 hover:text-red-400"
                  aria-label={`Remove tag ${tag}`}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={onTagKey}
              placeholder="Type a tag, then Enter"
              className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-violet-500"
            />
            <button
              type="button"
              onClick={addTag}
              className="rounded-lg border border-slate-700 px-3 py-2 text-slate-200 hover:border-slate-500"
            >
              +
            </button>
          </div>
        </div>

        {dataFields.length > 0 && (
          <div className="flex flex-col gap-2 text-sm">
            <span className="text-slate-400">Data fields</span>
            {dataFields.map((field) => (
              <label key={field.name} className="flex items-center gap-2">
                <span className="w-32 shrink-0 text-slate-300">{field.name}</span>
                <input
                  type={field.type === 'string' ? 'text' : 'number'}
                  step={field.type === 'float' ? 'any' : undefined}
                  value={values[field.name] ?? ''}
                  onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}
                  className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-violet-500"
                />
              </label>
            ))}
          </div>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-700 px-4 py-2 text-slate-200 hover:border-slate-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-violet-600 px-4 py-2 font-medium text-white hover:bg-violet-500 disabled:opacity-50"
          >
            {busy ? 'Processing…' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
