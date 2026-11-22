// Rules reference, written in this app's own words. Each entry carries the pages it
// summarises so the table can go straight to the book when a ruling matters.

export const RULE_GROUPS = [
  { id: 'activation', label: 'Hostile activation' },
  { id: 'behaviour', label: 'Behaviour & targeting' },
  { id: 'damage', label: 'Wounds & reinforcements' },
  { id: 'turn', label: 'Combat turn' },
  { id: 'hostilePlayer', label: 'Hostile player' },
  { id: 'expansions', label: 'Expansion rules' },
]

export const RULES = [
  {
    id: 'group-activation',
    group: 'activation',
    title: 'Activating a hostile group',
    tags: ['initiative', 'order', 'closest'],
    body: [
      'When a hostile group\'s initiative card comes up, the whole group acts in this order:',
      ['If any of the group has been slain, make a reinforcement roll first.', 'Then activate each hostile, closest to an explorer first. Distance is counted along the shortest route that avoids wall hexsides and obstructed hexes; ties are broken by the hostile player (or the leader).', 'Each activated hostile makes a behaviour roll on its card and takes the action it gets.'],
      'Spindle Drone groups: check the threat level before they act.',
    ],
    refs: [{ src: 'CB', page: 13 }, { src: 'OOG' }, { src: 'JA' }],
  },
  {
    id: 'stunned-hostiles',
    group: 'activation',
    title: 'Stunned hostiles',
    tags: ['stun', 'prone'],
    body: [
      'A stunned hostile is laid on its side.',
      ['When it is next activated it just stands up: no behaviour roll, and it is no longer stunned.', 'If a stunned hostile is stunned again, it suffers 1 wound instead.'],
    ],
    refs: [{ src: 'CB' }, { src: 'OOG' }, { src: 'JA' }],
  },
  {
    id: 'leftmost-column',
    group: 'behaviour',
    title: 'Which column to use',
    tags: ['column', 'leftmost', 'faq'],
    body: [
      'Read the behaviour table from left to right and use the first column whose condition is true. If two or more apply, the leftmost one wins.',
      'The Encounter screen asks the questions in that order and picks the column for you; tap a column header to override it.',
    ],
    refs: [{ src: 'DC' }, { src: 'HRC' }],
  },
  {
    id: 'column-conditions',
    group: 'behaviour',
    title: 'Column conditions',
    tags: ['hidden', 'engaged', 'cover', 'close', 'other'],
    body: [
      [
        'Hidden: it has no line of sight to any explorer.',
        'Engaged: it is adjacent to an explorer it can see.',
        'In cover: it is in cover from every explorer that can see it.',
        'Close: the closest explorer it can see is 2 or 3 hexes away.',
        'Other: anything else.',
        'Bodyguard (Chaos Ogryn): no line of sight to an explorer, but line of sight to the Traitor Commissar.',
      ],
    ],
    refs: [{ src: 'HRC' }, { src: 'TC' }],
  },
  {
    id: 'basic-actions',
    group: 'behaviour',
    title: 'Basic hostile actions',
    tags: ['hold', 'sneak', 'advance', 'charge', 'aim', 'onslaught', 'fall back'],
    body: [
      [
        'Hold: does nothing.',
        'Sneak: ends as close as possible to an explorer without entering a hex any explorer can see.',
        'Advance: moves towards the closest explorer, then attacks the closest visible explorer in range.',
        'Charge: moves towards the closest explorer, then attacks an adjacent visible explorer; if none, moves towards the closest explorer again.',
        'Aim: attacks the furthest visible explorer in range, ignoring cover.',
        'Onslaught: attacks the closest visible explorer in range twice; the second attack may switch target if the first went out of action or another is equally close.',
        'Fall Back: moves up to double Move to a hex no explorer can see; if it cannot, attacks the closest visible explorer in range.',
      ],
    ],
    refs: [{ src: 'CB', page: 13 }, { src: 'ESC', page: 24 }],
  },
  {
    id: 'hostile-movement',
    group: 'behaviour',
    title: 'Hostile movement and hexes',
    tags: ['move', 'hex limit', 'occupied'],
    body: [
      'Hostiles move towards their target along the shortest route that avoids walls and obstructed hexes.',
      ['A hostile can never enter a hex holding an explorer, even one that is invisible to it.', 'Hex limits: 3 small, or 2 small and 1 large, or 2 large, or 1 huge hostile.'],
      'The Ambull ignores the usual halt when it moves next to an enemy.',
    ],
    refs: [{ src: 'CB', page: 6 }, { src: 'DC' }, { src: 'AMB', page: 8 }],
  },
  {
    id: 'hostile-attacks',
    group: 'behaviour',
    title: 'Hostile attacks, cover and range',
    tags: ['attack', 'cover', 'range', 'dice'],
    body: [
      'Hostiles attack with the dice shown for the range band on their weapon. With two dice, roll both and pick one result.',
      ['Failure misses, success inflicts 1 wound, critical success inflicts 1 grievous wound.', 'Cover drops the result one step: success becomes failure, critical becomes success. Aim attacks ignore cover.', 'Explorers make a defence roll against each wound unless a rule says otherwise (e.g. the Commissar\'s Crushing Blow).'],
    ],
    refs: [{ src: 'CB', page: 12 }, { src: 'CB', page: 14 }, { src: 'JA' }],
  },
  {
    id: 'hostile-damage',
    group: 'damage',
    title: 'Wounds on hostiles',
    tags: ['wounds', 'grievous', 'damage', 'slain'],
    body: [
      'Each wound on a hostile is 1 point of damage and each grievous wound is 3. A hostile is slain once its damage equals or exceeds its Wounds value.',
      'The Encounter tracker adds this up for you and flags hostiles that should be removed.',
    ],
    refs: [{ src: 'CB', page: 12 }, { src: 'OOG' }, { src: 'JA' }],
  },
  {
    id: 'reinforcements',
    group: 'damage',
    title: 'Reinforcement rolls',
    tags: ['reinforcement', 'portal', 'return'],
    body: [
      'At the start of its activation, a group that has lost any hostiles rolls the Blackstone dice. Use the column for the size of its smallest slain hostile:',
      ['Roll 1: 6 small, 4 large or 1 huge return.', 'Roll 2: 4 small or 2 large return.', 'Roll 3: 2 small or 1 large return.', '4 or more: nobody returns.'],
      'Returning hostiles deploy next to a portal, as close as possible to a hostile from their group (or to an explorer if none is left). Each then attacks the closest visible explorer in range, or moves towards the closest explorer if it sees none. That is not an activation.',
      'Sources disagree on Large with a 3 (1 or 2). This app uses 1, as on the Escalation reference page.',
    ],
    refs: [{ src: 'CB', page: 13 }, { src: 'ESC', page: 24 }, { src: 'OOG' }, { src: 'JA' }],
  },
  {
    id: 'inspiration-roll',
    group: 'damage',
    title: 'Inspiration roll for slaying hostiles',
    tags: ['inspiration', 'slain'],
    body: [
      'At the end of an explorer\'s activation in which they slew hostiles, roll the Blackstone dice. If the roll is equal to or below the combined Wounds values of the hostiles they slew, they gain 1 inspiration point (automatic at 20 or more). Hostiles slain on overwatch do not count.',
      'Explorers can hold at most 4 inspiration points.',
    ],
    refs: [{ src: 'CB', page: 10 }, { src: 'RB', page: 14 }, { src: 'OOG' }],
  },
  {
    id: 'combat-turn',
    group: 'turn',
    title: 'Combat turn sequence',
    tags: ['turn', 'phase', 'destiny', 'initiative', 'event'],
    body: [
      ['Destiny phase: roll the destiny dice and discard every dice that shares its value with another.', 'Initiative phase: activation rolls, deal the initiative cards onto the combat track, covering fire, then gambits (all covering fire comes before any gambit).', 'Activation phase: work along the combat track; explorers act, hostile groups activate.', 'Event phase: if the combat has not ended, roll on the event table.'],
      'A combat does not end just because every hostile is slain: the explorers still need to be in the escape chamber (or out of action).',
    ],
    refs: [{ src: 'CB', page: 7 }, { src: 'ESC', page: 24 }, { src: 'DC' }],
  },
  {
    id: 'destiny-dice',
    group: 'turn',
    title: 'Destiny dice',
    tags: ['destiny', 'duplicates'],
    body: [
      'Roll the five destiny dice; every value that appears more than once is discarded entirely (a 3 and a 3 both go). The rest are available to the explorers this turn, at most two per explorer.',
    ],
    refs: [{ src: 'CB', page: 7 }, { src: 'JA' }, { src: 'WD', page: 120, note: 'worked example' }],
  },
  {
    id: 'ambush-initiative',
    group: 'turn',
    title: 'Ambush initiative',
    tags: ['ambush', 'initiative'],
    body: [
      'On the first turn of an ambush combat, shuffle the hostile group cards and place them on the track first, then shuffle and place the explorers.',
    ],
    refs: [{ src: 'CB' }, { src: 'JA' }],
  },
  {
    id: 'overwatch-events',
    group: 'turn',
    title: 'Overwatch and event-phase arrivals',
    tags: ['overwatch', 'event'],
    body: [
      'Overwatch dice are removed at the end of the activation phase, so they cannot be used on hostiles that deploy during the event phase.',
    ],
    refs: [{ src: 'DC' }],
  },
  {
    id: 'hostile-player',
    group: 'hostilePlayer',
    title: 'Expanded hostile player rules (optional)',
    tags: ['hostile player', 'nemesis', 'white dwarf'],
    body: [
      'With a fifth player running the hostiles, these optional rules add:',
      [
        'Exploration: the hostile player holds a hand of three exploration cards and chooses which one the explorers face.',
        'Battlefield: the hostile player draws six encounter cards and picks which group deploys at each discovery marker.',
        'Initiative: before covering fire, the hostile player may roll to swap one hostile group\'s initiative card with the nearest explorer card (success) or any explorer card (critical).',
        'Nemesis dice: destiny dice discarded in the destiny phase, spent by explorers, or left unspent at the end of the activation phase go to the hostile player with the same value.',
        'Activation order: the hostile player may activate a group\'s hostiles in any order.',
      ],
      'The Turn tab tracks nemesis dice and lists what they buy.',
    ],
    refs: [{ src: 'WD', page: 120 }],
  },
  {
    id: 'traitor-commissar-motivation',
    group: 'expansions',
    title: 'Execute the Weak and the motivation marker',
    tags: ['commissar', 'motivation', '+2'],
    body: [
      'When the Traitor Commissar executes a Traitor Guardsman, the motivation marker goes in that hex. Traitor Guardsmen within 6 hexes of it add 2 to behaviour rolls (max 20) until the start of the Commissar\'s next activation.',
      'Toggle "Motivated" on a Traitor Guardsman in the Encounter screen to add the +2.',
    ],
    refs: [{ src: 'TC' }],
  },
  {
    id: 'ambull-rules',
    group: 'expansions',
    title: 'The Ambull and its offspring',
    tags: ['ambull', 'borewyrm', 'tunnel'],
    body: [
      ['The Ambull and Borewyrms treat every other hostile as an explorer; other hostiles (except Borewyrms) treat the Ambull as an explorer.', 'The Ambull takes two behaviour rolls and two actions per activation.', 'It heals one wound counter (or a grievous wound counter if it has no wounds) each time it activates.', 'At full damage it is driven off rather than killed outright, and it returns on a reinforcement roll of 1-3.'],
      'In the Lair of the Beast use the Enraged profile (24 Wounds, egg carriers count as closest).',
    ],
    refs: [{ src: 'AMB', page: 8 }, { src: 'AMB', page: 9 }],
  },
  {
    id: 'menace-level',
    group: 'expansions',
    title: 'Menace level (Escalation)',
    tags: ['menace', 'escalation', 'reinforcement'],
    body: [
      'During the quest for the Black Shrines, subtract the menace level (1-4) from every reinforcement roll, to a minimum of 1. Set it in the Turn tab and the reinforcement helper applies it.',
    ],
    refs: [{ src: 'ESC', page: 11 }],
  },
  {
    id: 'shambling-horde',
    group: 'expansions',
    title: 'Reinforcement modifiers on cards',
    tags: ['commissar', 're-roll', 'tenacious'],
    body: [
      ['Traitor Commissar on the battlefield: re-roll failed reinforcement rolls for Traitor Guardsmen groups.', 'Ambull: returns on 1, 2 or 3.'],
      'Other expansion cards change reinforcements too. Add those rules when you transcribe the card.',
    ],
    refs: [{ src: 'TC' }, { src: 'AMB', page: 8 }],
  },
]
