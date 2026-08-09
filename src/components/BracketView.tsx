import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Card } from '../types'
import { useAppStore } from '../store'
import { bracketSize, roundName, seedParticipants } from '../lib/bracket'
import { applyMatch } from '../lib/mutations'
import { CardFace } from './CardFace'
import { CardEditor } from './CardEditor'

interface Props {
  onExit: () => void
}

export function BracketView({ onExit }: Props) {
  const active = useAppStore((s) => s.active)
  const updateActive = useAppStore((s) => s.updateActive)

  const [participants, setParticipants] = useState<string[]>([])
  const [winners, setWinners] = useState<string[]>([])
  const [matchIndex, setMatchIndex] = useState(0)
  const [roundNumber, setRoundNumber] = useState(1)
  const [phase, setPhase] = useState<'choose' | 'result'>('choose')
  const [champion, setChampion] = useState<string | null>(null)
  const [started, setStarted] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  function start() {
    if (!active) return
    const size = bracketSize(active.cards.length)
    setParticipants(seedParticipants(active.cards, size))
    setWinners([])
    setMatchIndex(0)
    setRoundNumber(1)
    setPhase('choose')
    setChampion(null)
    setStarted(true)
  }

  useEffect(() => {
    if (active && !started && active.cards.length >= 2) start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, started])

  const totalMatches = participants.length / 2
  const cardById = (id: string): Card | undefined => active?.cards.find((c) => c.id === id)
  const cardA = participants[matchIndex * 2] ? cardById(participants[matchIndex * 2]) : undefined
  const cardB = participants[matchIndex * 2 + 1]
    ? cardById(participants[matchIndex * 2 + 1])
    : undefined

  async function chooseWinner(winnerId: string, loserId: string) {
    if (phase !== 'choose') return
    await updateActive((c) => applyMatch(c, winnerId, loserId))
    setWinners((prev) => [...prev, winnerId])
    setPhase('result')
  }

  const advance = useCallback(() => {
    const nextIndex = matchIndex + 1
    if (nextIndex < totalMatches) {
      setMatchIndex(nextIndex)
      setPhase('choose')
      return
    }
    if (winners.length === 1) {
      setChampion(winners[0])
      return
    }
    setParticipants(winners)
    setWinners([])
    setMatchIndex(0)
    setRoundNumber((r) => r + 1)
    setPhase('choose')
  }, [matchIndex, totalMatches, winners])

  // Tastatur-Shortcuts: ← / → wählen den Gewinner, Enter/Leer geht weiter.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (editingId) return
      if (phase === 'choose' && cardA && cardB) {
        if (e.key === 'ArrowLeft') void chooseWinner(cardA.id, cardB.id)
        if (e.key === 'ArrowRight') void chooseWinner(cardB.id, cardA.id)
      } else if (phase === 'result') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          advance()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, cardA, cardB, editingId, advance])

  if (!active) return null
  if (active.cards.length < 2) {
    return (
      <Centered onExit={onExit}>A bracket needs at least 2 cards.</Centered>
    )
  }

  const editingCard = editingId ? cardById(editingId) : undefined
  const championCard = champion ? cardById(champion) : undefined

  if (championCard) {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center justify-between self-stretch">
          <h2 className="text-lg font-semibold text-white">🏆 Winner</h2>
          <button
            type="button"
            onClick={onExit}
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-200 hover:border-slate-500"
          >
            Back to collection
          </button>
        </div>
        <CardFace card={championCard} rank={1} />
        <button
          type="button"
          onClick={start}
          className="rounded-lg bg-violet-600 px-6 py-3 font-semibold text-white hover:bg-violet-500"
        >
          New bracket
        </button>
      </div>
    )
  }

  function renderSide(card: Card, otherId: string) {
    return (
      <div className="flex flex-col items-center gap-3">
        <CardFace card={card} animate={phase === 'result'} />
        {phase === 'choose' ? (
          <button
            type="button"
            onClick={() => chooseWinner(card.id, otherId)}
            className="w-[30rem] max-w-full rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-emerald-500"
          >
            Advances
          </button>
        ) : (
          <span className="text-sm text-slate-500">—</span>
        )}
        <button
          type="button"
          onClick={() => setEditingId(card.id)}
          className="text-xs text-slate-500 hover:text-slate-300"
        >
          Edit
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Bracket · {roundName(participants.length)}
          </h2>
          <p className="text-sm text-slate-500">
            Round {roundNumber} · Match {matchIndex + 1} of {totalMatches}
          </p>
        </div>
        <button
          type="button"
          onClick={onExit}
          className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-200 hover:border-slate-500"
        >
          Cancel
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
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={advance}
            className="rounded-lg bg-violet-600 px-6 py-3 font-semibold text-white hover:bg-violet-500"
          >
            {matchIndex + 1 < totalMatches ? 'Next match →' : 'Next round →'}
          </button>
          <span className="text-xs text-slate-600">Tip: ← / → to choose, Enter to continue</span>
        </div>
      )}

      {editingCard && <CardEditor card={editingCard} onClose={() => setEditingId(null)} />}
    </div>
  )
}

function Centered({ children, onExit }: { children: ReactNode; onExit: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-10">
      <p className="text-slate-400">{children}</p>
      <button
        type="button"
        onClick={onExit}
        className="rounded-lg border border-slate-700 px-4 py-2 text-slate-200 hover:border-slate-500"
      >
        Back
      </button>
    </div>
  )
}
