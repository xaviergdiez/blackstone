import { useEffect, useRef, useState } from 'react'
import { SOURCES, refLabel, refTitle } from '../data/sources.js'

export function Refs({ refs }) {
  if (!refs || !refs.length) return null
  return (
    <span className="refs">
      {refs.map((r, i) => (
        <span key={i} className={`ref${SOURCES[r.src] && !SOURCES[r.src].official ? ' unofficial' : ''}`} title={refTitle(r)}>
          {refLabel(r)}
        </span>
      ))}
    </span>
  )
}

const STATUS = {
  verified: { cls: 'badge-verified', label: 'From card scan' },
  transcribed: { cls: 'badge-transcribed', label: 'Transcribed' },
  pending: { cls: 'badge-pending', label: 'Not transcribed' },
  user: { cls: 'badge-user', label: 'Your transcription' },
}

export function StatusBadge({ hostile }) {
  const key = hostile.userMade ? 'user' : hostile.status
  const s = STATUS[key] || STATUS.pending
  return <span className={`badge ${s.cls}`}>{s.label}</span>
}

export function Stepper({ value, onChange, min = -Infinity, max = Infinity, label, format }) {
  return (
    <span className="stepper" role="group" aria-label={label}>
      <button type="button" aria-label={`Decrease ${label}`} onClick={() => onChange(Math.max(min, value - 1))}>−</button>
      <output aria-live="polite">{format ? format(value) : value}</output>
      <button type="button" aria-label={`Increase ${label}`} onClick={() => onChange(Math.min(max, value + 1))}>+</button>
    </span>
  )
}

export function Seg({ options, value, onChange, label }) {
  return (
    <span className="seg" role="group" aria-label={label}>
      {options.map((o) => (
        <button type="button" key={String(o.value)} aria-pressed={o.value === value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </span>
  )
}

export function Sheet({ title, onClose, children, wide, actions }) {
  const ref = useRef(null)
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    ref.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])
  return (
    <div className="scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`sheet${wide ? ' wide' : ''}`} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={ref}>
        <div className="grab" aria-hidden="true" />
        <div className="sheet-head">
          <h2 className="h2">{title}</h2>
          {actions}
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="close" />
          </button>
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  )
}

export function D20({ value, rolling, onRoll, size = 120, label = 'Roll the Blackstone dice' }) {
  return (
    <button type="button" className={`d20${rolling ? ' rolling' : ''}`} style={{ width: size, height: size }} onClick={onRoll} aria-label={label}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <polygon points="50,4 93,28 93,72 50,96 7,72 7,28" fill="#141217" stroke="#a46bd6" strokeWidth="3" />
        <polygon points="50,18 80,66 20,66" fill="none" stroke="rgba(199,156,242,.55)" strokeWidth="2" />
        <path d="M50 4 50 18 M93 28 80 66 M7 28 20 66 M50 96 20 66 M50 96 80 66 M93 72 80 66 M7 72 20 66 M7 28 50 18 M93 28 50 18" stroke="rgba(199,156,242,.25)" strokeWidth="1.5" />
      </svg>
      <span className="face" aria-live="polite">{value ?? '20'}</span>
    </button>
  )
}

// Rolls with a short animation; the value is decided immediately and revealed after.
export function useRoller(sides = 20) {
  const [state, setState] = useState({ value: null, rolling: false })
  const roll = (cb) => {
    const v = 1 + Math.floor(Math.random() * sides)
    setState({ value: state.value, rolling: true })
    window.setTimeout(() => {
      setState({ value: v, rolling: false })
      cb && cb(v)
    }, 380)
    return v
  }
  return [state, roll, (v) => setState({ value: v, rolling: false })]
}

export function DieIcon({ type }) {
  if (type === 'd12') return (
    <svg className="die" viewBox="0 0 20 20" aria-label="twelve-sided action dice"><polygon points="10,1.5 18.5,7.7 15.3,17.7 4.7,17.7 1.5,7.7" fill="#7fb3e0" stroke="#2c4f70" strokeWidth="1.2" /></svg>
  )
  if (type === 'd8') return (
    <svg className="die" viewBox="0 0 20 20" aria-label="eight-sided action dice"><polygon points="10,2 18.5,17 1.5,17" fill="#b9a2e6" stroke="#4a3478" strokeWidth="1.2" /></svg>
  )
  if (type === 'd6') return (
    <svg className="die" viewBox="0 0 20 20" aria-label="six-sided action dice"><rect x="2.5" y="2.5" width="15" height="15" rx="2" fill="#f4f1ea" stroke="#6b6470" strokeWidth="1.2" /></svg>
  )
  return null
}

export function DiceCell({ value }) {
  if (value === 'na' || value == null) return <span>na</span>
  if (typeof value === 'string') return <span className="small">{value}</span>
  return <span>{value.map((d, i) => <DieIcon key={i} type={d} />)}</span>
}

const PATHS = {
  close: 'M6 6l12 12M18 6L6 18',
  swords: 'M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2M9.5 6.5L21 18v3h-3L6.5 9.5M11 5l-6 6M8 8L4 4M5 3L3 5',
  book: 'M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5V4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5z',
  skull: 'M12 2a8 8 0 00-8 8c0 3 1.5 5 3 6v3h10v-3c1.5-1 3-3 3-6a8 8 0 00-8-8zM9 11.5a1.5 1.5 0 100 .01M15 11.5a1.5 1.5 0 100 .01M10 19v3M14 19v3',
  hourglass: 'M6 2h12M6 22h12M7 2c0 6 10 6 10 10S7 16 7 22M17 2c0 6-10 6-10 10s10 4 10 10',
  plus: 'M12 5v14M5 12h14',
  gear: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z',
  trash: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
  edit: 'M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z',
  search: 'M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3',
  play: 'M6 4l14 8-14 8z',
}

export function Icon({ name }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  )
}

export function Toast({ text, onDone }) {
  useEffect(() => {
    const t = window.setTimeout(onDone, 2200)
    return () => window.clearTimeout(t)
  }, [text, onDone])
  return <div className="toast" role="status">{text}</div>
}

// Two-tap confirmation; window.confirm is blocked in sandboxed frames.
export function ConfirmButton({ className = 'btn', label, confirmLabel = 'Tap again to confirm', onConfirm }) {
  const [armed, setArmed] = useState(false)
  useEffect(() => {
    if (!armed) return undefined
    const t = window.setTimeout(() => setArmed(false), 3000)
    return () => window.clearTimeout(t)
  }, [armed])
  return (
    <button type="button" className={`${className}${armed ? ' btn-danger' : ''}`} onClick={() => (armed ? (setArmed(false), onConfirm()) : setArmed(true))}>
      {armed ? confirmLabel : label}
    </button>
  )
}
