import type { Card } from '../types'
import { tierColor } from '../lib/tiers'
import { AnimatedNumber } from './AnimatedNumber'

interface Props {
  card: Card
  rank?: number
  /** MMR-Wert weich hochzählen (für Match-Ergebnisse). */
  animate?: boolean
}

/** Visuelle Trading-Card – wiederverwendet in Vergleich und Bracket. */
export function CardFace({ card, rank, animate = false }: Props) {
  const color = tierColor(card.mmr)
  const dataEntries = Object.entries(card.dataValues).filter(([, v]) => v !== null && v !== '')

  return (
    <div
      className="flex h-[42rem] w-[30rem] shrink-0 flex-col overflow-hidden rounded-2xl border-4 shadow-xl"
      style={{ borderColor: color, backgroundColor: color, transition: 'background-color 0.6s, border-color 0.6s' }}
    >
      <div className="flex shrink-0 items-start justify-between gap-2 p-3">
        <span className="rounded-lg bg-white/85 px-3 py-1.5 text-2xl font-bold text-slate-900">
          {card.name}
        </span>
        <span className="flex flex-col items-center rounded-lg bg-white/85 px-2 py-1 text-slate-900">
          {rank !== undefined && <span className="text-lg font-bold leading-none">#{rank}</span>}
          <span className="text-xs font-medium">
            MMR {animate ? <AnimatedNumber value={card.mmr} /> : card.mmr}
          </span>
        </span>
      </div>

      <div
        className="mx-3 flex aspect-square shrink-0 items-center justify-center overflow-hidden rounded-lg"
        style={{ backgroundColor: color, transition: 'background-color 0.6s' }}
      >
        {card.image ? (
          <img src={card.image} alt={card.name} className="h-full w-full object-contain" />
        ) : (
          <span className="text-6xl opacity-40" aria-hidden="true">
            🃏
          </span>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3">
        {card.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {card.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-black/25 px-2 py-0.5 text-xs font-medium text-white"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        {dataEntries.length > 0 && (
          <dl className="rounded-lg bg-white/85 p-2 text-xs text-slate-900">
            {dataEntries.map(([key, value]) => (
              <div key={key} className="flex justify-between gap-2">
                <dt className="font-medium">{key}</dt>
                <dd>{String(value)}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  )
}
