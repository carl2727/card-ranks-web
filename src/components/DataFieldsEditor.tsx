import { useState } from 'react'
import type { DataField, DataFieldType } from '../types'
import { MAX_DATA_FIELDS } from '../types'
import { useAppStore } from '../store'
import { withDataFields } from '../lib/mutations'
import { Modal } from './Modal'

const TYPES: DataFieldType[] = ['int', 'float', 'string']

interface Props {
  onClose: () => void
}

export function DataFieldsEditor({ onClose }: Props) {
  const active = useAppStore((s) => s.active)
  const updateActive = useAppStore((s) => s.updateActive)
  const [fields, setFields] = useState<DataField[]>(active?.dataFields ?? [])

  if (!active) return null

  function update(index: number, patch: Partial<DataField>) {
    setFields(fields.map((f, i) => (i === index ? { ...f, ...patch } : f)))
  }

  function addField() {
    if (fields.length >= MAX_DATA_FIELDS) return
    setFields([...fields, { name: '', type: 'int' }])
  }

  async function handleSave() {
    await updateActive((c) => withDataFields(c, fields))
    onClose()
  }

  return (
    <Modal title="Datenfelder" onClose={onClose}>
      <div className="flex flex-col gap-3">
        <p className="text-sm text-slate-400">
          Definiere bis zu {MAX_DATA_FIELDS} Felder pro Karte (z. B. Stärke, Kosten).
          Werte werden pro Karte im Editor gepflegt.
        </p>

        {fields.length === 0 && (
          <p className="rounded-lg border border-dashed border-slate-800 py-6 text-center text-sm text-slate-500">
            Noch keine Datenfelder.
          </p>
        )}

        {fields.map((field, index) => (
          <div key={index} className="flex gap-2">
            <input
              value={field.name}
              onChange={(e) => update(index, { name: e.target.value })}
              placeholder="Feldname"
              className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-violet-500"
            />
            <select
              value={field.type}
              onChange={(e) => update(index, { type: e.target.value as DataFieldType })}
              className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-white outline-none focus:border-violet-500"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setFields(fields.filter((_, i) => i !== index))}
              className="rounded-lg border border-slate-700 px-3 text-slate-400 hover:border-red-800 hover:text-red-400"
              aria-label="Feld entfernen"
            >
              ✕
            </button>
          </div>
        ))}

        <div className="flex justify-between gap-2 pt-1">
          <button
            type="button"
            onClick={addField}
            disabled={fields.length >= MAX_DATA_FIELDS}
            className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:border-slate-500 disabled:opacity-50"
          >
            + Feld
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 px-4 py-2 text-slate-200 hover:border-slate-500"
            >
              Abbrechen
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-violet-600 px-4 py-2 font-medium text-white hover:bg-violet-500"
            >
              Speichern
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
