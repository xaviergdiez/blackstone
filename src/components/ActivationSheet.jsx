import { useMemo, useState } from 'react'
import { COLUMNS, SITUATION_DEFAULT } from '../data/columns.js'
import { ACTION_KIND_LABEL } from '../data/actions.js'
import { REINFORCEMENTS } from '../data/tables.js'
import { pickColumn, resolveBehaviour } from '../engine/behaviour.js'
import { reinforcementResult } from '../engine/reinforce.js'
import { groupStats } from '../engine/encounter.js'
import { BehaviourTable } from './HostileCard.jsx'
import { Sheet, D20, Seg, Stepper, Refs, useRoller } from './ui.jsx'

const YES_NO = [{ value: true, label: 'Yes' }, { value: false, label: 'No' }]
const RANGES = [{ value: 1, label: '1' }, { value: 2, label: '2-3' }, { value: 4, label: '4+' }]

export function ActivationSheet({ group, hostile, encounter, settings, dispatch, commissarOnField, onClose }) {
  const stats = groupStats(group, hostile.wounds)
  const [phase, setPhase] = useState(stats.slain > 0 ? 'reinforce' : 'activate')
  const title = `Activate ${group.name || hostile.name}`
  return (
    <Sheet title={title} onClose={onClose} wide>
      <div className="row">
        <button type="button" className="chip" aria-pressed={phase === 'reinforce'} onClick={() => setPhase('reinforce')}>1 · Reinforcements</button>
        <button type="button" className="chip" aria-pressed={phase === 'activate'} onClick={() => setPhase('activate')}>2 · Behaviour</button>
        <Refs refs={[{ src: 'CB', page: 13 }]} />
      </div>
      {phase === 'reinforce' ? (
        <Reinforce
          group={group} hostile={hostile} stats={stats} encounter={encounter} settings={settings}
          dispatch={dispatch} commissarOnField={commissarOnField} onDone={() => setPhase('activate')}
        />
      ) : (
        <Activate group={group} hostile={hostile} encounter={encounter} settings={settings} dispatch={dispatch} onClose={onClose} />
      )}
    </Sheet>
  )
}

function Reinforce({ group, hostile, stats, encounter, settings, dispatch, commissarOnField, onDone }) {
  const [die, roll] = useRoller(20)
  const [whispers, setWhispers] = useState(0)
  const [applied, setApplied] = useState(false)
  const result = die.value != null && !die.rolling
    ? reinforcementResult(die.value, hostile.size, stats.slain, { menace: encounter.menace, tenacious: !!hostile.tenacious, whispers })
    : null
  const commissarReroll = hostile.id === 'traitor-guardsmen' && commissarOnField

  if (stats.slain === 0) {
    return (
      <div className="stack">
        <p>No hostiles from this group have been slain, so there is no reinforcement roll.</p>
        <button type="button" className="btn btn-primary" onClick={onDone}>Go to behaviour</button>
      </div>
    )
  }

  return (
    <div className="grid-2">
      <div className="stack">
        <p style={{ margin: 0 }}>
          <b>{stats.slain}</b> slain. Roll the Blackstone dice on the <b>{hostile.size}</b> column
          {encounter.menace > 0 && <> (menace −{encounter.menace}, minimum 1)</>}
          {hostile.tenacious && <> (Tenacious: returns on 1-3)</>}.
        </p>
        <div className="row" style={{ justifyContent: 'center' }}>
          <D20 value={die.value} rolling={die.rolling} onRoll={() => { setApplied(false); roll() }} label="Reinforcement roll" />
        </div>
        {settings.hostilePlayer && (
          <label className="row-between">
            <span className="small muted">Fortress Whispers (nemesis)</span>
            <Stepper value={whispers} onChange={setWhispers} min={-12} max={12} label="whispers modifier" format={(v) => (v > 0 ? `+${v}` : v)} />
          </label>
        )}
        {result && (
          <div className="result" aria-live="polite">
            <div className="result-roll">Rolled {result.raw}{result.steps.length ? ` → ${result.value} (${result.steps.join(', ')})` : ''}</div>
            <div className="result-action">{result.returning > 0 ? `${result.returning} return` : 'None return'}</div>
            {result.returning > 0 ? (
              <>
                <p>Deploy each next to a portal, as close as possible to a hostile from this group (or to an explorer if none is left). Each then attacks the closest visible explorer in range, or moves towards the closest explorer if it sees none. This is not their activation.</p>
                <button type="button" className="btn btn-primary" disabled={applied} onClick={() => { dispatch({ type: 'returnModels', groupId: group.id, count: result.returning }); setApplied(true) }}>
                  {applied ? 'Returned' : `Bring back ${result.returning}`}
                </button>
              </>
            ) : (
              commissarReroll && <p>The Traitor Commissar is on the battlefield: re-roll this failed roll.</p>
            )}
          </div>
        )}
        <button type="button" className="btn" onClick={onDone}>Continue to behaviour</button>
      </div>
      <div className="panel panel-pad stack small">
        <div className="h3">Reinforcement table</div>
        <table className="weapons" style={{ color: 'var(--bone)' }}>
          <thead><tr><th>Roll</th><th>Small</th><th>Large</th><th>Huge</th></tr></thead>
          <tbody>
            {REINFORCEMENTS.bands.map(([lo, hi], i) => (
              <tr key={i} style={result && result.value >= lo && result.value <= hi ? { background: 'rgba(164,107,214,.25)' } : undefined}>
                <td>{lo === hi ? lo : `${lo}+`}</td>
                <td>{REINFORCEMENTS.Small[i] || '-'}</td>
                <td>{REINFORCEMENTS.Large[i] || '-'}</td>
                <td>{REINFORCEMENTS.Huge[i] || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="muted" style={{ margin: 0 }}>{REINFORCEMENTS.note}</p>
        <Refs refs={REINFORCEMENTS.refs} />
      </div>
    </div>
  )
}

function Activate({ group, hostile, encounter, settings, dispatch, onClose }) {
  const queue = group.models.filter((m) => !m.slain)
  const [index, setIndex] = useState(0)
  const [done, setDone] = useState({})
  const [situation, setSituation] = useState(SITUATION_DEFAULT)
  const [override, setOverride] = useState(null)
  const [whispers, setWhispers] = useState(0)
  const [results, setResults] = useState([])
  const [die, roll] = useRoller(20)
  const actionsPer = hostile.actionsPerActivation || 1

  const model = queue[Math.min(index, queue.length - 1)]
  const auto = useMemo(() => pickColumn(hostile.columns, situation), [hostile.columns, situation])
  const column = override || auto
  const has = (id) => hostile.columns.includes(id)
  const set = (patch) => { setSituation((s) => ({ ...s, ...patch })); setOverride(null) }

  if (!model) {
    return (
      <div className="stack">
        <p>Every hostile in this group is slain. Nothing left to activate.</p>
        <button type="button" className="btn" onClick={onClose}>Close</button>
      </div>
    )
  }

  const modifiers = []
  if (model.motivated) modifiers.push({ label: 'Motivated', value: 2 })
  if (whispers) modifiers.push({ label: 'Fortress Whispers', value: whispers })

  const doRoll = () => {
    roll((v) => {
      const r = resolveBehaviour(hostile, { raw: v, modifiers, columnId: column })
      setResults((prev) => [...prev, r].slice(-actionsPer))
      dispatch({ type: 'log', text: `${hostile.name} ${model.label}: ${r.final} → ${r.action.name} (${COLUMNS[r.column].label})` })
    })
  }

  const next = () => {
    setDone((d) => ({ ...d, [model.id]: true }))
    setResults([])
    setWhispers(0)
    setOverride(null)
    if (index < queue.length - 1) setIndex(index + 1)
    else onClose()
  }

  const latest = results[results.length - 1]
  const needMore = results.length < actionsPer

  return (
    <div className="stack">
      <div className="row-between">
        <div className="queue" role="list" aria-label="Activation order">
          {queue.map((m, i) => (
            <button key={m.id} type="button" role="listitem" aria-current={i === index ? 'step' : undefined} className={done[m.id] ? 'done' : ''} onClick={() => { setIndex(i); setResults([]) }}>
              {m.label}
            </button>
          ))}
        </div>
        <span className="small muted">
          {settings.hostilePlayer ? 'Hostile player picks the order' : 'Closest to an explorer first'}
        </span>
      </div>

      {model.stunned ? (
        <div className="result">
          <div className="kind">Stunned</div>
          <div className="result-action">Stands up</div>
          <p>A stunned hostile stands up instead of rolling on its behaviour table, and is no longer stunned.</p>
          <Refs refs={[{ src: 'CB' }, { src: 'OOG' }]} />
          <button type="button" className="btn btn-primary" onClick={() => { dispatch({ type: 'set', groupId: group.id, modelId: model.id, patch: { stunned: false } }); next() }}>
            Stand up · next
          </button>
        </div>
      ) : (
        <div className="grid-2">
          <div className="panel panel-pad">
            <div className="h3" style={{ marginBottom: 4 }}>{hostile.name} {model.label} · situation</div>
            <div className="question">
              <span className="q">Can it see an explorer?<small>Line of sight to at least one</small></span>
              <Seg options={YES_NO} value={situation.sees} onChange={(v) => set({ sees: v })} label="Sees an explorer" />
            </div>
            {situation.sees ? (
              <>
                <div className="question">
                  <span className="q">Adjacent to a visible explorer?</span>
                  <Seg options={YES_NO} value={situation.adjacent} onChange={(v) => set({ adjacent: v, range: v ? 1 : situation.range === 1 ? 2 : situation.range })} label="Adjacent" />
                </div>
                {has('inCover') && (
                  <div className="question">
                    <span className="q">In cover from every visible explorer?</span>
                    <Seg options={YES_NO} value={situation.inCover} onChange={(v) => set({ inCover: v })} label="In cover" />
                  </div>
                )}
                {has('close') && !situation.adjacent && (
                  <div className="question">
                    <span className="q">Hexes to the closest visible explorer</span>
                    <Seg options={RANGES.filter((r) => r.value !== 1)} value={situation.range === 3 ? 2 : situation.range} onChange={(v) => set({ range: v })} label="Range" />
                  </div>
                )}
              </>
            ) : (
              has('bodyguard') && (
                <div className="question">
                  <span className="q">Can it see the Traitor Commissar?</span>
                  <Seg options={YES_NO} value={situation.seesCommissar} onChange={(v) => set({ seesCommissar: v })} label="Sees Commissar" />
                </div>
              )
            )}
            {has('protective') && (
              <div className="question">
                <span className="q">Protective column applies?<small>Wording not transcribed, check your card</small></span>
                <Seg options={YES_NO} value={situation.protective} onChange={(v) => set({ protective: v })} label="Protective" />
              </div>
            )}
            <div className="stack" style={{ gap: 6, marginTop: 10 }}>
              <span className="eyebrow">Column · leftmost that applies <Refs refs={[{ src: 'DC' }]} /></span>
              <div className="colpick">
                {hostile.columns.map((id) => (
                  <button key={id} type="button" className="chip" aria-pressed={id === column} onClick={() => setOverride(id === auto ? null : id)} title={COLUMNS[id].condition}>
                    {COLUMNS[id].label}{id === auto ? ' ✓' : ''}
                  </button>
                ))}
              </div>
              <p className="small muted" style={{ margin: 0 }}>{COLUMNS[column].condition}{override ? ' (manual override)' : ''}</p>
            </div>
          </div>

          <div className="stack">
            {hostile.usesThreat && (
              <div className="panel panel-pad row-between">
                <span><span className="h3">Threat level</span><br /><span className="small muted">Check before Spindle Drones act</span></span>
                <Stepper value={encounter.threat} onChange={(v) => dispatch({ type: 'threat', value: v })} min={0} max={3} label="threat level" />
              </div>
            )}
            <div className="panel panel-pad stack" style={{ alignItems: 'center' }}>
              <div className="row" style={{ justifyContent: 'center' }}>
                {model.motivated && <span className="badge badge-user">Motivated +2</span>}
                {actionsPer > 1 && <span className="badge badge-transcribed">Action {Math.min(results.length + (needMore ? 1 : 0), actionsPer)} of {actionsPer}</span>}
              </div>
              <D20 value={die.value} rolling={die.rolling} onRoll={needMore ? doRoll : undefined} label="Behaviour roll" />
              {settings.hostilePlayer && (
                <label className="row-between" style={{ width: '100%' }}>
                  <span className="small muted">Fortress Whispers</span>
                  <Stepper value={whispers} onChange={setWhispers} min={-12} max={12} label="whispers modifier" format={(v) => (v > 0 ? `+${v}` : v)} />
                </label>
              )}
              {needMore ? (
                <button type="button" className="btn btn-primary btn-block" onClick={doRoll} disabled={die.rolling}>Roll behaviour</button>
              ) : (
                <button type="button" className="btn btn-primary btn-block" onClick={next}>{index < queue.length - 1 ? 'Next hostile' : 'Finish group'}</button>
              )}
            </div>
            {results.map((r, i) => (
              <div className="result" key={i} aria-live="polite">
                <div className="result-roll">
                  {actionsPer > 1 ? `Action ${i + 1} · ` : ''}Rolled {r.raw}{r.total ? ` ${r.total > 0 ? '+' : ''}${r.total} = ${r.final}` : ''} · row {r.band} · {COLUMNS[r.column].label}
                </div>
                <div className="kind">{ACTION_KIND_LABEL[r.action.kind] || 'Special'}{r.action.unique ? ' · unique action' : ''}</div>
                <div className="result-action">{r.action.name}</div>
                <p>{r.action.text}</p>
                {r.action.kind.includes('attack') && (
                  <p className="small muted">Its attack: success = 1 wound, critical = 1 grievous wound. Explorer in cover: critical = 1 wound, success misses{r.action.name === 'Aim' ? ' (Aim ignores cover)' : ''}.</p>
                )}
                <Refs refs={r.action.refs} />
              </div>
            ))}
          </div>
        </div>
      )}

      <BehaviourTable hostile={hostile} activeColumn={column} activeRow={latest ? latest.row : null} onPickColumn={(id) => setOverride(id === auto ? null : id)} />
    </div>
  )
}
