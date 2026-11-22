import { useMemo, useState } from 'react'
import { RULES, RULE_GROUPS } from '../data/rules.js'
import { SOURCES } from '../data/sources.js'
import { Refs, Icon } from './ui.jsx'

function textOf(body) {
  return body.flat().join(' ')
}

function Highlight({ text, q }) {
  if (!q) return text
  const i = text.toLowerCase().indexOf(q.toLowerCase())
  if (i === -1) return text
  return <>{text.slice(0, i)}<mark>{text.slice(i, i + q.length)}</mark>{text.slice(i + q.length)}</>
}

export function RulesView() {
  const [q, setQ] = useState('')
  const [group, setGroup] = useState('all')
  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return RULES.filter((r) => (group === 'all' || r.group === group) && (!needle || `${r.title} ${r.tags.join(' ')} ${textOf(r.body)}`.toLowerCase().includes(needle)))
  }, [q, group])
  const needle = q.trim()

  return (
    <section aria-labelledby="rules-title">
      <div className="page-head">
        <div>
          <h1 className="h1" id="rules-title">Rules reference</h1>
          <p>Hostile rules in plain words, each tagged with the book and page it summarises. Solid tags are Games Workshop sources; dashed tags are fan summaries.</p>
        </div>
      </div>
      <div className="stack" style={{ gap: 10, marginBottom: 16 }}>
        <label className="row" style={{ position: 'relative' }}>
          <span className="sr-only">Search rules</span>
          <span style={{ position: 'absolute', left: 12, width: 18, height: 18, color: 'var(--faint)' }}><Icon name="search" /></span>
          <input className="input" style={{ flex: 1, paddingLeft: 38 }} type="search" placeholder="Search: reinforcement, stunned, onslaught…" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <div className="row chips-scroll">
          <button type="button" className="chip" aria-pressed={group === 'all'} onClick={() => setGroup('all')}>All</button>
          {RULE_GROUPS.map((g) => (
            <button key={g.id} type="button" className="chip" aria-pressed={group === g.id} onClick={() => setGroup(g.id)}>{g.label}</button>
          ))}
        </div>
      </div>

      <div className="grid-2">
        <div className="panel">
          {list.length === 0 && <p className="rule muted">Nothing matches “{needle}”.</p>}
          {list.map((r) => (
            <article key={r.id} className="rule" id={`rule-${r.id}`}>
              <h3><Highlight text={r.title} q={needle} /></h3>
              {r.body.map((part, i) =>
                Array.isArray(part)
                  ? <ul key={i}>{part.map((li, j) => <li key={j}><Highlight text={li} q={needle} /></li>)}</ul>
                  : <p key={i}><Highlight text={part} q={needle} /></p>,
              )}
              <Refs refs={r.refs} />
            </article>
          ))}
        </div>
        <aside className="panel panel-pad stack">
          <h2 className="h2">Sources</h2>
          <ul className="stack" style={{ gap: 8, margin: 0, padding: 0, listStyle: 'none' }}>
            {Object.entries(SOURCES).filter(([k]) => k !== 'USER').map(([k, s]) => (
              <li key={k} className="small">
                <span className={`ref${s.official ? '' : ' unofficial'}`}>{s.short}</span>{' '}
                {s.title}{s.year ? `, ${s.year}` : ''}<span className="muted"> · {s.publisher}{s.official ? '' : ' · unofficial'}</span>
              </li>
            ))}
          </ul>
          <p className="small muted" style={{ margin: 0 }}>
            Rules text is paraphrased; nothing here replaces the books. Behaviour tables marked “Transcribed” come from the dire/blackstone data and have not been checked against a physical card in this app.
          </p>
        </aside>
      </div>
    </section>
  )
}
