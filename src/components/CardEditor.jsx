import { useMemo, useState } from 'react'
import { COLUMNS } from '../data/columns.js'
import { BASIC_ACTIONS } from '../data/actions.js'
import { STANDARD_BANDS, EXPANSIONS } from '../data/hostiles.js'
import { validateHostile } from '../engine/behaviour.js'
import { getHostile } from '../store.js'
import { Sheet, Seg, Stepper } from './ui.jsx'

const COLUMN_ORDER = ['bodyguard', 'hidden', 'engaged', 'inCover', 'close', 'protective', 'other']

function parseBands(text) {
  return text.split(',').map((s) => s.trim()).filter(Boolean).map((s) => {
    const [a, b] = s.split('-').map((n) => parseInt(n, 10))
    return [a, Number.isFinite(b) ? b : a]
  })
}

function parseUnique(text) {
  const out = {}
  for (const line of text.split('\n')) {
    const i = line.indexOf(':')
    if (i > 0) out[line.slice(0, i).trim()] = line.slice(i + 1).trim()
  }
  return out
}

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'hostile'

// Lets the table enter a hostile card the app does not have yet. Saved on this device only.
export function CardEditor({ id, custom, onSave, onClose }) {
  const base = id ? getHostile(custom, id) : null
  const ready = base && base.status !== 'pending'
  const [name, setName] = useState(base?.name || '')
  const [move, setMove] = useState(base?.move || 2)
  const [wounds, setWounds] = useState(base?.wounds || 2)
  const [size, setSize] = useState(base?.size || 'Small')
  const [columns, setColumns] = useState(ready ? base.columns : ['hidden', 'engaged', 'close', 'other'])
  const [bandsText, setBandsText] = useState((ready ? base.bands : STANDARD_BANDS).map(([a, b]) => (a === b ? `${a}` : `${a}-${b}`)).join(', '))
  const [table, setTable] = useState(ready ? JSON.parse(JSON.stringify(base.table)) : {})
  const [uniqueText, setUniqueText] = useState(ready && base.unique ? Object.entries(base.unique).map(([k, v]) => `${k}: ${v}`).join('\n') : '')
  const [notes, setNotes] = useState('')

  const bands = useMemo(() => parseBands(bandsText), [bandsText])
  const unique = useMemo(() => parseUnique(uniqueText), [uniqueText])
  const ordered = COLUMN_ORDER.filter((c) => columns.includes(c))
  const cell = (c, r) => (table[c] && table[c][r]) || ''
  const setCell = (c, r, v) => setTable((t) => {
    const col = (t[c] || []).slice()
    col[r] = v
    return { ...t, [c]: col }
  })

  const record = {
    id: base?.id || `custom-${slug(name)}`,
    name: name.trim() || 'Unnamed hostile',
    expansion: base?.expansion || 'custom',
    status: 'transcribed',
    userMade: true,
    move, wounds, size,
    bands,
    columns: ordered,
    table: Object.fromEntries(ordered.map((c) => [c, bands.map((_, r) => cell(c, r).trim())])),
    unique,
    special: base?.special || [],
    weapons: base?.weapons,
    notes: [...(notes.trim() ? [notes.trim()] : []), 'Transcribed by you; check against the card if a roll looks wrong.'],
    refs: [{ src: 'USER' }, ...((base?.refs || []).filter((r) => r.src !== 'USER'))],
  }
  const problems = validateHostile(record)
  const toggleCol = (c) => setColumns((cs) => (cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]))

  return (
    <Sheet title={base ? `Transcribe: ${base.name}` : 'New hostile card'} onClose={onClose} wide>
      <p className="small muted" style={{ margin: 0 }}>
        Copy the numbers and action names from your physical card. Unique actions go one per line as <span className="mono">Name: what it does</span>, in your own words. Saved on this device only{EXPANSIONS[record.expansion] ? ` under ${EXPANSIONS[record.expansion].label}` : ''}.
      </p>
      <div className="grid-2">
        <label className="field"><span>Name</span><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></label>
        <div className="row" style={{ alignItems: 'flex-end', gap: 16 }}>
          <span className="field"><span>Move</span><Stepper value={move} onChange={setMove} min={0} max={9} label="move" /></span>
          <span className="field"><span>Wounds</span><Stepper value={wounds} onChange={setWounds} min={1} max={40} label="wounds" /></span>
          <span className="field"><span>Size</span><Seg value={size} onChange={setSize} label="size" options={['Small', 'Large', 'Huge'].map((s) => ({ value: s, label: s }))} /></span>
        </div>
      </div>
      <div className="field">
        <span>Columns on the card (they are shown in card order)</span>
        <div className="row">
          {COLUMN_ORDER.map((c) => (
            <button key={c} type="button" className="chip" aria-pressed={columns.includes(c)} onClick={() => toggleCol(c)} title={COLUMNS[c].condition}>{COLUMNS[c].label}</button>
          ))}
        </div>
      </div>
      <label className="field"><span>Roll bands</span><input className="input mono" value={bandsText} onChange={(e) => setBandsText(e.target.value)} /></label>
      <datalist id="action-names">
        {[...Object.keys(BASIC_ACTIONS), ...Object.keys(unique)].map((a) => <option key={a} value={a} />)}
      </datalist>
      <div style={{ overflowX: 'auto' }}>
        <div className="edit-grid" style={{ gridTemplateColumns: `56px repeat(${ordered.length}, minmax(96px, 1fr))`, minWidth: 56 + ordered.length * 100 }}>
          <span className="hdr">Roll</span>
          {ordered.map((c) => <span key={c} className="hdr">{COLUMNS[c].label}</span>)}
          {bands.map(([a, b], r) => (
            <FragmentRow key={r} label={a === b ? `${a}` : `${a}-${b}`}>
              {ordered.map((c) => (
                <input key={c} list="action-names" value={cell(c, r)} onChange={(e) => setCell(c, r, e.target.value)} aria-label={`${COLUMNS[c].label} ${a}-${b}`} />
              ))}
            </FragmentRow>
          ))}
        </div>
      </div>
      <label className="field"><span>Unique actions</span><textarea className="input" value={uniqueText} onChange={(e) => setUniqueText(e.target.value)} placeholder={'Lurch: Charge, re-rolling failed attack rolls.'} /></label>
      <label className="field"><span>Notes (optional)</span><input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} /></label>
      {problems.length > 0 && <ul className="problems">{problems.slice(0, 8).map((p) => <li key={p}>{p}</li>)}</ul>}
      <div className="row">
        <button type="button" className="btn btn-primary" disabled={problems.length > 0} onClick={() => onSave(record)}>Save card</button>
        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
      </div>
    </Sheet>
  )
}

function FragmentRow({ label, children }) {
  return (
    <>
      <span className="hdr" style={{ alignSelf: 'center' }}>{label}</span>
      {children}
    </>
  )
}
