import { useCallback, useEffect, useReducer, useState } from 'react'
import { encounterReducer, initialEncounter } from './engine/encounter.js'
import { initialState, save, DEFAULT_SETTINGS } from './store.js'
import { EncounterView } from './components/EncounterView.jsx'
import { CodexView } from './components/CodexView.jsx'
import { TurnView } from './components/TurnView.jsx'
import { RulesView } from './components/RulesView.jsx'
import { CardEditor } from './components/CardEditor.jsx'
import { Icon, Sheet, Seg, D20, Toast, useRoller, Refs } from './components/ui.jsx'

function appReducer(state, action) {
  switch (action.type) {
    case 'settings':
      return { ...state, settings: { ...state.settings, ...action.patch } }
    case 'saveCustom':
      return { ...state, custom: { ...state.custom, [action.record.id]: action.record } }
    case 'deleteCustom': {
      const custom = { ...state.custom }
      delete custom[action.id]
      return { ...state, custom }
    }
    case 'resetAll':
      return { encounter: initialEncounter, settings: DEFAULT_SETTINGS, custom: {} }
    default:
      return { ...state, encounter: encounterReducer(state.encounter, action) }
  }
}

const TABS = [
  { id: 'encounter', label: 'Encounter', icon: 'swords' },
  { id: 'codex', label: 'Hostiles', icon: 'skull' },
  { id: 'turn', label: 'Turn', icon: 'hourglass' },
  { id: 'rules', label: 'Rules', icon: 'book' },
]

export default function App() {
  const [state, dispatch] = useReducer(appReducer, undefined, initialState)
  const [tab, setTab] = useState(() => {
    const h = window.location.hash.replace('#', '')
    return TABS.some((t) => t.id === h) ? h : 'encounter'
  })
  const [editing, setEditing] = useState(undefined) // undefined = closed, null = new card, id = transcribe
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [quick, setQuick] = useState(false)
  const [toast, setToast] = useState(null)
  const [die, roll] = useRoller(20)

  useEffect(() => { save(state) }, [state])
  useEffect(() => {
    if (window.location.hash !== `#${tab}`) window.history.replaceState(null, '', `#${tab}`)
    window.scrollTo({ top: 0 })
  }, [tab])

  const setSettings = useCallback((patch) => dispatch({ type: 'settings', patch }), [])
  const clearToast = useCallback(() => setToast(null), [])
  const groupsAlive = state.encounter.groups.length

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <svg className="brand-mark" viewBox="0 0 64 64" aria-hidden="true">
            <path d="M32 6 58 54H6Z" fill="none" stroke="#a46bd6" strokeWidth="5" strokeLinejoin="round" />
            <path d="M32 24 44 46H20Z" fill="#a46bd6" opacity=".35" />
          </svg>
          <div>
            <div className="brand-title">Blackstone Companion</div>
            <div className="brand-sub">Unofficial · hostile behaviour</div>
          </div>
        </div>
        <span className="spacer" />
        {state.settings.hostilePlayer && <span className="badge badge-user" title="Expanded hostile player rules on">Hostile player</span>}
        <button type="button" className="icon-btn" onClick={() => setSettingsOpen(true)} aria-label="Settings"><Icon name="gear" /></button>
      </header>

      <nav className="tabbar" aria-label="Sections">
        {TABS.map((t) => (
          <button key={t.id} type="button" className="tab" aria-current={tab === t.id ? 'page' : undefined} onClick={() => setTab(t.id)}>
            <Icon name={t.icon} />
            <span>{t.label}</span>
            {t.id === 'encounter' && groupsAlive > 0 && <span className="tab-count">{groupsAlive} grp</span>}
          </button>
        ))}
      </nav>

      <main className="main">
        {tab === 'encounter' && (
          <EncounterView state={state} dispatch={dispatch} settings={state.settings} custom={state.custom} onTranscribe={(id) => setEditing(id)} />
        )}
        {tab === 'codex' && (
          <CodexView custom={state.custom} onTranscribe={(id) => setEditing(id)} onDeleteCustom={(id) => { dispatch({ type: 'deleteCustom', id }); setToast('Transcription deleted') }} />
        )}
        {tab === 'turn' && <TurnView state={state} dispatch={dispatch} settings={state.settings} setSettings={setSettings} custom={state.custom} />}
        {tab === 'rules' && <RulesView />}
      </main>

      <button type="button" className="fab" onClick={() => setQuick((q) => !q)} aria-expanded={quick} aria-label="Quick Blackstone dice roll">d20</button>
      {quick && (
        <div className="fab-pop" role="dialog" aria-label="Quick roll">
          <span className="eyebrow">Blackstone dice</span>
          <D20 value={die.value} rolling={die.rolling} onRoll={() => roll()} />
          <button type="button" className="btn btn-sm btn-block" onClick={() => roll()}>Roll again</button>
        </div>
      )}

      {editing !== undefined && (
        <CardEditor
          id={editing}
          custom={state.custom}
          onClose={() => setEditing(undefined)}
          onSave={(record) => { dispatch({ type: 'saveCustom', record }); setEditing(undefined); setToast(`${record.name} saved`) }}
        />
      )}

      {settingsOpen && (
        <Sheet title="Settings" onClose={() => setSettingsOpen(false)}>
          <div className="row-between">
            <div>
              <div className="h3" style={{ color: 'var(--bone)' }}>Expanded hostile player rules</div>
              <div className="small muted">Nemesis dice, Fortress Whispers modifiers, free activation order. <Refs refs={[{ src: 'WD', page: 120 }]} /></div>
            </div>
            <Seg label="Hostile player" value={state.settings.hostilePlayer} onChange={(v) => setSettings({ hostilePlayer: v })} options={[{ value: false, label: 'Off' }, { value: true, label: 'On' }]} />
          </div>
          <div className="row-between">
            <div>
              <div className="h3" style={{ color: 'var(--bone)' }}>Event table</div>
              <div className="small muted">Escalation replaces Escape Chamber with Alarm Tripped.</div>
            </div>
            <Seg label="Event table" value={state.settings.eventTable} onChange={(v) => setSettings({ eventTable: v })} options={[{ value: 'core', label: 'Core' }, { value: 'escalation', label: 'Escalation' }]} />
          </div>
          <hr className="divider" />
          <p className="small muted" style={{ margin: 0 }}>
            Everything is saved in this browser only: the encounter, settings and any cards you transcribe. This is an unofficial fan tool; Warhammer Quest: Blackstone Fortress and its names belong to Games Workshop.
          </p>
          <button type="button" className="btn btn-danger" onClick={() => { if (window.confirm('Clear the encounter, settings and your transcribed cards?')) { dispatch({ type: 'resetAll' }); setSettingsOpen(false); setToast('All data cleared') } }}>
            Reset everything
          </button>
        </Sheet>
      )}
      {toast && <Toast text={toast} onDone={clearToast} />}
    </div>
  )
}
