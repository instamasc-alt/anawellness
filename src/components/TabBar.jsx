import { IconHome, IconTrain, IconCoach, IconPlan, IconUser } from './Icons'

const TABS = [
  ['home', 'Início', IconHome],
  ['train', 'Treino', IconTrain],
  ['coach', 'Coach', IconCoach],
  ['plan', 'Plano', IconPlan],
  ['profile', 'Perfil', IconUser],
]

export default function TabBar({ tab, unread, onChange }) {
  return (
    <nav className="tabs" aria-label="Seções">
      {TABS.map(([id, label, Icon]) => (
        <button key={id} type="button" className={tab === id ? 'tab on' : 'tab'} onClick={() => onChange(id)}>
          <span className="tab-icon">
            <Icon />
            {id === 'coach' && unread > 0 ? <i className="dot" /> : null}
          </span>
          {label}
        </button>
      ))}
    </nav>
  )
}
