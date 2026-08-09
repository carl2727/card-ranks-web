import { tierForMmr, TIERS } from './lib/tiers'
import { updateRatings } from './lib/mmr'
import { DEFAULT_MMR } from './types'

function App() {
  // Kleiner Live-Beleg, dass die portierte MMR-Logik greift.
  const demo = updateRatings(DEFAULT_MMR, DEFAULT_MMR)

  return (
    <div className="mx-auto flex min-h-svh max-w-3xl flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <div>
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-violet-400">
          Setup erfolgreich
        </p>
        <h1 className="text-4xl font-semibold text-white sm:text-5xl">Card Ranks Web</h1>
        <p className="mt-4 text-slate-400">
          MMR-basiertes Karten-Ranking im Browser. Grundgerüst steht – React, Vite,
          TypeScript und Tailwind laufen.
        </p>
      </div>

      <div className="w-full rounded-xl border border-slate-800 bg-slate-900/60 p-5 text-left">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Selbsttest der portierten Logik
        </h2>
        <p className="font-mono text-sm text-slate-300">
          Zwei 1500er-Karten, linke gewinnt → Gewinner {demo.winner}, Verlierer {demo.loser}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {TIERS.map((t) => (
          <span
            key={t.name}
            className="rounded-full px-3 py-1 text-xs font-semibold text-black/80"
            style={{ backgroundColor: t.color }}
          >
            {t.name} · ≥{t.min}
          </span>
        ))}
      </div>

      <p className="text-xs text-slate-500">
        Aktuelles Tier bei MMR 1700: <strong>{tierForMmr(1700).name}</strong>
      </p>
    </div>
  )
}

export default App
