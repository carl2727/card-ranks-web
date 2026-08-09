import type { Card } from '../types'
import { rankedCards } from '../lib/collection'
import { tierColor } from '../lib/tiers'

interface Props {
  cards: Card[]
  onDelete: (id: string) => void
}

export function RankingTable({ cards, onDelete }: Props) {
  const ranked = rankedCards(cards)

  if (ranked.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-800 py-10 text-center text-slate-500">
        Noch keine Karten. Füge oben deine erste Karte hinzu.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-800">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-900/60 text-xs uppercase tracking-wider text-slate-400">
          <tr>
            <th className="px-4 py-3 w-16">Rang</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3 w-24 text-right">MMR</th>
            <th className="px-4 py-3">Tags</th>
            <th className="px-4 py-3 w-16"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {ranked.map((card) => (
            <tr key={card.id} className="hover:bg-slate-900/40">
              <td className="px-4 py-3 font-mono text-slate-400">#{card.rank}</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-2">
                  <span
                    className="inline-block h-3 w-3 rounded-full ring-1 ring-black/30"
                    style={{ backgroundColor: tierColor(card.mmr) }}
                    aria-hidden="true"
                  />
                  <span className="font-medium text-white">{card.name}</span>
                </span>
              </td>
              <td className="px-4 py-3 text-right font-mono text-slate-300">{card.mmr}</td>
              <td className="px-4 py-3 text-slate-400">
                {card.tags.length ? card.tags.join(' · ') : '—'}
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => onDelete(card.id)}
                  className="text-xs text-slate-500 transition-colors hover:text-red-400"
                  aria-label={`Karte ${card.name} löschen`}
                >
                  Löschen
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
