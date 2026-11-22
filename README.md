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
npm run build    # static build in dist/, deployable to Vercel or GitHub Pages as is
```

No backend. Encounter state, settings and transcribed cards live in `localStorage`
(every access is guarded, so private mode still works from memory).

## What it does

- **Encounter**: add hostile groups, track wounds and grievous wounds per model (3 damage
  per grievous, slain flagged automatically), stunned/motivated/empowered flags.
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
- The Ambull table has a Protective column whose wording was not transcribed; the app
  asks you to tick it by hand.

Warhammer Quest: Blackstone Fortress and all associated names are trademarks of Games
Workshop. This is a fan tool, not affiliated with or endorsed by Games Workshop.
