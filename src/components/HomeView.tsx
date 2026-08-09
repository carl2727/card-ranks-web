import { useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useAppStore } from '../store'
import { readCollectionFile } from '../lib/serialize'

export function HomeView() {
  const names = useAppStore((s) => s.names)
  const create = useAppStore((s) => s.create)
  const open = useAppStore((s) => s.open)
  const remove = useAppStore((s) => s.remove)
  const importCollection = useAppStore((s) => s.importCollection)

  const [newName, setNewName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    const result = await create(newName)
    if (result.ok) {
      setNewName('')
      setError(null)
    } else {
      setError(result.error ?? 'Could not create collection.')
    }
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const parsed = await readCollectionFile(file)
    if (!parsed.ok) {
      setError(parsed.error)
      return
    }
    const result = await importCollection(parsed.collection)
    setError(result.ok ? null : (result.error ?? 'Import failed.'))
  }

  async function handleDelete(name: string) {
    if (confirm(`Delete collection "${name}"?`)) {
      await remove(name)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          New collection
        </h2>
        <form onSubmit={handleCreate} className="flex flex-wrap gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Collection name"
            className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-violet-500"
          />
          <button
            type="submit"
            className="rounded-lg bg-violet-600 px-4 py-2 font-medium text-white transition-colors hover:bg-violet-500"
          >
            Create
          </button>
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="rounded-lg border border-slate-700 px-4 py-2 font-medium text-slate-200 transition-colors hover:border-slate-500"
          >
            Import JSON
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            onChange={handleImport}
            className="hidden"
          />
        </form>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Your collections
        </h2>
        {names.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-800 py-10 text-center text-slate-500">
            No collections yet. Create one above or import a JSON file.
          </p>
        ) : (
          <ul className="divide-y divide-slate-800 overflow-hidden rounded-lg border border-slate-800">
            {names.map((name) => (
              <li
                key={name}
                className="flex items-center justify-between gap-2 px-4 py-3 hover:bg-slate-900/40"
              >
                <button
                  type="button"
                  onClick={() => open(name)}
                  className="flex-1 text-left font-medium text-white hover:text-violet-300"
                >
                  {name}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(name)}
                  className="text-xs text-slate-500 transition-colors hover:text-red-400"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
