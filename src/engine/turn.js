import { roll, shuffle, defaultRng } from './dice.js'

// Destiny phase: every value rolled more than once is discarded.
export function destinyFromValues(values) {
  const counts = {}
  for (const v of values) counts[v] = (counts[v] || 0) + 1
  const kept = values.filter((v) => counts[v] === 1)
  const discarded = values.filter((v) => counts[v] > 1)
  return { rolled: values, kept, discarded }
}

export function rollDestiny(count = 5, rng = defaultRng) {
  return destinyFromValues(Array.from({ length: count }, () => roll(6, rng)))
}

// Initiative: shuffle explorer and hostile cards together; on the first turn of an
// ambush, hostile groups go first, then explorers.
export function dealInitiative(explorers, hostileGroups, { ambush = false } = {}, rng = defaultRng) {
  const e = explorers.map((name) => ({ name, side: 'explorer' }))
  const h = hostileGroups.map((name) => ({ name, side: 'hostile' }))
  if (ambush) return [...shuffle(h, rng), ...shuffle(e, rng)]
  return shuffle([...e, ...h], rng)
}

export function inspirationResult(rollValue, slainWoundsTotal) {
  if (slainWoundsTotal <= 0) return { gained: false, reason: 'nothing slain' }
  if (slainWoundsTotal >= 20) return { gained: true, reason: 'automatic at 20+' }
  return { gained: rollValue <= slainWoundsTotal, reason: `${rollValue} vs ${slainWoundsTotal}` }
}

export function eventFor(rollValue, table) {
  return table.rows.find((r) => rollValue >= r.range[0] && rollValue <= r.range[1])
}
