import assert from 'node:assert/strict'
import { HOSTILES, HOSTILE_BY_ID, withVariant } from '../data/hostiles.js'
import { RULES } from '../data/rules.js'
import { SOURCES } from '../data/sources.js'
import { EVENT_TABLES, REINFORCEMENTS } from '../data/tables.js'
import { bandIndex, pickColumn, resolveBehaviour, modifiedRoll, validateHostile } from './behaviour.js'
import { reinforcementResult, smallestSize } from './reinforce.js'
import { destinyFromValues, rollDestiny, dealInitiative, inspirationResult, eventFor } from './turn.js'
import { encounterReducer, initialEncounter, damageOf, migrateEncounter } from './encounter.js'
import { attackOutcome } from './attack.js'
import { mulberry32 } from './dice.js'

let passed = 0
const check = (name, fn) => { fn(); passed++ }

// --- data integrity -------------------------------------------------------
check('every playable hostile validates', () => {
  for (const h of HOSTILES) assert.deepEqual(validateHostile(h), [], `${h.id}: ${validateHostile(h).join('; ')}`)
})
check('ids are unique', () => {
  assert.equal(new Set(HOSTILES.map((h) => h.id)).size, HOSTILES.length)
})
check('every reference names a known source', () => {
  const refs = [
    ...HOSTILES.flatMap((h) => [...(h.refs || []), ...(h.special || []).flatMap((s) => s.refs || [])]),
    ...RULES.flatMap((r) => r.refs),
  ]
  for (const r of refs) assert.ok(SOURCES[r.src], `unknown source ${r.src}`)
})
check('every rule entry cites at least one source', () => {
  for (const r of RULES) assert.ok(r.refs.length > 0, r.id)
})
check('event tables cover 1..20 exactly once', () => {
  for (const t of Object.values(EVENT_TABLES)) {
    for (let n = 1; n <= 20; n++) assert.equal(t.rows.filter((r) => n >= r.range[0] && n <= r.range[1]).length, 1, `${t.label} @${n}`)
  }
})
check('reinforcement bands cover 1..20', () => {
  for (let n = 1; n <= 20; n++) bandIndex(n, REINFORCEMENTS.bands)
})

// --- behaviour ------------------------------------------------------------
check('standard bands', () => {
  const tg = HOSTILE_BY_ID['traitor-guardsmen']
  assert.equal(bandIndex(1, tg.bands), 0)
  assert.equal(bandIndex(16, tg.bands), 5)
  assert.equal(bandIndex(19, tg.bands), 5)
  assert.equal(bandIndex(20, tg.bands), 6)
})
check('commissar misprint handled: 16 is the sixth row, 18 the seventh', () => {
  const c = HOSTILE_BY_ID['traitor-commissar']
  assert.equal(bandIndex(15, c.bands), 4)
  assert.equal(bandIndex(16, c.bands), 5)
  assert.equal(bandIndex(18, c.bands), 6)
})
check('leftmost column wins', () => {
  const cols = ['hidden', 'engaged', 'inCover', 'close', 'other']
  assert.equal(pickColumn(cols, { sees: false }), 'hidden')
  assert.equal(pickColumn(cols, { sees: true, adjacent: true, inCover: true, range: 1 }), 'engaged')
  assert.equal(pickColumn(cols, { sees: true, adjacent: false, inCover: true, range: 2 }), 'inCover')
  assert.equal(pickColumn(cols, { sees: true, inCover: false, range: 3 }), 'close')
  assert.equal(pickColumn(cols, { sees: true, inCover: false, range: 5 }), 'other')
})
check('ogryn bodyguard only when blind to explorers but sees the commissar', () => {
  const o = HOSTILE_BY_ID['chaos-ogryn']
  assert.equal(pickColumn(o.columns, { sees: false, seesCommissar: true }), 'bodyguard')
  assert.equal(pickColumn(o.columns, { sees: false, seesCommissar: false }), 'hidden')
  assert.equal(pickColumn(o.columns, { sees: true, adjacent: true, seesCommissar: true }), 'engaged')
})
check('ogryn table as read off the card', () => {
  const o = HOSTILE_BY_ID['chaos-ogryn']
  assert.equal(resolveBehaviour(o, { raw: 8, columnId: 'bodyguard' }).action.name, 'Guard')
  assert.equal(resolveBehaviour(o, { raw: 14, columnId: 'engaged' }).action.name, 'Onslaught')
  assert.equal(resolveBehaviour(o, { raw: 2, columnId: 'close' }).action.name, 'Fall Back')
  assert.equal(resolveBehaviour(o, { raw: 20, columnId: 'other' }).action.name, 'Crush')
})
check('modifiers clamp to 1..20 (motivation +2 caps at 20)', () => {
  assert.equal(modifiedRoll(19, [{ value: 2 }]).final, 20)
  assert.equal(modifiedRoll(2, [{ value: -5 }]).final, 1)
  const tg = HOSTILE_BY_ID['traitor-guardsmen']
  const r = resolveBehaviour(tg, { raw: 18, modifiers: [{ label: 'Motivated', value: 2 }], columnId: 'other' })
  assert.equal(r.final, 20)
  assert.equal(r.action.name, 'Rush')
})
check('unique actions resolve to the hostile description, basics to the shared one', () => {
  const tg = HOSTILE_BY_ID['traitor-guardsmen']
  assert.equal(resolveBehaviour(tg, { raw: 20, columnId: 'engaged' }).action.unique, true)
  assert.equal(resolveBehaviour(tg, { raw: 5, columnId: 'hidden' }).action.name, 'Sneak')
})
check('enraged ambull variant', () => {
  const a = withVariant(HOSTILE_BY_ID.ambull, 'enraged')
  assert.equal(a.wounds, 24)
  assert.ok(a.special.some((s) => s.name === 'Protective'))
})

// --- reinforcements -------------------------------------------------------
check('reinforcement table', () => {
  assert.equal(reinforcementResult(1, 'Small', 6).returning, 6)
  assert.equal(reinforcementResult(2, 'Small', 6).returning, 4)
  assert.equal(reinforcementResult(3, 'Large', 4).returning, 1)
  assert.equal(reinforcementResult(1, 'Huge', 1).returning, 1)
  assert.equal(reinforcementResult(2, 'Huge', 1).returning, 0)
  assert.equal(reinforcementResult(4, 'Small', 6).returning, 0)
})
check('returning hostiles are capped by how many were slain', () => {
  assert.equal(reinforcementResult(1, 'Small', 2).returning, 2)
})
check('menace subtracts to a minimum of 1', () => {
  const r = reinforcementResult(4, 'Small', 6, { menace: 3 })
  assert.equal(r.value, 1)
  assert.equal(r.returning, 6)
  assert.equal(reinforcementResult(2, 'Small', 6, { menace: 4 }).value, 1)
})
check('tenacious ambull returns on 1-3', () => {
  assert.equal(reinforcementResult(3, 'Huge', 1, { tenacious: true }).returning, 1)
  assert.equal(reinforcementResult(4, 'Huge', 1, { tenacious: true }).returning, 0)
})
check('smallest slain size picks the column', () => {
  assert.equal(smallestSize(['Large', 'Small']), 'Small')
  assert.equal(smallestSize(['Huge', 'Large']), 'Large')
})

// --- turn -----------------------------------------------------------------
check('destiny: every duplicated value is discarded (White Dwarf example 1,2,3,3,6)', () => {
  const d = destinyFromValues([1, 2, 3, 3, 6])
  assert.deepEqual(d.kept, [1, 2, 6])
  assert.deepEqual(d.discarded, [3, 3])
  assert.equal(rollDestiny(5, mulberry32(7)).rolled.length, 5)
})
check('ambush initiative puts hostiles first', () => {
  const order = dealInitiative(['A', 'B'], ['G1', 'G2'], { ambush: true }, mulberry32(3))
  assert.deepEqual(order.slice(0, 2).map((c) => c.side), ['hostile', 'hostile'])
  assert.equal(order.length, 4)
})
check('inspiration roll', () => {
  assert.equal(inspirationResult(5, 6).gained, true)
  assert.equal(inspirationResult(7, 6).gained, false)
  assert.equal(inspirationResult(20, 24).gained, true)
  assert.equal(inspirationResult(1, 0).gained, false)
})
check('event lookup', () => {
  assert.equal(eventFor(12, EVENT_TABLES.core).name, 'Escape Chamber')
  assert.equal(eventFor(12, EVENT_TABLES.escalation).name, 'Alarm Tripped')
})

// --- encounter reducer ------------------------------------------------------
check('attack results: crit is 2 wounds on a hostile, 1 grievous on an explorer', () => {
  assert.deepEqual(attackOutcome('success', { target: 'hostile' }), { result: 'success', wounds: 1, grievous: 0 })
  assert.deepEqual(attackOutcome('crit', { target: 'hostile' }), { result: 'crit', wounds: 2, grievous: 0 })
  assert.deepEqual(attackOutcome('success', { target: 'explorer' }), { result: 'success', wounds: 1, grievous: 0 })
  assert.deepEqual(attackOutcome('crit', { target: 'explorer' }), { result: 'crit', wounds: 0, grievous: 1 })
  assert.equal(attackOutcome('fail', { target: 'hostile' }).wounds, 0)
})
check('cover drops one step: crit becomes 1 wound, success misses', () => {
  assert.deepEqual(attackOutcome('crit', { target: 'hostile', cover: true }), { result: 'success', wounds: 1, grievous: 0 })
  assert.deepEqual(attackOutcome('crit', { target: 'explorer', cover: true }), { result: 'success', wounds: 1, grievous: 0 })
  assert.equal(attackOutcome('success', { target: 'hostile', cover: true }).wounds, 0)
  assert.equal(attackOutcome('success', { target: 'explorer', cover: true }).wounds, 0)
})
check('tracker: crits and hits add wounds and mark the model slain at its Wounds value', () => {
  let s = encounterReducer(initialEncounter, { type: 'addGroup', hostileId: 'chaos-space-marines', count: 2 })
  const g = s.groups[0]
  const m = g.models[0]
  s = encounterReducer(s, { type: 'attack', groupId: g.id, modelId: m.id, result: 'crit', woundsValue: 4 })
  assert.equal(damageOf(s.groups[0].models[0]), 2)
  assert.equal(s.groups[0].models[0].grievous, 0)
  s = encounterReducer(s, { type: 'attack', groupId: g.id, modelId: m.id, result: 'success', cover: true, woundsValue: 4 })
  assert.equal(damageOf(s.groups[0].models[0]), 2, 'success in cover misses')
  s = encounterReducer(s, { type: 'attack', groupId: g.id, modelId: m.id, result: 'crit', cover: true, woundsValue: 4 })
  assert.equal(damageOf(s.groups[0].models[0]), 3)
  assert.equal(s.groups[0].models[0].slain, false)
  s = encounterReducer(s, { type: 'attack', groupId: g.id, modelId: m.id, result: 'success', woundsValue: 4 })
  assert.equal(s.groups[0].models[0].slain, true)
  s = encounterReducer(s, { type: 'returnModels', groupId: g.id, count: 3 })
  assert.equal(s.groups[0].models[0].slain, false)
  assert.equal(damageOf(s.groups[0].models[0]), 0)
})
check('old saves: grievous counters on hostiles become 2 wounds each', () => {
  const old = { groups: [{ id: 'g', hostileId: 'ur-ghuls', models: [{ id: 'm', label: '1', wounds: 1, grievous: 1, slain: false }] }] }
  const m = migrateEncounter(old).groups[0].models[0]
  assert.equal(m.wounds, 3)
  assert.equal(m.grievous, 0)
  assert.equal(m.inCover, false)
})
check('threat level stays within 0..3', () => {
  assert.equal(encounterReducer(initialEncounter, { type: 'threat', value: 7 }).threat, 3)
  assert.equal(encounterReducer(initialEncounter, { type: 'threat', value: -1 }).threat, 0)
})

console.log(`rules.check: ${passed} checks passed`)
