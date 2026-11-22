// Where every rule and number in the app comes from. A reference is
// { src: <id>, page?: number | string, note?: string }.
// `official` separates Games Workshop material from fan summaries and transcriptions,
// so the UI can show at a glance how much weight a reference carries.

export const SOURCES = {
  RB: { title: 'Rules booklet', short: 'Rules', publisher: 'Games Workshop', year: 2018, official: true },
  CB: { title: 'Combat booklet', short: 'Combat', publisher: 'Games Workshop', year: 2018, official: true },
  HRC: { title: 'Hostile reference card (core box)', short: 'Card', publisher: 'Games Workshop', year: 2018, official: true },
  DC: { title: "Designers' Commentary, November 2018", short: 'FAQ', publisher: 'Games Workshop', year: 2018, official: true },
  ESC: { title: 'Escalation booklet', short: 'Escalation', publisher: 'Games Workshop', year: 2019, official: true },
  TC: { title: 'Traitor Command hostile reference cards', short: 'Traitor Cmd', publisher: 'Games Workshop', year: 2019, official: true },
  AMB: { title: 'The Dreaded Ambull booklet', short: 'Ambull', publisher: 'Games Workshop', year: 2019, official: true },
  NR: { title: 'No Respite booklet', short: 'No Respite', publisher: 'Games Workshop', year: 2020, official: true },
  WD: { title: "'Hostile Threat Detected', White Dwarf May 2019 (reprinted in the 2019 Annual)", short: 'White Dwarf', publisher: 'Games Workshop', year: 2019, official: true },
  OOG: { title: 'Esoteric Order of Gamers rules summary v1.2', short: 'EOG summary', publisher: 'orderofgamers.com', year: 2019, official: false },
  JA: { title: 'Rules + Order of Play v1.2 (Jacob Adams)', short: 'Adams summary', publisher: 'Notion / PDF', year: 2019, official: false },
  DIRE: { title: 'dire/blackstone behaviour data', short: 'dire data', publisher: 'github.com/dire/blackstone', year: 2019, official: false },
  USER: { title: 'Transcribed by you in this app', short: 'Your card', publisher: 'This device', year: null, official: false },
}

export function refLabel(ref) {
  const s = SOURCES[ref.src]
  if (!s) return ref.src
  return ref.page != null ? `${s.short} p${ref.page}` : s.short
}

export function refTitle(ref) {
  const s = SOURCES[ref.src]
  if (!s) return ref.src
  const page = ref.page != null ? `, page ${ref.page}` : ''
  const note = ref.note ? ` (${ref.note})` : ''
  return `${s.title}${page}${note}${s.official ? '' : ' [unofficial]'}`
}
