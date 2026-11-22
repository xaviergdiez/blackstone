// Basic hostile actions, in this app's own words. The wording on the cards and in the
// booklets is Games Workshop's; these are paraphrases with page references.

const BASIC_REFS = [{ src: 'CB', page: 13 }, { src: 'ESC', page: 24, note: 'reference page' }]

export const BASIC_ACTIONS = {
  Hold: {
    kind: 'wait',
    text: 'Does nothing this activation.',
    refs: BASIC_REFS,
  },
  Sneak: {
    kind: 'move',
    text: 'Moves to end as close as it can to an explorer without entering any hex an explorer can see.',
    refs: BASIC_REFS,
  },
  Advance: {
    kind: 'move+attack',
    text: 'Moves towards the closest explorer, then attacks the closest explorer it can see and has in range.',
    refs: BASIC_REFS,
  },
  Charge: {
    kind: 'move+attack',
    text: 'Moves towards the closest explorer, then attacks a visible explorer next to it. If none is adjacent, it moves towards the closest explorer a second time instead.',
    refs: BASIC_REFS,
  },
  Aim: {
    kind: 'attack',
    text: 'Attacks the furthest explorer it can see and has in range. The attack ignores cover.',
    refs: BASIC_REFS,
  },
  Onslaught: {
    kind: 'attack',
    text: 'Attacks the closest visible explorer in range, then does it again. The second attack can switch target if the first one went out of action or another explorer is equally close.',
    refs: BASIC_REFS,
  },
  'Fall Back': {
    kind: 'move',
    text: 'Moves up to double its Move value, ending out of sight of every explorer if it can. If no such hex is reachable it attacks the closest visible explorer in range instead.',
    refs: BASIC_REFS,
  },
}

export const ACTION_KIND_LABEL = {
  wait: 'Wait',
  move: 'Move',
  attack: 'Attack',
  'move+attack': 'Move + attack',
  special: 'Special',
}
