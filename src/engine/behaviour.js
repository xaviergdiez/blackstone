import { COLUMNS } from '../data/columns.js'
import { BASIC_ACTIONS } from '../data/actions.js'
import { clamp } from './dice.js'

export function bandIndex(rollValue, bands) {
  const i = bands.findIndex(([lo, hi]) => rollValue >= lo && rollValue <= hi)
  if (i === -1) throw new Error(`Roll ${rollValue} is outside the table`)
  return i
}

export function bandLabel(hostile, i) {
  if (hostile.bandLabels) return hostile.bandLabels[i]
  const [lo, hi] = hostile.bands[i]
  return lo === hi ? String(lo) : `${lo}-${hi}`
}

// Leftmost column whose condition holds (Designers' Commentary, Nov 2018).
export function pickColumn(columnIds, situation) {
  for (const id of columnIds) {
    const col = COLUMNS[id]
    if (col && col.test(situation)) return id
  }
  return columnIds[columnIds.length - 1]
}

// Modifiers: [{ label, value }]. The final roll stays within 1..20.
export function modifiedRoll(raw, modifiers = []) {
  const total = modifiers.reduce((sum, m) => sum + (Number(m.value) || 0), 0)
  return { raw, total, final: clamp(raw + total, 1, 20) }
}

export function describeAction(hostile, name) {
  if (hostile.unique && hostile.unique[name]) {
    return { name, kind: 'special', text: hostile.unique[name], unique: true, refs: hostile.refs || [] }
  }
  const basic = BASIC_ACTIONS[name]
  if (basic) return { name, kind: basic.kind, text: basic.text, unique: false, refs: basic.refs }
  return { name, kind: 'special', text: 'Not described in this app. Check the card.', unique: true, refs: hostile.refs || [] }
}

export function resolveBehaviour(hostile, { raw, modifiers = [], columnId }) {
  const r = modifiedRoll(raw, modifiers)
  const row = bandIndex(r.final, hostile.bands)
  const column = columnId || hostile.columns[hostile.columns.length - 1]
  const name = hostile.table[column][row]
  return { ...r, row, column, band: bandLabel(hostile, row), action: describeAction(hostile, name) }
}

// Data integrity: used by the self-checks and by the card editor before saving.
export function validateHostile(h) {
  const problems = []
  if (h.status === 'pending') return problems
  if (!Array.isArray(h.bands) || !h.bands.length) problems.push('no bands')
  else {
    let expect = 1
    for (const [lo, hi] of h.bands) {
      if (lo !== expect) problems.push(`band starts at ${lo}, expected ${expect}`)
      if (hi < lo) problems.push(`band ${lo}-${hi} is reversed`)
      expect = hi + 1
    }
    if (expect !== 21) problems.push(`bands end at ${expect - 1}, expected 20`)
  }
  if (!Array.isArray(h.columns) || !h.columns.length) problems.push('no columns')
  for (const id of h.columns || []) {
    if (!COLUMNS[id]) problems.push(`unknown column ${id}`)
    const cells = h.table && h.table[id]
    if (!cells) { problems.push(`column ${id} has no cells`); continue }
    if (cells.length !== h.bands.length) problems.push(`column ${id} has ${cells.length} cells for ${h.bands.length} bands`)
    for (const name of cells) {
      if (!name) problems.push(`empty cell in ${id}`)
      else if (!BASIC_ACTIONS[name] && !(h.unique && h.unique[name])) problems.push(`action "${name}" in ${id} is not defined`)
    }
  }
  if (!(h.wounds > 0)) problems.push('wounds missing')
  if (!['Small', 'Large', 'Huge'].includes(h.size)) problems.push('size missing')
  return problems
}
