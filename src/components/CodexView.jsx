import { useState } from 'react'
import { EXPANSIONS } from '../data/hostiles.js'
import { COLUMNS } from '../data/columns.js'
import { resolveBehaviour } from '../engine/behaviour.js'
import { allHostiles, getHostile } from '../store.js'
import { HostileCard, BehaviourTable } from './HostileCard.jsx'
import { Sheet, D20, Icon, Refs, useRoller } from './ui.jsx'

export function CodexView({ custom, onTranscribe, onDeleteCustom }) {
  const [exp, setExp] = useState('all')
  const [open, setOpen] = useState(null)
  const list = allHostiles(custom).filter((h) => exp === 'all' || h.expansion === exp)
  const counts = allHostiles(custom).reduce((a, h) => ({ ...a, [h.status === 'pending' && !h.userMade ? 'pending' : 'ready']: (a[h.status === 'pending' && !h.userMade ? 'pending' : 'ready'] || 0) + 1 }), {})
  return (
    <section aria-labelledby="codex-title">
      <div className="page-head">
        <div>
          <h1 className="h1" id="codex-title">Hostiles</h1>
          <p>{counts.ready || 0} hostile cards ready, {counts.pending || 0} waiting to be transcribed from your cards. Tap a card for its full rules and a practice roll.</p>
        </div>
        <button type="button" className="btn" onClick={() => onTranscribe(null)}><Icon name="edit" /> New card</button>
      </div>
      <div className="row chips-scroll" style={{ marginBottom: 16 }}>
        <button type="button" className="chip" aria-pressed={exp === 'all'} onClick={() => setExp('all')}>All</button>
        {Object.entries(EXPANSIONS).map(([k, e]) => (
          <button key={k} type="button" className="chip" aria-pressed={exp === k} onClick={() => setExp(k)}>{e.label}</button>
        ))}
      </div>
      <div className="codex">
        {list.map((h) => (
          <button key={h.id} type="button" className="codex-item" onClick={() => setOpen(h.id)} aria-label={`${h.name} details`}>
            <HostileCard hostile={h} summary />
          </button>
        ))}
        {list.length === 0 && <p className="muted">No hostiles in this filter yet.</p>}
      </div>
      {open && <CodexSheet id={open} custom={custom} onClose={() => setOpen(null)} onTranscribe={onTranscribe} onDeleteCustom={onDeleteCustom} />}
    </section>
  )
}

function CodexSheet({ id, custom, onClose, onTranscribe, onDeleteCustom }) {
  const [variant, setVariant] = useState(null)
  const hostile = getHostile(custom, id, variant)
  const [col, setCol] = useState(null)
  const [die, roll] = useRoller(20)
  const pending = hostile.status === 'pending' && !hostile.userMade
  const column = col || (hostile.columns ? hostile.columns[hostile.columns.length - 1] : null)
  const res = !pending && die.value != null && !die.rolling ? resolveBehaviour(hostile, { raw: die.value, columnId: column }) : null
  return (
    <Sheet title={hostile.name} onClose={onClose} wide actions={
      <button type="button" className="btn btn-sm" onClick={() => { onClose(); onTranscribe(id) }}><Icon name="edit" /> {pending ? 'Transcribe' : 'Edit copy'}</button>
    }>
      {hostile.variants && (
        <div className="row">
          <button type="button" className="chip" aria-pressed={!variant} onClick={() => setVariant(null)}>Standard</button>
          {Object.entries(hostile.variants).map(([k, v]) => (
            <button key={k} type="button" className="chip" aria-pressed={variant === k} onClick={() => setVariant(k)}>{v.label}</button>
          ))}
        </div>
      )}
      <div className="grid-2">
        <HostileCard hostile={hostile}>
          {hostile.userMade && (
            <button type="button" className="btn btn-sm btn-danger" onClick={() => { onDeleteCustom(id); onClose() }}><Icon name="trash" /> Delete my transcription</button>
          )}
        </HostileCard>
        {!pending && (
          <div className="panel panel-pad stack">
            <h2 className="h2">Practice roll</h2>
            <div className="colpick">
              {hostile.columns.map((c) => (
                <button key={c} type="button" className="chip" aria-pressed={c === column} onClick={() => setCol(c)} title={COLUMNS[c].condition}>{COLUMNS[c].label}</button>
              ))}
            </div>
            <div className="row" style={{ justifyContent: 'center' }}>
              <D20 value={die.value} rolling={die.rolling} onRoll={() => roll()} />
            </div>
            {res && (
              <div className="result">
                <div className="result-roll">Rolled {res.final} · row {res.band} · {COLUMNS[res.column].label}</div>
                <div className="result-action">{res.action.name}</div>
                <p>{res.action.text}</p>
                <Refs refs={res.action.refs} />
              </div>
            )}
            <BehaviourTable hostile={hostile} activeColumn={column} activeRow={res ? res.row : null} onPickColumn={setCol} compact />
          </div>
        )}
      </div>
    </Sheet>
  )
}
