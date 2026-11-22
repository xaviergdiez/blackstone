import { COLUMNS } from '../data/columns.js'
import { BASIC_ACTIONS } from '../data/actions.js'
import { EXPANSIONS } from '../data/hostiles.js'
import { bandLabel } from '../engine/behaviour.js'
import { Refs, StatusBadge, DiceCell } from './ui.jsx'

export function BehaviourTable({ hostile, activeColumn, activeRow, onPickColumn, compact }) {
  return (
    <div className="btable-wrap">
      <table className="btable" style={compact ? { minWidth: 0, fontSize: 14 } : undefined}>
        <caption>Behaviour table</caption>
        <thead>
          <tr>
            <th scope="col"><span className="col-name">Roll</span></th>
            {hostile.columns.map((id) => {
              const c = COLUMNS[id]
              const inner = (
                <>
                  <span className="col-name">{c.label}</span>
                  {!compact && <span className="col-cond">{c.condition}</span>}
                </>
              )
              return (
                <th key={id} scope="col" className={id === activeColumn ? 'col-on' : ''} title={c.condition}>
                  {onPickColumn ? <button type="button" onClick={() => onPickColumn(id)} aria-pressed={id === activeColumn}>{inner}</button> : inner}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {hostile.bands.map((_, row) => (
            <tr key={row} className={row === activeRow ? 'row-on' : ''}>
              <th scope="row">{bandLabel(hostile, row)}</th>
              {hostile.columns.map((id) => {
                const name = hostile.table[id][row]
                const unique = !BASIC_ACTIONS[name]
                const cls = [unique ? 'u' : '', id === activeColumn ? 'col-on' : '', id === activeColumn && row === activeRow ? 'hit' : ''].join(' ')
                return <td key={id} className={cls}>{name}</td>
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function HostileCard({ hostile, children, summary }) {
  if (hostile.status === 'pending' && !hostile.userMade) {
    return (
      <article className="card pending">
        <header className="card-head">
          <div style={{ flex: 1 }}>
            <div className="card-title">{hostile.name}</div>
            <div className="eyebrow">{EXPANSIONS[hostile.expansion]?.label}</div>
          </div>
          <StatusBadge hostile={hostile} />
        </header>
        <div className="card-body">
          <p className="rule-line small">The reference card for this hostile has not been transcribed yet, so the app has no behaviour table for it.</p>
          {hostile.encounterHint && <p className="rule-line small">{hostile.encounterHint}</p>}
          {(hostile.special || []).map((s) => (
            <p key={s.name} className="rule-line small"><b>{s.name}:</b> {s.text} <Refs refs={s.refs} /></p>
          ))}
          <div><Refs refs={hostile.refs} /></div>
          {children}
        </div>
      </article>
    )
  }
  return (
    <article className="card on-parch">
      <header className="card-head">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="card-title">{hostile.name}</div>
          <div className="eyebrow" style={{ color: '#9d95a6' }}>
            {EXPANSIONS[hostile.expansion]?.label}{hostile.variantLabel ? ` · ${hostile.variantLabel}` : ''}
          </div>
        </div>
        <StatusBadge hostile={hostile} />
      </header>
      <div className="card-body">
        <div className="statline">
          <div>Move: <b>{hostile.move}</b></div>
          <div>Wounds: <b>{hostile.wounds}</b></div>
          <div>Size: <b>{hostile.size}</b></div>
        </div>
        {!summary && hostile.weapons && hostile.weapons.length > 0 && (
          <div>
            <div className="card-section-title">Weapons</div>
            <table className="weapons">
              <thead><tr><th>Weapon</th><th>1</th><th>2-3</th><th>4+</th></tr></thead>
              <tbody>
                {hostile.weapons.map((w) => (
                  <tr key={w.name}>
                    <td>{w.name}</td>
                    <td><DiceCell value={w.r1} /></td>
                    <td><DiceCell value={w.r2} /></td>
                    <td><DiceCell value={w.r4} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {hostile.weapons.filter((w) => w.note).map((w) => <p key={w.name} className="rule-line small" style={{ marginTop: 6 }}>{w.note}</p>)}
          </div>
        )}
        {!summary && !hostile.weapons && hostile.status !== 'pending' && (
          <p className="note">Weapon profiles are not transcribed for this hostile; use the card.</p>
        )}
        {!summary && hostile.special && hostile.special.length > 0 && (
          <div className="stack" style={{ gap: 6 }}>
            <div className="card-section-title">Special rules</div>
            {hostile.special.map((s) => (
              <p key={s.name} className="rule-line"><b>{s.name}:</b> {s.text} <Refs refs={s.refs} /></p>
            ))}
          </div>
        )}
        <BehaviourTable hostile={hostile} compact={summary} />
        {!summary && hostile.unique && (
          <div className="stack" style={{ gap: 6 }}>
            <div className="card-section-title">Unique actions</div>
            {Object.entries(hostile.unique).map(([name, text]) => (
              <p key={name} className="rule-line"><b>{name}:</b> {text}</p>
            ))}
          </div>
        )}
        {!summary && (hostile.notes || []).map((n, i) => <p key={i} className="note">{n}</p>)}
        <div><Refs refs={hostile.refs} /></div>
        {children}
      </div>
    </article>
  )
}
