import type { Card } from '../types'
import { rankedCards } from '../lib/collection'
import { tierColor } from '../lib/tiers'

interface Props {
  cards: Card[]
  onEdit: (card: Card) => void
  onDelete: (id: string) => void
}

export function RankingTable({ cards, onEdit, onDelete }: Props) {
  const ranked = rankedCards(cards)

  if (ranked.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-800 py-10 text-center text-slate-500">
        No cards yet. Add your first card above.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-800">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-900/60 text-xs uppercase tracking-wider text-slate-400">
          <tr>
            <th className="w-14 px-4 py-3">Rank</th>
            <th className="w-12 px-2 py-3"></th>
            <th className="px-4 py-3">Name</th>
            <th className="w-24 px-4 py-3 text-right">MMR</th>
            <th className="px-4 py-3">Tags</th>
            <th className="w-28 px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {ranked.map((card) => (
            <tr key={card.id} className="hover:bg-slate-900/40">
              <td className="px-4 py-2 font-mono text-slate-400">#{card.rank}</td>
              <td className="px-2 py-2">
                <div
                  className="flex h-9 w-9 items-center justify-center overflow-hidden rounded ring-1 ring-black/30"
                  style={{ backgroundColor: tierColor(card.mmr) }}
                >
                  {card.image ? (
                    <img src={card.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs" aria-hidden="true">
                      🃏
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-2 font-medium text-white">{card.name}</td>
              <td className="px-4 py-2 text-right font-mono text-slate-300">{card.mmr}</td>
              <td className="px-4 py-2 text-slate-400">
                {card.tags.length ? card.tags.join(' · ') : '—'}
              </td>
              <td className="px-4 py-2 text-right">
                <button
                  type="button"
                  onClick={() => onEdit(card)}
                  className="text-xs text-slate-400 transition-colors hover:text-violet-300"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(card.id)}
                  className="ml-3 text-xs text-slate-500 transition-colors hover:text-red-400"
                  aria-label={`Delete card ${card.name}`}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
