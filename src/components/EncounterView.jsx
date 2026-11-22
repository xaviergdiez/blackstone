import { useState } from 'react'
import { EXPANSIONS } from '../data/hostiles.js'
import { damageOf, groupStats } from '../engine/encounter.js'
import { inspirationResult } from '../engine/turn.js'
import { getHostile, allHostiles } from '../store.js'
import { ActivationSheet } from './ActivationSheet.jsx'
import { HostileCard } from './HostileCard.jsx'
import { Sheet, Stepper, Refs, Icon, StatusBadge, D20, useRoller, ConfirmButton } from './ui.jsx'

const QUICK = [
  ['traitor-guardsmen', 6], ['negavolt-cultists', 4], ['ur-ghuls', 4], ['spindle-drones', 4],
  ['chaos-beastmen', 4], ['rogue-psyker', 2], ['chaos-space-marines', 2], ['obsidius-mallex', 1],
]

export function EncounterView({ state, dispatch, settings, custom, onTranscribe }) {
  const { encounter } = state
  const [adding, setAdding] = useState(false)
  const [activating, setActivating] = useState(null)
  const [inspiring, setInspiring] = useState(false)
  const groups = encounter.groups
  const commissarOnField = groups.some((g) => g.hostileId === 'traitor-commissar' && g.models.some((m) => !m.slain))
  const hasSpindles = groups.some((g) => getHostile(custom, g.hostileId, g.variant)?.usesThreat)

  const quickAdd = (id, count) => {
    const h = getHostile(custom, id)
    dispatch({ type: 'addGroup', hostileId: id, count, label: h.name })
  }

  const activeGroup = activating && groups.find((g) => g.id === activating)

  return (
    <section aria-labelledby="enc-title">
      <div className="page-head">
        <div>
          <h1 className="h1" id="enc-title">Encounter</h1>
          <p>Track hostile groups, then activate a group when its initiative card comes up. The app walks through reinforcements, picks the column and rolls the behaviour.</p>
        </div>
        <div className="row">
          {groups.length > 0 && <button type="button" className="btn" onClick={() => setInspiring(true)}>Inspiration roll</button>}
          {groups.length > 0 && <ConfirmButton className="btn btn-ghost" label="End combat" confirmLabel="Clear all groups?" onConfirm={() => dispatch({ type: 'endCombat' })} />}
          <button type="button" className="btn btn-primary" onClick={() => setAdding(true)}><Icon name="plus" /> Add group</button>
        </div>
      </div>

      {hasSpindles && (
        <div className="panel panel-pad row-between" style={{ marginBottom: 16 }}>
          <span><span className="h3">Spindle Drone threat level</span> <Refs refs={[{ src: 'HRC' }, { src: 'JA' }]} /></span>
          <Stepper value={encounter.threat} onChange={(v) => dispatch({ type: 'threat', value: v })} min={0} max={3} label="threat level" />
        </div>
      )}

      {groups.length === 0 ? (
        <div className="empty">
          <div className="h2">No hostiles on the battlefield</div>
          <p style={{ margin: 0, maxWidth: '46ch' }}>Add the groups from the encounter cards you drew. Quick add uses the core box model counts.</p>
          <div className="quick-add">
            {QUICK.map(([id, n]) => {
              const h = getHostile(custom, id)
              return <button key={id} type="button" className="btn" onClick={() => quickAdd(id, n)}>{n} × {h.name}</button>
            })}
          </div>
          <button type="button" className="btn btn-primary" onClick={() => setAdding(true)}>Choose any hostile</button>
        </div>
      ) : (
        <div className="stack" style={{ gap: 16 }}>
          {groups.map((g) => (
            <GroupPanel
              key={g.id}
              group={g}
              hostile={getHostile(custom, g.hostileId, g.variant)}
              commissarOnField={commissarOnField}
              dispatch={dispatch}
              onActivate={() => setActivating(g.id)}
              onTranscribe={onTranscribe}
            />
          ))}
        </div>
      )}

      {adding && <AddGroupSheet custom={custom} dispatch={dispatch} onClose={() => setAdding(false)} />}
      {activeGroup && (
        <ActivationSheet
          group={activeGroup}
          hostile={getHostile(custom, activeGroup.hostileId, activeGroup.variant)}
          encounter={encounter}
          settings={settings}
          dispatch={dispatch}
          commissarOnField={commissarOnField}
          onClose={() => setActivating(null)}
        />
      )}
      {inspiring && <InspirationSheet groups={groups} custom={custom} onClose={() => setInspiring(false)} />}

      {encounter.log.length > 0 && (
        <details className="panel panel-pad" style={{ marginTop: 16 }}>
          <summary className="h3" style={{ cursor: 'pointer' }}>Combat log ({encounter.log.length})</summary>
          <ul className="log" style={{ marginTop: 8 }}>
            {encounter.log.map((l, i) => <li key={i}>{new Date(l.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {l.text}</li>)}
          </ul>
        </details>
      )}
    </section>
  )
}

function GroupPanel({ group, hostile, commissarOnField, dispatch, onActivate, onTranscribe }) {
  if (!hostile) return null
  const pending = hostile.status === 'pending' && !hostile.userMade
  const stats = groupStats(group, hostile.wounds || 1)
  const canMotivate = hostile.id === 'traitor-guardsmen' && commissarOnField
  return (
    <article className="group" aria-label={hostile.name}>
      <header className="group-head">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="group-name">{group.name || hostile.name}</div>
          <div className="group-meta">
            {pending ? 'Card not transcribed' : `M${hostile.move} · W${hostile.wounds} · ${hostile.size}`} · {stats.alive}/{stats.total} standing
            {hostile.variantLabel ? ` · ${hostile.variantLabel}` : ''}
          </div>
        </div>
        {pending ? (
          <button type="button" className="btn btn-sm" onClick={() => onTranscribe(hostile.id)}><Icon name="edit" /> Transcribe</button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={onActivate} disabled={stats.alive === 0}><Icon name="play" /> Activate</button>
        )}
      </header>
      <div className="group-body">
        <div className="models">
          {group.models.map((m) => (
            <ModelTile key={m.id} model={m} group={group} hostile={hostile} dispatch={dispatch} canMotivate={canMotivate} pending={pending} />
          ))}
        </div>
        <div className="row-between">
          <div className="row">
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => dispatch({ type: 'addModel', groupId: group.id })}><Icon name="plus" /> Model</button>
            <StatusBadge hostile={hostile} />
          </div>
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => dispatch({ type: 'removeGroup', groupId: group.id })} aria-label={`Remove ${hostile.name} group`}><Icon name="trash" /> Remove</button>
        </div>
      </div>
    </article>
  )
}

function ModelTile({ model, group, hostile, dispatch, canMotivate, pending }) {
  const W = hostile.wounds || 0
  const dmg = damageOf(model)
  const send = (kind, delta) => dispatch({ type: 'damage', groupId: group.id, modelId: model.id, kind, delta, woundsValue: W })
  const toggle = (flag) => dispatch({ type: 'toggle', groupId: group.id, modelId: model.id, flag })
  const pips = []
  let left = model.grievous * 3
  for (let i = 0; i < Math.max(W, dmg); i++) {
    const cls = left > 0 ? 'g' : i < dmg ? 'w' : ''
    if (left > 0) left--
    pips.push(<span key={i} className={`pip ${cls}`} />)
  }
  return (
    <div className={`model${model.slain ? ' slain' : ''}${model.stunned ? ' stunned' : ''}`}>
      <div className="model-top">
        <span className="model-label">#{model.label}</span>
        <span className="mono small" title="damage / wounds">{pending ? `${dmg}` : `${dmg}/${W}`}</span>
      </div>
      {!pending && <div className="pips" aria-label={`${model.wounds} wounds, ${model.grievous} grievous`}>{pips}</div>}
      <div className="model-actions">
        <button type="button" className="mini w" onClick={() => send('wounds', 1)} aria-label="Add wound">+W</button>
        <button type="button" className="mini g" onClick={() => send('grievous', 1)} aria-label="Add grievous wound">+G</button>
        <button type="button" className="mini" onClick={() => (model.grievous > 0 && model.wounds === 0 ? send('grievous', -1) : send('wounds', -1))} aria-label="Remove a wound">−</button>
        <button type="button" className="mini" aria-pressed={model.slain} onClick={() => toggle('slain')} aria-label={model.slain ? 'Mark standing' : 'Mark slain'}>{model.slain ? 'Up' : 'Dead'}</button>
      </div>
      <div className="flags">
        <button type="button" className="mini" aria-pressed={model.stunned} onClick={() => toggle('stunned')} style={{ padding: '0 8px' }}>Stunned</button>
        {canMotivate && <button type="button" className="mini" aria-pressed={model.motivated} onClick={() => toggle('motivated')} style={{ padding: '0 8px' }}>+2 Motiv.</button>}
        {hostile.id === 'rogue-psyker' && <button type="button" className="mini" aria-pressed={model.empowered} onClick={() => toggle('empowered')} style={{ padding: '0 8px' }}>Empowered</button>}
      </div>
    </div>
  )
}

function AddGroupSheet({ custom, dispatch, onClose }) {
  const list = allHostiles(custom)
  const [id, setId] = useState(list[0].id)
  const [count, setCount] = useState(4)
  const [variant, setVariant] = useState(null)
  const hostile = getHostile(custom, id, variant)
  const byExp = Object.keys(EXPANSIONS).map((k) => [k, list.filter((h) => h.expansion === k)]).filter(([, l]) => l.length)
  return (
    <Sheet title="Add hostile group" onClose={onClose} wide>
      <div className="grid-2">
        <div className="stack">
          {byExp.map(([k, l]) => (
            <div key={k} className="stack" style={{ gap: 6 }}>
              <span className="eyebrow">{EXPANSIONS[k].label}</span>
              <div className="row">
                {l.map((h) => (
                  <button key={h.id} type="button" className="chip" aria-pressed={h.id === id} onClick={() => { setId(h.id); setVariant(null); setCount(h.defaultCount ? h.defaultCount : h.size === 'Huge' ? 1 : h.id === 'traitor-guardsmen' ? 6 : h.size === 'Large' ? 2 : 4) }}>
                    {h.name}{h.status === 'pending' && !h.userMade ? ' ·' : ''}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <hr className="divider" />
          <div className="row-between">
            <span className="field"><span>Models in group</span></span>
            <Stepper value={count} onChange={setCount} min={1} max={14} label="models" />
          </div>
          {hostile.variants && (
            <div className="row">
              {Object.entries(hostile.variants).map(([key, v]) => (
                <button key={key} type="button" className="chip" aria-pressed={variant === key} onClick={() => setVariant(variant === key ? null : key)}>{v.label}</button>
              ))}
            </div>
          )}
          <button type="button" className="btn btn-primary" onClick={() => { dispatch({ type: 'addGroup', hostileId: id, count, variant, label: hostile.name }); onClose() }}>
            Add {count} × {hostile.name}
          </button>
        </div>
        <HostileCard hostile={hostile} summary />
      </div>
    </Sheet>
  )
}

function InspirationSheet({ groups, custom, onClose }) {
  const slain = groups.flatMap((g) => {
    const h = getHostile(custom, g.hostileId, g.variant)
    return g.models.filter((m) => m.slain).map((m) => ({ key: m.id, label: `${h.name} ${m.label}`, wounds: h.wounds || 0 }))
  })
  const [picked, setPicked] = useState({})
  const [die, roll] = useRoller(20)
  const total = slain.filter((s) => picked[s.key]).reduce((a, s) => a + s.wounds, 0)
  const res = die.value != null && !die.rolling ? inspirationResult(die.value, total) : null
  return (
    <Sheet title="Inspiration roll" onClose={onClose}>
      <p style={{ margin: 0 }}>Tick the hostiles this explorer slew during their activation (not on overwatch). <Refs refs={[{ src: 'CB', page: 10 }, { src: 'OOG' }]} /></p>
      {slain.length === 0 ? <p className="muted">No hostiles are marked slain.</p> : (
        <div className="row">
          {slain.map((s) => (
            <button key={s.key} type="button" className="chip" aria-pressed={!!picked[s.key]} onClick={() => setPicked((p) => ({ ...p, [s.key]: !p[s.key] }))}>
              {s.label} · W{s.wounds}
            </button>
          ))}
        </div>
      )}
      <div className="row-between">
        <span>Combined Wounds: <b className="mono">{total}</b></span>
        <D20 value={die.value} rolling={die.rolling} onRoll={() => roll()} size={96} label="Inspiration roll" />
      </div>
      {res && (
        <div className="result">
          <div className="result-action">{res.gained ? '+1 inspiration' : 'No inspiration'}</div>
          <p className="small">{res.reason}. Explorers hold at most 4 points.</p>
        </div>
      )}
    </Sheet>
  )
}
