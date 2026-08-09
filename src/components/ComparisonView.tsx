import { useEffect, useState } from 'react'
import type { Card } from '../types'
import { useAppStore } from '../store'
import { rankedCards } from '../lib/collection'
import { applyMatch } from '../lib/mutations'
import { CardFace } from './CardFace'
import { CardEditor } from './CardEditor'

interface Props {
  onExit: () => void
}

function pickPair(cards: readonly Card[]): [string, string] {
  const i = Math.floor(Math.random() * cards.length)
  let j = Math.floor(Math.random() * (cards.length - 1))
  if (j >= i) j++
  return [cards[i].id, cards[j].id]
}

export function ComparisonView({ onExit }: Props) {
  const active = useAppStore((s) => s.active)
  const updateActive = useAppStore((s) => s.updateActive)

  const [pairIds, setPairIds] = useState<[string, string] | null>(null)
  const [phase, setPhase] = useState<'choose' | 'result'>('choose')
  const [editingId, setEditingId] = useState<string | null>(null)

  const enoughCards = !!active && active.cards.length >= 2

  useEffect(() => {
    if (enoughCards && active && pairIds === null) {
      setPairIds(pickPair(active.cards))
    }
  }, [enoughCards, active, pairIds])

  if (!active) return null
  if (!enoughCards) {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <p className="text-slate-400">Für den Vergleich werden mindestens 2 Karten benötigt.</p>
        <button
          type="button"
          onClick={onExit}
          className="rounded-lg border border-slate-700 px-4 py-2 text-slate-200 hover:border-slate-500"
        >
          Zurück
        </button>
      </div>
    )
  }

  const ranked = rankedCards(active.cards)
  const rankOf = (id: string) => ranked.find((c) => c.id === id)?.rank
  const cardA = pairIds ? active.cards.find((c) => c.id === pairIds[0]) : undefined
  const cardB = pairIds ? active.cards.find((c) => c.id === pairIds[1]) : undefined

  function nextPair() {
    if (active) setPairIds(pickPair(active.cards))
    setPhase('choose')
  }

  async function chooseWinner(winnerId: string, loserId: string) {
    await updateActive((c) => applyMatch(c, winnerId, loserId))
    setPhase('result')
  }

  const editingCard = editingId ? active.cards.find((c) => c.id === editingId) : undefined

  function renderSide(card: Card, otherId: string) {
    return (
      <div className="flex flex-col items-center gap-3">
        <CardFace card={card} rank={rankOf(card.id)} animate={phase === 'result'} />
        {phase === 'choose' ? (
          <button
            type="button"
            onClick={() => chooseWinner(card.id, otherId)}
            className="w-full max-w-xs rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-emerald-500"
          >
            Diese Karte gewinnt
          </button>
        ) : (
          <span className="text-sm text-slate-500">MMR aktualisiert</span>
        )}
        <button
          type="button"
          onClick={() => setEditingId(card.id)}
          className="text-xs text-slate-500 hover:text-slate-300"
        >
          Bearbeiten
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Vergleich</h2>
        <button
          type="button"
          onClick={onExit}
          className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-200 hover:border-slate-500"
        >
          Zurück zur Sammlung
        </button>
      </div>

      {cardA && cardB && (
        <div className="flex flex-col items-center justify-center gap-6 sm:flex-row sm:items-start">
          {renderSide(cardA, cardB.id)}
          <span className="text-2xl font-bold text-red-500 sm:mt-24">VS</span>
          {renderSide(cardB, cardA.id)}
        </div>
      )}

      {phase === 'result' && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={nextPair}
            className="rounded-lg bg-violet-600 px-6 py-3 font-semibold text-white hover:bg-violet-500"
          >
            Nächstes Paar →
          </button>
        </div>
      )}

      {editingCard && <CardEditor card={editingCard} onClose={() => setEditingId(null)} />}
    </div>
  )
}
