import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAppStore } from '../store'
import { createCard } from '../lib/collection'
import { RankingTable } from './RankingTable'

export function CollectionView() {
  const active = useAppStore((s) => s.active)
  const close = useAppStore((s) => s.close)
  const exportActive = useAppStore((s) => s.exportActive)
  const remove = useAppStore((s) => s.remove)
  const updateActive = useAppStore((s) => s.updateActive)

  const [cardName, setCardName] = useState('')

  if (!active) return null

  async function handleAddCard(event: FormEvent) {
    event.preventDefault()
    const name = cardName.trim()
    if (!name) return
    await updateActive((c) => ({ ...c, cards: [...c.cards, createCard(name)] }))
    setCardName('')
  }

  async function handleDeleteCard(id: string) {
    await updateActive((c) => ({ ...c, cards: c.cards.filter((card) => card.id !== id) }))
  }

  async function handleDeleteCollection() {
    if (active && confirm(`Sammlung "${active.name}" wirklich löschen?`)) {
      await remove(active.name)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={close}
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-200 transition-colors hover:border-slate-500"
          >
            ← Zurück
          </button>
          <h2 className="text-xl font-semibold text-white">{active.name}</h2>
          <span className="text-sm text-slate-500">
            {active.cards.length} {active.cards.length === 1 ? 'Karte' : 'Karten'}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={exportActive}
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-200 transition-colors hover:border-slate-500"
          >
            Export JSON
          </button>
          <button
            type="button"
            onClick={handleDeleteCollection}
            className="rounded-lg border border-red-900/60 px-3 py-1.5 text-sm text-red-400 transition-colors hover:bg-red-950/40"
          >
            Löschen
          </button>
        </div>
      </div>

      <form onSubmit={handleAddCard} className="flex flex-wrap gap-2">
        <input
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
          placeholder="Kartenname"
          className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-violet-500"
        />
        <button
          type="submit"
          className="rounded-lg bg-violet-600 px-4 py-2 font-medium text-white transition-colors hover:bg-violet-500"
        >
          Karte hinzufügen
        </button>
      </form>

      <RankingTable cards={active.cards} onDelete={handleDeleteCard} />
    </div>
  )
}
