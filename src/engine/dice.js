// Dice with an injectable random source, so rules can be tested deterministically.

export function mulberry32(seed) {
  let a = seed >>> 0
  return function rng() {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const defaultRng = () => Math.random()

export function roll(sides, rng = defaultRng) {
  return 1 + Math.floor(rng() * sides)
}

export const d20 = (rng) => roll(20, rng)
export const d6 = (rng) => roll(6, rng)

// Action dice (fail / success / critical faces) stay physical: the app does not model
// their face distribution.
export function shuffle(list, rng = defaultRng) {
  const a = list.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n))
}
