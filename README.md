# Blackstone Companion

An unofficial companion for Warhammer Quest: Blackstone Fortress that runs the hostiles:
behaviour tables, reinforcement rolls, the combat-turn helpers, and a rules reference
where every entry cites the booklet and page it summarises.

It grew out of [dire/blackstone](https://github.com/dire/blackstone), whose behaviour
tables it reuses (checked cell for cell against that repo's JSON).

## Run it

```
npm install
npm run dev      # local dev server
npm test         # self-checks (src/**/*.check.mjs)
npm run build    # static build in dist/blackstone/
```

Live at **mythwired.com/blackstone/**. The build uses an absolute `/blackstone/` base and
`vercel.json` redirects the domain root there. If another site later takes over the
root of mythwired.com, add this to that site's `vercel.json` and leave this project as is:

```json
{ "rewrites": [
  { "source": "/blackstone", "destination": "https://<this-project>.vercel.app/blackstone/" },
  { "source": "/blackstone/:path*", "destination": "https://<this-project>.vercel.app/blackstone/:path*" }
] }
```

For a build that runs from any folder (e.g. a standalone preview), use `BASE=./ npm run build`.

No backend. Encounter state, settings and transcribed cards live in `localStorage`
(every access is guarded, so private mode still works from memory).

## What it does

- **Encounter**: add hostile groups at whatever size the encounter card shows (up to the
  number of miniatures in the box), and log explorer attacks per model: Hit (success,
  1 wound) and Crit (critical, 2 wounds; hostiles never take grievous wounds). Tick
  In cover and both drop a step (crit 1 wound, hit misses). Slain is flagged at the
  Wounds value; stunned/motivated/empowered flags too. Traitor Guardsmen carry a loadout
  per model (Lasgun, Sergeant, Flamer): groups of 5+ start with the Sergeant and flamer,
  and the group warns when its make-up breaks the rule.
  **Activate** walks a group through its reinforcement roll, then each standing hostile:
  answer the situation questions and the app picks the leftmost column that applies
  (Designers' Commentary), rolls, and shows the action in plain words with page refs.
  Handles the Ambull's two actions, stunned hostiles standing up, the Commissar's
  motivation +2, menace and Fortress Whispers modifiers.
- **Hostiles**: every card with profile, weapons, special rules, behaviour table and a
  practice roll. Filter by expansion.
- **Turn**: destiny dice (duplicates discarded), initiative dealer (with ambush order),
  threat and menace levels, nemesis dice for the White Dwarf hostile-player rules, and
  the core and Escalation event tables.
- **Rules**: searchable reference grouped by topic. Solid tags are Games Workshop
  sources, dashed tags are fan summaries.
- **Card editor**: transcribe a hostile card the app does not have yet; it is validated
  (bands cover 1-20, every cell is a known action) before it is saved.

## Data and sources

| Hostile | Status | Source |
| --- | --- | --- |
| Traitor Guardsmen, Negavolt Cultists, Ur-Ghuls, Spindle Drones, Chaos Beastmen, Rogue Psyker, Chaos Space Marines, Obsidius Mallex | Transcribed | dire/blackstone data; special rules only where the FAQ or summaries confirm them |
| Ambull (+ Enraged variant) | Transcribed | Profile and rules from the Dreaded Ambull booklet p8-9; table from dire/blackstone |
| Traitor Commissar, Chaos Ogryn | From card scan | Traitor Command hostile cards |
| Borewyrm Infestation, Cultist Firebrand, Chaos Cultists, Plague Marines, Poxwalkers | Not transcribed | Card scans were too large to fetch; use the in-app editor |

Things worth knowing before changing data:

- `src/data/hostiles.js` holds numbers and action names only. Action and rule
  descriptions are paraphrased; never paste card text.
- The Traitor Commissar card misprints its rows as 13-16 / 16-17. The app uses 13-15.
- Reinforcements, Large on a 3: the Escalation reference page gives 1, the EOG summary 2.
  The app follows Games Workshop.
- Obsidius Mallex's transcription lists Close before In cover. Since the leftmost column
  wins, check it against the card.
- Attack results live in `src/engine/attack.js`: against hostiles a critical is 2 wounds,
  against explorers 1 grievous wound; cover drops either one step. Saves from the first
  version (which logged grievous wounds on hostiles) are migrated at 2 wounds each.
- The Ambull table has a Protective column whose wording was not transcribed; the app
  asks you to tick it by hand.

Warhammer Quest: Blackstone Fortress and all associated names are trademarks of Games
Workshop. This is a fan tool, not affiliated with or endorsed by Games Workshop.
