import { HOSTILES, withVariant } from './data/hostiles.js'
import { initialEncounter, migrateEncounter } from './engine/encounter.js'

const KEY = 'bsf-companion:v1'

export const DEFAULT_SETTINGS = {
  hostilePlayer: false,
  eventTable: 'core',
  explorers: ['Explorer 1', 'Explorer 2', 'Explorer 3', 'Explorer 4'],
}

// Browser storage can be missing, full or blocked (private mode, embedded frames), so
// every access is guarded and the app keeps working from memory.
export function loadSaved() {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    return data && typeof data === 'object' ? data : null
  } catch {
    return null
  }
}

export function save(data) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data))
    return true
  } catch {
    return false
  }
}

export function initialState() {
  const saved = loadSaved() || {}
  return {
    encounter: migrateEncounter({ ...initialEncounter, ...(saved.encounter || {}) }),
    settings: { ...DEFAULT_SETTINGS, ...(saved.settings || {}) },
    custom: saved.custom || {},
  }
}

// Built-in hostiles, with anything the user has transcribed replacing the pending card
// of the same id (or added as new).
export function allHostiles(custom) {
  const byId = new Map(HOSTILES.map((h) => [h.id, h]))
  for (const [id, h] of Object.entries(custom || {})) byId.set(id, h)
  return [...byId.values()]
}

export function getHostile(custom, id, variant) {
  const base = (custom && custom[id]) || HOSTILES.find((h) => h.id === id)
  return base ? withVariant(base, variant) : null
}
