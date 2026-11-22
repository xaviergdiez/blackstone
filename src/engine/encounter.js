// Encounter state: hostile groups on the battlefield and the damage on each model.
// Pure reducer so the rules can be checked without a browser.

export const GRIEVOUS_DAMAGE = 3

export function damageOf(model) {
  return model.wounds + model.grievous * GRIEVOUS_DAMAGE
}

export function isDown(model, woundsValue) {
  return damageOf(model) >= woundsValue
}

let seq = 0
const uid = (p) => `${p}-${Date.now().toString(36)}-${(seq++).toString(36)}`

export function newModel(label) {
  return { id: uid('m'), label, wounds: 0, grievous: 0, stunned: false, slain: false, motivated: false, empowered: false }
}

export function newGroup(hostileId, count, { name, variant } = {}) {
  return {
    id: uid('g'),
    hostileId,
    variant: variant || null,
    name: name || null,
    models: Array.from({ length: count }, (_, i) => newModel(`${i + 1}`)),
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
        groups: state.groups.map((g) => (g.id !== action.groupId ? g : { ...g, models: [...g.models, newModel(String(g.models.length + 1))] })),
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
      return { ...initialEncounter, ...action.state }
    default:
      return state
  }
}

export function groupStats(group, woundsValue) {
  const alive = group.models.filter((m) => !m.slain)
  const slain = group.models.filter((m) => m.slain)
  return { alive: alive.length, slain: slain.length, total: group.models.length, slainWounds: slain.length * woundsValue }
}
