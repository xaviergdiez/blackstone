import { REINFORCEMENTS } from '../data/tables.js'
import { bandIndex } from './behaviour.js'
import { clamp } from './dice.js'

const SIZE_ORDER = { Small: 0, Large: 1, Huge: 2 }

export function smallestSize(sizes) {
  return sizes.slice().sort((a, b) => SIZE_ORDER[a] - SIZE_ORDER[b])[0]
}

// opts: { menace = 0, tenacious = false, whispers = 0 }
// Returns how many slain hostiles return (capped at `slain`) and how the roll was read.
export function reinforcementResult(raw, size, slain, opts = {}) {
  const { menace = 0, tenacious = false, whispers = 0 } = opts
  const steps = []
  let value = raw
  if (whispers) {
    value = clamp(value + whispers, 1, 20)
    steps.push(`Fortress Whispers ${whispers > 0 ? '+' : ''}${whispers}`)
  }
  if (menace > 0) {
    value = Math.max(1, value - menace)
    steps.push(`menace -${menace}`)
  }
  let count
  if (tenacious && value <= 3) {
    count = 1
    steps.push('Tenacious: returns on 1-3')
  } else {
    const i = bandIndex(value, REINFORCEMENTS.bands)
    count = REINFORCEMENTS[size][i]
  }
  const returning = Math.min(count, slain)
  return { raw, value, size, count, returning, steps, failed: returning === 0 }
}
