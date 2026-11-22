// Roll tables, in the app's own words.

// Reinforcement roll (Blackstone dice). The column is the size of the smallest slain
// hostile in the group; the value is how many slain hostiles from the group return.
// Large on a 3: the Escalation reference page and the Adams summary give 1, the EOG
// summary gives 2. The app follows the Games Workshop page.
export const REINFORCEMENTS = {
  bands: [[1, 1], [2, 2], [3, 3], [4, 20]],
  Small: [6, 4, 2, 0],
  Large: [4, 2, 1, 0],
  Huge: [1, 0, 0, 0],
  refs: [{ src: 'CB', page: 13 }, { src: 'ESC', page: 24 }, { src: 'OOG' }, { src: 'JA' }],
  note: 'Large on a 3 returns 1 per the Escalation reference page; the EOG summary lists 2.',
}

const EVENT_COMMON = {
  allIsDust: { range: [1, 1], name: 'All Is Dust', text: 'If discovery markers remain, the leader discards one. If none remain, every explorer loses 1 inspiration point (minimum 0).' },
  unfulfilled: { range: [2, 3], name: 'Unfulfilled Destiny', text: 'Skip the destiny roll at the start of the next turn.' },
  notDeadYet: { range: [4, 6], name: 'Not Dead Yet', text: 'The leader picks one hostile slain this combat that has not come back, and deploys it as close to an explorer as possible.' },
  changing: { range: [7, 10], name: 'Changing Conditions', text: 'Draw an encounter card. If it has a twist, that twist applies for the rest of the combat; otherwise nothing happens.' },
  inspiration: { range: [15, 17], name: 'Inspiration', text: 'The leader gives 1 inspiration point to an explorer of their choice.' },
  heroic: { range: [18, 19], name: 'Heroic Effort', text: 'The leader picks an out-of-action explorer, deploys them with or as close as possible to another explorer, and makes a vitality roll for them. If nobody is out of action, an explorer of the leader\'s choice makes a vitality roll.' },
  lucky: { range: [20, 20], name: 'Lucky Find', text: 'The leader picks an explorer, who draws a discovery card.' },
}

export const EVENT_TABLES = {
  core: {
    label: 'Core event table',
    refs: [{ src: 'CB' }, { src: 'JA' }],
    rows: [
      EVENT_COMMON.allIsDust,
      EVENT_COMMON.unfulfilled,
      EVENT_COMMON.notDeadYet,
      EVENT_COMMON.changing,
      { range: [11, 14], name: 'Escape Chamber', text: 'The leader swaps the portal furthest from every explorer for the maglev escape chamber (leader picks if tied). No effect if this already happened or an explorer has used Summon.' },
      EVENT_COMMON.inspiration,
      EVENT_COMMON.heroic,
      EVENT_COMMON.lucky,
    ],
  },
  escalation: {
    label: 'Escalation event table (quest for the Black Shrines)',
    refs: [{ src: 'ESC', page: 24 }],
    rows: [
      { ...EVENT_COMMON.allIsDust, text: 'Every explorer loses 1 inspiration point (minimum 0).' },
      EVENT_COMMON.unfulfilled,
      EVENT_COMMON.notDeadYet,
      EVENT_COMMON.changing,
      { range: [11, 14], name: 'Alarm Tripped', text: 'Until the end of the next turn, re-roll reinforcement rolls of 11-20 that bring no hostiles back.' },
      EVENT_COMMON.inspiration,
      { ...EVENT_COMMON.heroic, text: 'The leader picks an out-of-action explorer and deploys them with or as close as possible to another explorer. If nobody is out of action, an explorer of the leader\'s choice makes a vitality roll.' },
      EVENT_COMMON.lucky,
    ],
  },
}

// Nemesis dice actions from 'Hostile Threat Detected' (optional hostile player rules).
export const NEMESIS_ACTIONS = [
  { name: 'The Fortress Whispers', cost: 1, text: 'Shift a reinforcement or behaviour roll up or down by up to the dice value. Several nemesis dice can be added together for this.', whenNot: null },
  { name: 'Raging Blows', cost: 1, text: 'One hostile makes one attack.', whenNot: "during an explorer's activation" },
  { name: 'New Orders', cost: 2, text: 'Re-roll a behaviour roll just made for a hostile and use the new result.', whenNot: null },
  { name: 'Surging Aggression', cost: 3, text: 'Make an extra behaviour roll for one hostile.', whenNot: "during an explorer's activation" },
  { name: 'Last Strike', cost: 4, text: 'When a hostile is slain, one adjacent explorer suffers 1 wound; if that takes them out of action, their current action ends.', whenNot: null },
  { name: 'Ambush', cost: 5, text: 'Returning reinforcements deploy next to a portal of your choice.', whenNot: null },
  { name: 'Disturbing Changes', cost: 5, text: 'Draw an encounter card; a twist on it applies for the rest of the combat.', whenNot: "during an explorer's activation" },
  { name: 'Glancing Blow', cost: 6, text: 'After a hostile is wounded, make a defence-style roll for it: success downgrades or negates the wound, critical success negates it.', whenNot: null },
  { name: 'Wave after Wave', cost: 6, text: 'Make a reinforcement roll for a hostile group.', whenNot: null },
  { name: 'A Twist of Fate', cost: 6, text: "Set one of an explorer's activation dice to 1.", whenNot: "during an explorer's action" },
]
export const NEMESIS_REFS = [{ src: 'WD', page: 120 }]
