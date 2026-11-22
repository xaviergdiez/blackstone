// Hostile reference data.
//
// status:
//   'verified'    read directly off a Games Workshop card or booklet scan
//   'transcribed' taken from a third-party transcription (dire/blackstone); numbers
//                 not yet checked against a physical card
//   'pending'     the hostile is official and in scope but its card has not been
//                 transcribed; profile facts that are sourced are shown, the table is not
//
// Behaviour tables are numbers and action names. Action and rule descriptions are in this
// app's own words with page references, never the card's text.
//
// Weapon dice: 'd6' (square), 'd8' (triangle), 'd12' (pentagon); 'na' = cannot attack.

export const STANDARD_BANDS = [
  [1, 3], [4, 6], [7, 9], [10, 12], [13, 15], [16, 19], [20, 20],
]

export const EXPANSIONS = {
  core: { label: 'Core box', year: 2018 },
  ambull: { label: 'The Dreaded Ambull', year: 2019 },
  traitor: { label: 'Traitor Command', year: 2019 },
  escalation: { label: 'Escalation', year: 2019 },
  noRespite: { label: 'No Respite', year: 2020 },
  custom: { label: 'Your transcriptions', year: null },
}

const FURY = 'Take an Onslaught action, re-rolling failed attack rolls.'
const RUSH = 'Move towards the closest explorer, then take a Charge action.'
const DIRE_REFS = [{ src: 'HRC' }, { src: 'DIRE', note: 'transcription used for the table' }]

export const HOSTILES = [
  {
    id: 'traitor-guardsmen',
    inBox: 14,
    name: 'Traitor Guardsmen',
    expansion: 'core',
    status: 'transcribed',
    move: 2, wounds: 2, size: 'Small',
    bands: STANDARD_BANDS,
    columns: ['hidden', 'engaged', 'inCover', 'close', 'other'],
    table: {
      hidden: ['Hold', 'Sneak', 'Advance', 'Advance', 'Charge', 'Charge', 'Rush'],
      engaged: ['Fall Back', 'Onslaught', 'Onslaught', 'Onslaught', 'Onslaught', 'Onslaught', 'Fury'],
      inCover: ['Aim', 'Aim', 'Aim', 'Onslaught', 'Onslaught', 'Onslaught', 'Fury'],
      close: ['Fall Back', 'Onslaught', 'Onslaught', 'Charge', 'Charge', 'Charge', 'Fury'],
      other: ['Advance', 'Advance', 'Aim', 'Aim', 'Onslaught', 'Onslaught', 'Rush'],
    },
    unique: { Fury: FURY, Rush: RUSH },
    special: [
      { name: 'Group make-up', text: 'Groups come in whatever size the encounter card says. A group of five or more Traitor Guardsmen must include the Sergeant and the flamer, and a group never has more than one of each.', refs: [{ src: 'HRC' }, { src: 'JA' }] },
    ],
    // Per-model loadouts. Labels only: weapon numbers are on the card.
    loadouts: {
      options: ['Lasgun', 'Sergeant', 'Flamer'],
      default: 'Lasgun',
      unique: ['Sergeant', 'Flamer'],
      requiredFrom: 5,
      refs: [{ src: 'HRC' }, { src: 'JA' }],
    },
    refs: DIRE_REFS,
  },
  {
    id: 'negavolt-cultists',
    inBox: 4,
    name: 'Negavolt Cultists',
    expansion: 'core',
    status: 'transcribed',
    move: 2, wounds: 3, size: 'Large',
    bands: STANDARD_BANDS,
    columns: ['hidden', 'engaged', 'other'],
    table: {
      hidden: ['Recharge', 'Hold', 'Charge', 'Charge', 'Charge', 'Charge', 'Rush'],
      engaged: ['Recharge', 'Onslaught', 'Onslaught', 'Onslaught', 'Onslaught', 'Onslaught', 'Fury'],
      other: ['Recharge', 'Charge', 'Charge', 'Charge', 'Charge', 'Charge', 'Rush'],
    },
    unique: {
      Recharge: 'Remove one wound counter from this hostile. If it has none, take an Advance action instead.',
      Fury: FURY,
      Rush: RUSH,
    },
    special: [],
    refs: DIRE_REFS,
  },
  {
    id: 'ur-ghuls',
    inBox: 4,
    name: 'Ur-Ghuls',
    expansion: 'core',
    status: 'transcribed',
    move: 3, wounds: 3, size: 'Small',
    bands: STANDARD_BANDS,
    columns: ['hidden', 'engaged', 'close', 'other'],
    table: {
      hidden: ['Hold', 'Sneak', 'Sneak', 'Charge', 'Charge', 'Charge', 'Rush'],
      engaged: ['Fall Back', 'Fall Back', 'Onslaught', 'Onslaught', 'Onslaught', 'Onslaught', 'Pounce'],
      close: ['Fall Back', 'Fall Back', 'Charge', 'Charge', 'Charge', 'Charge', 'Pounce'],
      other: ['Fall Back', 'Fall Back', 'Fall Back', 'Rush', 'Rush', 'Rush', 'Rush'],
    },
    unique: {
      Pounce: 'If a visible explorer is adjacent, take an Onslaught action; otherwise take a Charge action. Re-roll failed attack rolls either way.',
      Rush: RUSH,
    },
    special: [
      { name: 'Frenzied', text: 'Each time an Ur-Ghul attacks, it makes three attacks (confirmed in the FAQ answer about the Shadow Ambush challenge).', refs: [{ src: 'DC' }, { src: 'HRC' }] },
    ],
    refs: DIRE_REFS,
  },
  {
    id: 'spindle-drones',
    inBox: 4,
    name: 'Spindle Drones',
    expansion: 'core',
    status: 'transcribed',
    move: 2, wounds: 2, size: 'Small',
    bands: STANDARD_BANDS,
    columns: ['hidden', 'engaged', 'inCover', 'close', 'other'],
    table: {
      hidden: ['Hold', 'Sneak', 'Sneak', 'Sneak', 'Advance', 'Advance', 'Alert'],
      engaged: ['Fall Back', 'Fall Back', 'Onslaught', 'Onslaught', 'Onslaught', 'Onslaught', 'Alert'],
      inCover: ['Aim', 'Aim', 'Onslaught', 'Onslaught', 'Onslaught', 'Onslaught', 'Alert'],
      close: ['Fall Back', 'Aim', 'Aim', 'Onslaught', 'Onslaught', 'Onslaught', 'Alert'],
      other: ['Fall Back', 'Aim', 'Aim', 'Onslaught', 'Onslaught', 'Advance', 'Alert'],
    },
    unique: {
      Alert: 'Raise the threat level by 1, then take an Onslaught action. If the threat level is already 3, take the Onslaught re-rolling failed attack rolls.',
    },
    special: [
      { name: 'Threat level', text: 'Spindle Drones use the threat level counter (0 to 3), which changes how hard their weapon hits. Track it in the Turn tab and check it before each Spindle Drone acts.', refs: [{ src: 'HRC' }, { src: 'JA' }, { src: 'RB', page: 3, note: 'threat level counters listed in components' }] },
    ],
    usesThreat: true,
    refs: DIRE_REFS,
  },
  {
    id: 'chaos-beastmen',
    inBox: 4,
    name: 'Chaos Beastmen',
    expansion: 'core',
    status: 'transcribed',
    move: 2, wounds: 3, size: 'Large',
    bands: STANDARD_BANDS,
    columns: ['hidden', 'engaged', 'close', 'other'],
    table: {
      hidden: ['Hold', 'Advance', 'Advance', 'Charge', 'Charge', 'Charge', 'Rush'],
      engaged: ['Onslaught', 'Onslaught', 'Onslaught', 'Onslaught', 'Onslaught', 'Fury', 'Fury'],
      close: ['Onslaught', 'Onslaught', 'Onslaught', 'Charge', 'Charge', 'Charge', 'Rush'],
      other: ['Advance', 'Advance', 'Advance', 'Charge', 'Charge', 'Charge', 'Rush'],
    },
    unique: { Fury: FURY, Rush: RUSH },
    special: [
      { name: 'Action cost', text: 'Explorers next to a Chaos Beastman pay 1 more for their actions. It is only ever +1, however many Beastmen are adjacent.', refs: [{ src: 'DC' }, { src: 'HRC' }] },
    ],
    refs: DIRE_REFS,
  },
  {
    id: 'rogue-psyker',
    inBox: 2,
    name: 'Rogue Psyker',
    expansion: 'core',
    status: 'transcribed',
    move: 2, wounds: 2, size: 'Large',
    bands: STANDARD_BANDS,
    columns: ['hidden', 'engaged', 'close', 'other'],
    table: {
      hidden: ['Hold', 'Hold', 'Hold', 'Disrupt', 'Disrupt', 'Regenerate', 'Empower'],
      engaged: ['Fall Back', 'Fall Back', 'Onslaught', 'Onslaught', 'Onslaught', 'Annihilate', 'Annihilate'],
      close: ['Hold', 'Disrupt', 'Disrupt', 'Onslaught', 'Onslaught', 'Regenerate', 'Empower'],
      other: ['Advance', 'Advance', 'Aim', 'Aim', 'Onslaught', 'Onslaught', 'Rush'],
    },
    unique: {
      Disrupt: 'One unspent activation or destiny dice is discarded and cannot be used this turn. The hostile player picks it, or the leader if there is no hostile player. If there are none to discard, one explorer suffers a wound.',
      Regenerate: 'Remove a wound from this hostile. If it has none, take a Disrupt action instead.',
      Empower: 'Place the empowered marker beside it; it stays empowered until it suffers a wound or grievous wound. If it cannot, take a Disrupt action instead.',
      Annihilate: 'Become empowered, then attack an adjacent visible explorer, re-rolling failed attack rolls. It stays empowered until it is wounded.',
      Rush: RUSH,
    },
    special: [
      { name: 'Who chooses for Disrupt', text: 'With no hostile player, the leader decides what Disrupt takes.', refs: [{ src: 'DC' }] },
    ],
    refs: DIRE_REFS,
  },
  {
    id: 'chaos-space-marines',
    inBox: 2,
    name: 'Chaos Space Marines',
    expansion: 'core',
    status: 'transcribed',
    move: 2, wounds: 4, size: 'Large',
    bands: STANDARD_BANDS,
    columns: ['hidden', 'engaged', 'inCover', 'close', 'other'],
    table: {
      hidden: ['Sneak', 'Advance', 'Advance', 'Charge', 'Charge', 'Rush', 'Rush'],
      engaged: ['Onslaught', 'Onslaught', 'Onslaught', 'Onslaught', 'Onslaught', 'Rapid Fire', 'Rapid Fire'],
      inCover: ['Aim', 'Onslaught', 'Onslaught', 'Onslaught', 'Advance', 'Rapid Fire', 'Rapid Fire'],
      close: ['Aim', 'Aim', 'Onslaught', 'Onslaught', 'Advance', 'Rapid Fire', 'Rapid Fire'],
      other: ['Aim', 'Aim', 'Aim', 'Advance', 'Advance', 'Rapid Fire', 'Rapid Fire'],
    },
    unique: {
      'Rapid Fire': 'Take an Onslaught action, re-rolling failed attack rolls.',
      Rush: RUSH,
    },
    special: [],
    refs: DIRE_REFS,
  },
  {
    id: 'obsidius-mallex',
    inBox: 1,
    name: 'Obsidius Mallex',
    expansion: 'core',
    status: 'transcribed',
    move: 2, wounds: 12, size: 'Huge',
    bands: STANDARD_BANDS,
    // Order as transcribed. Close sits before In cover here, unlike the other cards;
    // worth checking against the physical card because the leftmost column wins.
    columns: ['hidden', 'engaged', 'close', 'inCover', 'other'],
    table: {
      hidden: ['Sneak', 'Advance', 'Advance', 'Charge', 'Rush', 'Rush', 'Rush'],
      engaged: ['Onslaught', 'Onslaught', 'Onslaught', 'Onslaught', 'Fury', 'Fury', 'Fury'],
      close: ['Onslaught', 'Onslaught', 'Charge', 'Charge', 'Charge', 'Overcharge', 'Overcharge'],
      inCover: ['Charge', 'Charge', 'Aim', 'Onslaught', 'Onslaught', 'Overcharge', 'Rush'],
      other: ['Advance', 'Advance', 'Aim', 'Onslaught', 'Onslaught', 'Overcharge', 'Rush'],
    },
    unique: {
      Overcharge: 'Make an overcharged plasma pistol attack against the closest explorer it can see and has in range.',
      Fury: FURY,
      Rush: RUSH,
    },
    special: [],
    notes: ['The transcription lists Close before In cover. Because the leftmost matching column wins, check this order against your card.'],
    refs: DIRE_REFS,
  },
  {
    id: 'ambull',
    inBox: 1,
    name: 'Ambull',
    expansion: 'ambull',
    status: 'transcribed',
    move: 3, wounds: 16, size: 'Huge',
    actionsPerActivation: 2,
    bands: STANDARD_BANDS,
    columns: ['hidden', 'engaged', 'close', 'protective', 'other'],
    table: {
      hidden: ['Hold', 'Advance', 'Advance', 'Advance', 'Charge', 'Charge', 'Tunnel'],
      engaged: ['Advance', 'Advance', 'Advance', 'Advance', 'Onslaught', 'Onslaught', 'Swipe'],
      close: ['Advance', 'Advance', 'Charge', 'Charge', 'Charge', 'Charge', 'Tunnel'],
      protective: ['Charge', 'Charge', 'Charge', 'Charge', 'Charge', 'Charge', 'Tunnel'],
      other: ['Hold', 'Fall Back', 'Fall Back', 'Charge', 'Charge', 'Charge', 'Tunnel'],
    },
    unique: {
      Tunnel: 'The Ambull leaves the board; put the Ambull location marker where it was and lose any action it had left this activation. Next time its initiative card comes up, skip the first behaviour roll: place it as close as possible to the explorer nearest the marker, remove the marker, then roll for its second action as normal.',
      Swipe: 'Attack every explorer that is adjacent to the Ambull and visible to it.',
    },
    weapons: [
      { name: 'Enormous Mandibles and Claws', r1: 'two dice (check card for type)', r2: 'na', r4: 'na', note: 'Eviscerating Blows: anything wounded by it suffers one extra wound.' },
    ],
    special: [
      { name: 'Hulking Creature', text: 'Takes two actions per activation: roll on the table and take the first, then roll again and take the second. It never has to stop when it moves next to an enemy.', refs: [{ src: 'AMB', page: 8 }] },
      { name: 'Symbiotic Healing', text: 'When activated, remove one wound counter; if it has none, remove one grievous wound counter instead.', refs: [{ src: 'AMB', page: 8 }] },
      { name: 'Driven Off', text: 'When its damage reaches its Wounds value it tunnels away and counts as slain; leave the location marker. If it returns as reinforcements it deploys as close as possible to that marker instead of at a portal.', refs: [{ src: 'AMB', page: 8 }] },
      { name: 'Tenacious', text: 'It returns as reinforcements on a reinforcement roll of 1, 2 or 3 rather than only on a 1.', refs: [{ src: 'AMB', page: 8 }] },
      { name: 'Enemy of everything', text: 'The Ambull and Borewyrm Infestations treat every other hostile as an explorer, and other hostiles (except Borewyrms) treat the Ambull as an explorer.', refs: [{ src: 'AMB', page: 8 }] },
    ],
    variants: {
      enraged: {
        label: 'Enraged (Lair of the Beast)',
        wounds: 24,
        special: [
          { name: 'Protective', text: 'An explorer carrying an Ambull egg always counts as the closest explorer to the Ambull.', refs: [{ src: 'AMB', page: 9 }] },
        ],
        note: 'The booklet gives the Enraged card its own profile; this app reuses the transcribed table. Check your Enraged card.',
      },
    },
    tenacious: true,
    notes: ['Profile and special rules are from the Dreaded Ambull booklet. The behaviour table is from the dire/blackstone transcription, including a Protective column whose wording was not transcribed.'],
    refs: [{ src: 'AMB', page: 8 }, { src: 'DIRE', note: 'behaviour table' }],
  },
  {
    id: 'traitor-commissar',
    inBox: 1,
    name: 'Traitor Commissar',
    expansion: 'traitor',
    status: 'verified',
    defaultCount: 1,
    move: 2, wounds: 2, size: 'Large',
    // The card prints the fifth and sixth rows as "13-16" and "16-17". The app treats
    // the overlap as 13-15 / 16-17 so every roll lands in exactly one row.
    bands: [[1, 3], [4, 6], [7, 9], [10, 12], [13, 15], [16, 17], [18, 20]],
    bandLabels: ['1-3', '4-6', '7-9', '10-12', '13-16*', '16-17', '18-20'],
    columns: ['hidden', 'engaged', 'inCover', 'close', 'other'],
    table: {
      hidden: ['Hold', 'Hold', 'Advance', 'Advance', 'Charge', 'Charge', 'Execute the Weak'],
      engaged: ['Fall Back', 'Advance', 'Advance', 'Advance', 'Onslaught', 'Onslaught', 'Execute the Weak'],
      inCover: ['Hold', 'Onslaught', 'Onslaught', 'Onslaught', 'Charge', 'Charge', 'Execute the Weak'],
      close: ['Fall Back', 'Fall Back', 'Charge', 'Charge', 'Charge', 'Charge', 'Execute the Weak'],
      other: ['Fall Back', 'Fall Back', 'Charge', 'Charge', 'Charge', 'Charge', 'Execute the Weak'],
    },
    unique: {
      'Execute the Weak': 'If it can see no Traitor Guardsmen, take a Charge action instead. Otherwise the nearest visible Traitor Guardsman is slain and the motivation marker goes in its hex. Traitor Guardsmen within 6 hexes of the marker add 2 to their behaviour rolls (max 20) until the start of the Commissar\'s next activation.',
    },
    weapons: [
      { name: 'Bolt Pistol and Power Fist', r1: ['d12', 'd12'], r2: ['d8'], r4: ['d6'], note: 'Crushing Blow: no defence roll against wounds it inflicts at range 1.' },
    ],
    special: [
      { name: 'Forwards! For the Dark Gods!', text: 'While the Commissar is on the battlefield, re-roll failed reinforcement rolls for Traitor Guardsmen groups.', refs: [{ src: 'TC' }] },
    ],
    motivates: 'traitor-guardsmen',
    notes: ['Card misprint: rows read 13-16 and 16-17. The app uses 13-15 for the fifth row.'],
    refs: [{ src: 'TC' }],
  },
  {
    id: 'chaos-ogryn',
    inBox: 1,
    name: 'Chaos Ogryn',
    expansion: 'traitor',
    status: 'verified',
    move: 3, wounds: 12, size: 'Huge',
    bands: STANDARD_BANDS,
    columns: ['bodyguard', 'hidden', 'engaged', 'close', 'other'],
    table: {
      bodyguard: ['Hold', 'Advance', 'Guard', 'Guard', 'Guard', 'Guard', 'Crush'],
      hidden: ['Hold', 'Advance', 'Advance', 'Advance', 'Charge', 'Charge', 'Crush'],
      engaged: ['Fall Back', 'Advance', 'Advance', 'Advance', 'Onslaught', 'Onslaught', 'Crush'],
      close: ['Fall Back', 'Charge', 'Charge', 'Charge', 'Charge', 'Charge', 'Crush'],
      other: ['Hold', 'Advance', 'Advance', 'Charge', 'Charge', 'Charge', 'Crush'],
    },
    unique: {
      Guard: 'Move towards the Traitor Commissar.',
      Crush: 'Resolve like a Charge. Any explorers next to the Ogryn when either of its moves ends are stunned.',
    },
    weapons: [
      { name: 'Scavenged Maul and Mutant Claw', r1: ['d8', 'd8'], r2: 'na', r4: 'na', note: 'Claw Grab: the target makes an agility roll first; if it fails, it must re-roll successes on its defence roll against that attack.' },
    ],
    special: [
      { name: 'Blasphemous Icon', text: 'When activated, roll a d8 action dice: on a critical success it gets +1 Move this activation. It also removes one wound counter if it has any.', refs: [{ src: 'TC' }] },
      { name: 'Monstrous Bodyguard', text: 'While the Ogryn is next to the Traitor Commissar, explorers cannot target the Commissar with weapon actions unless they are adjacent to him.', refs: [{ src: 'TC' }] },
    ],
    usesCommissar: true,
    refs: [{ src: 'TC' }],
  },

  // In scope, official, but the card itself is not transcribed yet.
  {
    id: 'borewyrm-infestation',
    inBox: 2,
    name: 'Borewyrm Infestation',
    expansion: 'ambull',
    status: 'pending',
    special: [
      { name: 'Ambull kin', text: 'Borewyrms treat every hostile other than the Ambull and other Borewyrms as explorers.', refs: [{ src: 'AMB', page: 8 }] },
    ],
    refs: [{ src: 'AMB', page: 8 }],
  },
  {
    id: 'cultist-firebrand',
    inBox: 1,
    name: 'Cultist Firebrand',
    expansion: 'escalation',
    status: 'pending',
    encounterHint: 'Escalation encounter cards pair 1 Cultist Firebrand with 7 Cultists.',
    refs: [{ src: 'ESC', page: 7 }],
  },
  {
    id: 'cultists',
    inBox: 7,
    name: 'Chaos Cultists',
    expansion: 'escalation',
    status: 'pending',
    encounterHint: 'Groups of 7 on the Escalation encounter cards.',
    refs: [{ src: 'ESC', page: 7 }],
  },
  {
    id: 'plague-marines',
    inBox: 3,
    name: 'Plague Marines',
    expansion: 'noRespite',
    status: 'pending',
    encounterHint: 'No Respite nodes field 3 Plague Marines.',
    refs: [{ src: 'NR', page: 5 }],
  },
  {
    id: 'poxwalkers',
    inBox: 6,
    name: 'Poxwalkers',
    expansion: 'noRespite',
    status: 'pending',
    encounterHint: 'No Respite nodes field 6 Poxwalkers.',
    refs: [{ src: 'NR', page: 5 }],
  },
]

export const HOSTILE_BY_ID = Object.fromEntries(HOSTILES.map((h) => [h.id, h]))

// Apply a variant (e.g. the Enraged Ambull) on top of a base record.
export function withVariant(hostile, variantKey) {
  const v = variantKey && hostile.variants && hostile.variants[variantKey]
  if (!v) return hostile
  return {
    ...hostile,
    wounds: v.wounds ?? hostile.wounds,
    special: [...(hostile.special || []), ...(v.special || [])],
    notes: [...(hostile.notes || []), ...(v.note ? [v.note] : [])],
    variantLabel: v.label,
  }
}
