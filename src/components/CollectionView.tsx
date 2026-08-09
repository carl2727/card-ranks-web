import { useState } from 'react'
import type { Card } from '../types'
import { useAppStore } from '../store'
import { removeCard } from '../lib/mutations'
import { RankingTable } from './RankingTable'
import { CardEditor } from './CardEditor'
import { DataFieldsEditor } from './DataFieldsEditor'
import { ComparisonView } from './ComparisonView'

type EditorState = { open: false } | { open: true; card?: Card }

export function CollectionView() {
  const active = useAppStore((s) => s.active)
  const close = useAppStore((s) => s.close)
  const exportActive = useAppStore((s) => s.exportActive)
  const remove = useAppStore((s) => s.remove)
  const updateActive = useAppStore((s) => s.updateActive)

  const [mode, setMode] = useState<'table' | 'compare'>('table')
  const [editor, setEditor] = useState<EditorState>({ open: false })
  const [showDataFields, setShowDataFields] = useState(false)

  if (!active) return null

  async function handleDeleteCard(id: string) {
    await updateActive((c) => removeCard(c, id))
  }

  async function handleDeleteCollection() {
    if (active && confirm(`Sammlung "${active.name}" wirklich löschen?`)) {
      await remove(active.name)
    }
  }

  if (mode === 'compare') {
    return <ComparisonView onExit={() => setMode('table')} />
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

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setEditor({ open: true })}
          className="rounded-lg bg-violet-600 px-4 py-2 font-medium text-white transition-colors hover:bg-violet-500"
        >
          + Karte hinzufügen
        </button>
        <button
          type="button"
          onClick={() => setMode('compare')}
          disabled={active.cards.length < 2}
          className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Vergleich starten
        </button>
        <button
          type="button"
          onClick={() => setShowDataFields(true)}
          className="rounded-lg border border-slate-700 px-4 py-2 font-medium text-slate-200 transition-colors hover:border-slate-500"
        >
          Datenfelder
        </button>
      </div>

      <RankingTable
        cards={active.cards}
        onEdit={(card) => setEditor({ open: true, card })}
        onDelete={handleDeleteCard}
      />

      {editor.open && (
        <CardEditor card={editor.card} onClose={() => setEditor({ open: false })} />
      )}
      {showDataFields && <DataFieldsEditor onClose={() => setShowDataFields(false)} />}
    </div>
  )
}
