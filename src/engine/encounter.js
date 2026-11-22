// Encounter state: hostile groups on the battlefield and the damage on each model.
// Pure reducer so the rules can be checked without a browser.

import { attackOutcome } from './attack.js'

// Hostiles only take wound counters: an explorer's critical success is 2 wounds.
// `grievous` survives on the model only so that state saved by the first version
// (which logged grievous wounds on hostiles) still loads; it is folded into wounds.
export function damageOf(model) {
  return model.wounds + (model.grievous || 0) * 2
}

function migrateModel(m) {
  if (!m.grievous) return { inCover: false, ...m }
  return { inCover: false, ...m, wounds: m.wounds + m.grievous * 2, grievous: 0 }
}

export function migrateEncounter(enc) {
  return { ...enc, groups: (enc.groups || []).map((g) => ({ ...g, models: g.models.map(migrateModel) })) }
}

export function isDown(model, woundsValue) {
  return damageOf(model) >= woundsValue
}

let seq = 0
const uid = (p) => `${p}-${Date.now().toString(36)}-${(seq++).toString(36)}`

export function newModel(label) {
  return { id: uid('m'), label, wounds: 0, grievous: 0, stunned: false, slain: false, motivated: false, empowered: false, inCover: false }
}

// Starting loadouts: everyone gets the default, and a group large enough to need them
// gets the unique loadouts (Sergeant, flamer) on its first models.
export function startingLoadouts(count, config) {
  if (!config) return Array(count).fill(null)
  const out = Array(count).fill(config.default)
  if (count >= config.requiredFrom) config.unique.forEach((l, i) => { if (i < count) out[i] = l })
  return out
}

// Problems with a group's loadouts, counting standing and slain models alike.
export function loadoutProblems(models, config) {
  if (!config) return []
  const problems = []
  const count = (l) => models.filter((m) => m.loadout === l).length
  for (const l of config.unique) {
    if (count(l) > 1) problems.push(`More than one ${l}`)
    if (models.length >= config.requiredFrom && count(l) === 0) problems.push(`${models.length} models: needs a ${l}`)
  }
  return problems
}

export function newGroup(hostileId, count, { name, variant, loadouts } = {}) {
  const lo = startingLoadouts(count, loadouts)
  return {
    id: uid('g'),
    hostileId,
    variant: variant || null,
    name: name || null,
    models: Array.from({ length: count }, (_, i) => ({ ...newModel(`${i + 1}`), loadout: lo[i] })),
  }
}

export const initialEncounter = { groups: [], threat: 0, menace: 0, nemesis: [], log: [] }

function mapModel(state, groupId, modelId, fn) {
  return {
    ...state,
    groups: state.groups.map((g) =>
      g.id !== groupId ? g : { ...g, models: g.models.map((m) => (m.id === modelId ? fn(m) : m)) },
    ),
  }
}

function logged(state, text) {
  const log = [{ at: Date.now(), text }, ...state.log].slice(0, 60)
  return { ...state, log }
}

// action.woundsValue is passed for damage actions so the reducer can mark a model slain
// without needing the hostile data.
export function encounterReducer(state, action) {
  switch (action.type) {
    case 'addGroup':
      return logged({ ...state, groups: [...state.groups, newGroup(action.hostileId, action.count, action)] }, `Added ${action.count} × ${action.label || action.hostileId}`)
    case 'removeGroup':
      return { ...state, groups: state.groups.filter((g) => g.id !== action.groupId) }
    case 'addModel':
      return {
        ...state,
        groups: state.groups.map((g) => (g.id !== action.groupId ? g : { ...g, models: [...g.models, { ...newModel(String(g.models.length + 1)), loadout: action.loadout || null }] })),
      }
    case 'removeModel':
      return {
        ...state,
        groups: state.groups.map((g) => (g.id !== action.groupId ? g : { ...g, models: g.models.filter((m) => m.id !== action.modelId) })),
      }
    case 'damage': {
      const { kind, delta, woundsValue } = action
      return mapModel(state, action.groupId, action.modelId, (m) => {
        const next = { ...m, [kind]: Math.max(0, m[kind] + delta) }
        if (woundsValue) next.slain = isDown(next, woundsValue)
        // Being wounded ends the Rogue Psyker's empowered state.
        if (delta > 0) next.empowered = false
        return next
      })
    }
    case 'attack': {
      // An explorer's attack roll against a hostile: 'success' or 'crit', with cover applied.
      const out = attackOutcome(action.result, { target: 'hostile', cover: action.cover })
      if (!out.wounds) return logged(state, `${action.label || 'Hostile'}: ${action.result} in cover, no effect`)
      const next = mapModel(state, action.groupId, action.modelId, (m) => {
        const n = { ...m, wounds: m.wounds + out.wounds, empowered: false }
        if (action.woundsValue) n.slain = isDown(n, action.woundsValue)
        return n
      })
      return logged(next, `${action.label || 'Hostile'}: ${action.result}${action.cover ? ' (cover)' : ''} → +${out.wounds} wound${out.wounds > 1 ? 's' : ''}`)
    }
    case 'toggle':
      return mapModel(state, action.groupId, action.modelId, (m) => ({ ...m, [action.flag]: !m[action.flag] }))
    case 'set':
      return mapModel(state, action.groupId, action.modelId, (m) => ({ ...m, ...action.patch }))
    case 'returnModels': {
      // Reinforcements: bring back up to `count` slain models, fully healed.
      let left = action.count
      const groups = state.groups.map((g) => {
        if (g.id !== action.groupId) return g
        return {
          ...g,
          models: g.models.map((m) => {
            if (left > 0 && m.slain) {
              left--
              return { ...m, slain: false, wounds: 0, grievous: 0, stunned: false, empowered: false }
            }
            return m
          }),
        }
      })
      return logged({ ...state, groups }, `${action.count - left} returned as reinforcements`)
    }
    case 'threat':
      return { ...state, threat: Math.max(0, Math.min(3, action.value)) }
    case 'menace':
      return { ...state, menace: Math.max(0, Math.min(4, action.value)) }
    case 'nemesisAdd':
      return { ...state, nemesis: [...state.nemesis, ...action.values] }
    case 'nemesisSpend': {
      const nemesis = state.nemesis.slice()
      nemesis.splice(action.index, 1)
      return { ...state, nemesis }
    }
    case 'nemesisClear':
      return { ...state, nemesis: [] }
    case 'log':
      return logged(state, action.text)
    case 'endCombat':
      return { ...initialEncounter, menace: state.menace }
    case 'load':
      return migrateEncounter({ ...initialEncounter, ...action.state })
    default:
      return state
  }
}

export function groupStats(group, woundsValue) {
  const alive = group.models.filter((m) => !m.slain)
  const slain = group.models.filter((m) => m.slain)
  return { alive: alive.length, slain: slain.length, total: group.models.length, slainWounds: slain.length * woundsValue }
}
