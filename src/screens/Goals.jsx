import { IconBack } from '../components/Icons'

export const GOALS = [
  ['forca', 'Ganhar força', 'Resistência para sustentar a série limpa.'],
  ['calistenia', 'Evoluir na calistenia', 'Barra, flexão e apoio, um degrau de cada vez.'],
  ['tonus', 'Definir o corpo', 'Tônus a partir da repetição bem feita.'],
  ['energia', 'Mais disposição', 'Energia para o dia, não só para o treino.'],
  ['bem', 'Bem-estar', 'Qualidade de vida, com o corpo inteiro.'],
]

export default function Goals({ selected, onChange, onClose }) {
  const goals = selected || []

  function toggle(id) {
    onChange(goals.includes(id) ? goals.filter((item) => item !== id) : [...goals, id])
  }

  return (
    <section className="screen onboard">
      <header className="spread">
        <button type="button" className="icon-btn" aria-label="Voltar" onClick={onClose}>
          <IconBack />
        </button>
      </header>
      <p className="tiny">Objetivos</p>
      <h1>Quais são seus objetivos?</h1>
      <p className="sub">Pode marcar mais de um. O primeiro conduz a sessão. Os outros ficam no início, como direção.</p>
      <div className="stack">
        {GOALS.map(([id, title, text]) => (
          <button key={id} type="button" className={goals.includes(id) ? 'choice on' : 'choice'} onClick={() => toggle(id)}>
            <b>{title}</b>
            <span>{text}</span>
          </button>
        ))}
      </div>
      <button type="button" className="btn" disabled={goals.length === 0} onClick={onClose}>
        Guardar
      </button>
    </section>
  )
}
