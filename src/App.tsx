import { useEffect } from 'react'
import { useAppStore } from './store'
import { HomeView } from './components/HomeView'
import { CollectionView } from './components/CollectionView'

function App() {
  const ready = useAppStore((s) => s.ready)
  const active = useAppStore((s) => s.active)
  const refresh = useAppStore((s) => s.refresh)

  useEffect(() => {
    void refresh()
  }, [refresh])

  return (
    <div className="mx-auto min-h-svh w-full max-w-4xl px-4 py-8 sm:py-12">
      <header className="mb-8 flex items-baseline gap-3">
        <h1 className="text-2xl font-semibold text-white">Card Ranks</h1>
        <span className="text-sm text-slate-500">MMR-Karten-Ranking</span>
      </header>

      {!ready ? (
        <p className="text-center text-slate-500">Lädt…</p>
      ) : active ? (
        <CollectionView />
      ) : (
        <HomeView />
      )}
    </div>
  )
}

export default App
