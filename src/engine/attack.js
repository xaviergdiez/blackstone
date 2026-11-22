// What one attack-roll result does to its target.
//
// Against a hostile:  success = 1 wound, critical = 2 wounds.
// Against an explorer: success = 1 wound, critical = 1 grievous wound.
// Cover drops the result one step: a critical counts as a success, a success misses.

export const RESULTS = ['fail', 'success', 'crit']

export function effectiveResult(result, cover) {
  if (!cover) return result
  if (result === 'crit') return 'success'
  return 'fail'
}

export function attackOutcome(result, { target = 'hostile', cover = false } = {}) {
  const r = effectiveResult(result, cover)
  if (r === 'fail') return { result: r, wounds: 0, grievous: 0 }
  if (target === 'explorer') return r === 'crit' ? { result: r, wounds: 0, grievous: 1 } : { result: r, wounds: 1, grievous: 0 }
  return { result: r, wounds: r === 'crit' ? 2 : 1, grievous: 0 }
}

export function outcomeText({ wounds, grievous }) {
  if (grievous) return `${grievous} grievous wound${grievous > 1 ? 's' : ''}`
  if (wounds) return `${wounds} wound${wounds > 1 ? 's' : ''}`
  return 'miss'
}
