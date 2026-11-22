// Behaviour table columns. Each column has the condition printed on the cards and a
// predicate over a "situation" so the app can find the leftmost column that applies
// (Designers' Commentary, Nov 2018: start at the left and stop at the first match).
//
// situation = {
//   sees: boolean            line of sight to at least one explorer
//   adjacent: boolean        adjacent to a visible explorer
//   inCover: boolean         in cover from every visible explorer
//   range: number | null     hexes to the closest visible explorer
//   seesCommissar: boolean   line of sight to the Traitor Commissar (Chaos Ogryn)
//   protective: boolean      the Ambull's Protective column applies (set by hand)
// }

export const COLUMNS = {
  bodyguard: {
    label: 'Bodyguard',
    condition: 'No line of sight to an explorer, but line of sight to the Traitor Commissar',
    test: (s) => !s.sees && !!s.seesCommissar,
  },
  hidden: {
    label: 'Hidden',
    condition: 'No line of sight to an explorer',
    test: (s) => !s.sees,
  },
  engaged: {
    label: 'Engaged',
    condition: 'Adjacent to a visible explorer',
    test: (s) => !!s.sees && !!s.adjacent,
  },
  inCover: {
    label: 'In cover',
    condition: 'In cover from all visible explorers',
    test: (s) => !!s.sees && !!s.inCover,
  },
  close: {
    label: 'Close',
    condition: 'Range to the closest visible explorer is 2 or 3 hexes',
    test: (s) => !!s.sees && (s.range === 2 || s.range === 3),
  },
  protective: {
    label: 'Protective',
    condition: 'Column present in the transcribed Ambull table; its exact wording was not transcribed. Check your card and tick it when it applies.',
    test: (s) => !!s.protective,
    manual: true,
  },
  other: {
    label: 'Other',
    condition: 'Any other situation',
    test: () => true,
  },
}

export const SITUATION_DEFAULT = {
  sees: true,
  adjacent: false,
  inCover: false,
  range: 4,
  seesCommissar: false,
  protective: false,
}
