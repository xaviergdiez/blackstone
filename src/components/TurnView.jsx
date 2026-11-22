import { useState } from 'react'
import { EVENT_TABLES, NEMESIS_ACTIONS, NEMESIS_REFS } from '../data/tables.js'
import { rollDestiny, dealInitiative, eventFor } from '../engine/turn.js'
import { getHostile } from '../store.js'
import { D20, Refs, Seg, Stepper, useRoller } from './ui.jsx'

export function TurnView({ state, dispatch, settings, setSettings, custom }) {
  const { encounter } = state
  return (
    <section aria-labelledby="turn-title">
      <div className="page-head">
        <div>
          <h1 className="h1" id="turn-title">Combat turn</h1>
          <p>Destiny, initiative and event phase helpers, plus the counters that change hostile behaviour. <Refs refs={[{ src: 'CB', page: 7 }, { src: 'ESC', page: 24 }]} /></p>
        </div>
      </div>
      <div className="grid-2">
        <div className="stack" style={{ gap: 16 }}>
          <Destiny settings={settings} dispatch={dispatch} />
          <Initiative encounter={encounter} settings={settings} setSettings={setSettings} custom={custom} />
        </div>
        <div className="stack" style={{ gap: 16 }}>
          <Counters encounter={encounter} dispatch={dispatch} />
          {settings.hostilePlayer && <Nemesis encounter={encounter} dispatch={dispatch} />}
          <Events settings={settings} setSettings={setSettings} />
        </div>
      </div>
    </section>
  )
}

function Destiny({ settings, dispatch }) {
  const [res, setRes] = useState(null)
  const [sent, setSent] = useState(false)
  return (
    <div className="panel panel-pad stack">
      <div className="row-between">
        <h2 className="h2">1 · Destiny phase</h2>
        <Refs refs={[{ src: 'CB', page: 7 }, { src: 'JA' }]} />
      </div>
      <p className="small muted" style={{ margin: 0 }}>Roll five destiny dice. Every value that shows up more than once is discarded. Each explorer may spend up to two per turn.</p>
      <div className="row">
        <button type="button" className="btn btn-primary" onClick={() => { setRes(rollDestiny(5)); setSent(false) }}>Roll destiny dice</button>
      </div>
      {res && (
        <>
          <div className="dice-row" aria-live="polite">
            {res.rolled.map((v, i) => (
              <span key={i} className={`d6 ${res.discarded.includes(v) ? 'lost' : 'kept'}`} aria-label={`${v}${res.discarded.includes(v) ? ' discarded' : ''}`}>{v}</span>
            ))}
          </div>
          <p className="small" style={{ margin: 0 }}>
            Available: <b>{res.kept.length ? res.kept.join(', ') : 'none'}</b>
            {res.discarded.length > 0 && <> · Discarded: {res.discarded.join(', ')}</>}
          </p>
          {settings.hostilePlayer && res.discarded.length > 0 && (
            <button type="button" className="btn btn-danger btn-sm" disabled={sent} onClick={() => { dispatch({ type: 'nemesisAdd', values: res.discarded }); setSent(true) }}>
              {sent ? 'Sent to nemesis pool' : `Discarded become nemesis dice (${res.discarded.length})`}
            </button>
          )}
        </>
      )}
    </div>
  )
}

function Initiative({ encounter, settings, setSettings, custom }) {
  const [ambush, setAmbush] = useState(false)
  const [order, setOrder] = useState(null)
  const groups = encounter.groups.map((g) => g.name || getHostile(custom, g.hostileId, g.variant)?.name || g.hostileId)
  const setExplorer = (i, v) => {
    const explorers = settings.explorers.slice()
    explorers[i] = v
    setSettings({ explorers })
  }
  return (
    <div className="panel panel-pad stack">
      <div className="row-between">
        <h2 className="h2">2 · Initiative</h2>
        <Refs refs={[{ src: 'CB', page: 7 }, { src: 'JA', note: 'ambush order' }]} />
      </div>
      <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 1fr' }}>
        {settings.explorers.map((name, i) => (
          <input key={i} className="input" value={name} onChange={(e) => setExplorer(i, e.target.value)} aria-label={`Explorer ${i + 1} name`} />
        ))}
      </div>
      <div className="row-between">
        <span className="small muted">{groups.length ? `${groups.length} hostile group card(s) from the encounter` : 'Add hostile groups in Encounter first'}</span>
        <Seg label="Ambush" value={ambush} onChange={setAmbush} options={[{ value: false, label: 'Normal' }, { value: true, label: 'Ambush' }]} />
      </div>
      <button type="button" className="btn btn-primary" onClick={() => setOrder(dealInitiative(settings.explorers.filter(Boolean), groups, { ambush }))}>Deal initiative</button>
      {order && (
        <ol className="stack" style={{ gap: 6, margin: 0, paddingLeft: 22 }}>
          {order.map((c, i) => (
            <li key={i} style={{ color: c.side === 'hostile' ? 'var(--warp-lit)' : 'var(--bone)' }}>
              <span style={{ fontFamily: 'var(--display)', letterSpacing: '.06em', textTransform: 'uppercase' }}>{c.name}</span>
              <span className="small muted"> · {c.side}</span>
            </li>
          ))}
        </ol>
      )}
      <p className="small muted" style={{ margin: 0 }}>Then covering fire, then gambits. All covering fire happens before any gambit. <Refs refs={[{ src: 'DC' }, { src: 'CB', page: 8 }]} /></p>
    </div>
  )
}

function Counters({ encounter, dispatch }) {
  return (
    <div className="panel panel-pad stack">
      <h2 className="h2">Counters</h2>
      <div className="row-between">
        <span>Threat level <span className="small muted">(Spindle Drones, 0-3)</span> <Refs refs={[{ src: 'HRC' }]} /></span>
        <Stepper value={encounter.threat} onChange={(v) => dispatch({ type: 'threat', value: v })} min={0} max={3} label="threat level" />
      </div>
      <div className="row-between">
        <span>Menace level <span className="small muted">(Escalation, −N to reinforcement rolls)</span> <Refs refs={[{ src: 'ESC', page: 11 }]} /></span>
        <Stepper value={encounter.menace} onChange={(v) => dispatch({ type: 'menace', value: v })} min={0} max={4} label="menace level" />
      </div>
    </div>
  )
}

function Nemesis({ encounter, dispatch }) {
  const [add, setAdd] = useState(1)
  const pool = encounter.nemesis
  const best = pool.length ? Math.max(...pool) : 0
  return (
    <div className="panel panel-pad stack">
      <div className="row-between">
        <h2 className="h2">Nemesis dice</h2>
        <Refs refs={NEMESIS_REFS} />
      </div>
      <p className="small muted" style={{ margin: 0 }}>Destiny dice discarded in the destiny phase, spent by explorers, or unspent after the last activation go to the hostile player with the same value. Return them all at the start of the event phase.</p>
      <div className="dice-row">
        {pool.length === 0 && <span className="small muted">Pool empty</span>}
        {pool.map((v, i) => (
          <button key={i} type="button" className="d6 nemesis" onClick={() => dispatch({ type: 'nemesisSpend', index: i })} aria-label={`Spend nemesis dice ${v}`} title="Tap to spend">{v}</button>
        ))}
      </div>
      <div className="row">
        <Stepper value={add} onChange={setAdd} min={1} max={6} label="dice value" />
        <button type="button" className="btn btn-sm" onClick={() => dispatch({ type: 'nemesisAdd', values: [add] })}>Add spent destiny dice</button>
        {pool.length > 0 && <button type="button" className="btn btn-sm btn-ghost" onClick={() => dispatch({ type: 'nemesisClear' })}>Event phase: return all</button>}
      </div>
      <ul className="stack" style={{ gap: 6, margin: 0, padding: 0, listStyle: 'none' }}>
        {NEMESIS_ACTIONS.map((a) => (
          <li key={a.name} style={{ opacity: best >= a.cost || a.cost === 1 ? 1 : 0.45 }}>
            <span className="mono" style={{ color: 'var(--warp-lit)' }}>{a.cost}+</span>{' '}
            <b style={{ fontFamily: 'var(--display)', letterSpacing: '.05em', textTransform: 'uppercase', fontWeight: 500 }}>{a.name}</b>
            <span className="small"> · {a.text}{a.whenNot ? ` Not ${a.whenNot}.` : ''}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Events({ settings, setSettings }) {
  const [die, roll] = useRoller(20)
  const table = EVENT_TABLES[settings.eventTable] || EVENT_TABLES.core
  const ev = die.value != null && !die.rolling ? eventFor(die.value, table) : null
  return (
    <div className="panel panel-pad stack">
      <div className="row-between">
        <h2 className="h2">4 · Event phase</h2>
        <Refs refs={table.refs} />
      </div>
      <Seg label="Event table" value={settings.eventTable} onChange={(v) => setSettings({ eventTable: v })} options={[{ value: 'core', label: 'Core' }, { value: 'escalation', label: 'Escalation' }]} />
      <p className="small muted" style={{ margin: 0 }}>Only if the combat continues: not every explorer is out of action or in the escape chamber.</p>
      <div className="row" style={{ justifyContent: 'center' }}>
        <D20 value={die.value} rolling={die.rolling} onRoll={() => roll()} label="Event roll" />
      </div>
      {ev && (
        <div className="result" aria-live="polite">
          <div className="result-roll">Rolled {die.value} · {ev.range[0] === ev.range[1] ? ev.range[0] : `${ev.range[0]}-${ev.range[1]}`}</div>
          <div className="result-action">{ev.name}</div>
          <p>{ev.text}</p>
        </div>
      )}
      <details>
        <summary className="small muted" style={{ cursor: 'pointer' }}>Whole table</summary>
        <ul className="small" style={{ paddingLeft: 18, marginBottom: 0 }}>
          {table.rows.map((r) => (
            <li key={r.name}><span className="mono">{r.range[0] === r.range[1] ? r.range[0] : `${r.range[0]}-${r.range[1]}`}</span> <b>{r.name}</b>: {r.text}</li>
          ))}
        </ul>
      </details>
    </div>
  )
}
