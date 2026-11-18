import AssessmentCard from '../components/AssessmentCard'
import { IconBell, IconCheck } from '../components/Icons'
import { blocksOf, buildWorkout, levelOf } from '../engine'
import { patternPhoto } from '../media'

const PHASES = [
  {
    title: 'Base do movimento',
    text: 'Semanas 1 e 2. Aprender a posição e fechar as séries sem pressa.',
    from: 1,
    to: 2,
    art: 'Empurrar',
  },
  {
    title: 'Construção',
    text: 'Semanas 3 a 6. Primeiro sobe a repetição. Depois entra mais uma série.',
    from: 3,
    to: 6,
    art: 'Motor',
  },
  {
    title: 'Padrão',
    text: 'Semanas 7 e 8. Prova curta e o primeiro contato com o exercício seguinte.',
    from: 7,
    to: 8,
    art: 'Puxar',
  },
]

export default function Plan({ data, onStart, onBell, onAssess }) {
  const locked = !data.onboarded
  const workout = locked ? null : buildWorkout(data)
  const level = levelOf(data)

  return (
    <section className="screen">
      <header className="end">
        <button type="button" className="icon-btn" aria-label="Recados" onClick={onBell}>
          <IconBell />
          {data.coachUnread > 0 ? <i className="dot" /> : null}
        </button>
      </header>
      <div>
        <h1>Seu plano</h1>
        <p className="sub">
          {locked
            ? 'Oito semanas abrem o caminho. Depois a semana segue. A avaliação marca o seu nível.'
            : `Semana ${data.week}. Nível ${level.name}. ${data.days} dias por semana.`}
        </p>
      </div>

      {locked ? <AssessmentCard onAssess={onAssess} /> : null}

      <div className="stack">
        {PHASES.map((phase) => {
          const current = !locked && (phase.to === 8 ? data.week >= phase.from : data.week >= phase.from && data.week <= phase.to)
          const past = !locked && phase.to < 8 && data.week > phase.to
          return (
            <article key={phase.title} className={current ? 'phase on' : 'phase'}>
              <div className="thumb">
                <img src={patternPhoto(data.gender, phase.art)} alt="" />
              </div>
              <div className="phase-copy">
                <b>{phase.title}</b>
                <span>{phase.text}</span>
              </div>
              <span className={current || past ? 'tick on' : 'tick'}>{current || past ? <IconCheck /> : null}</span>
            </article>
          )
        })}
      </div>

      <div className="week-rail" aria-label={locked ? 'Semana ainda não começou' : `Semana ${data.week}`}>
        {Array.from({ length: 8 }, (_, index) => (
          <i
            key={index}
            className={locked ? '' : data.week > 8 || index + 1 < data.week ? 'done' : index + 1 === data.week ? 'now' : ''}
          />
        ))}
      </div>
      <p className="fine center">
        {locked ? 'A semana começa depois da avaliação.' : data.week > 8 ? `Semana ${data.week}. O padrão continua.` : `Semana ${data.week} de 8`}
      </p>

      {locked ? null : (
        <button type="button" className="btn" onClick={() => onStart(workout.id)}>
          Começar missão
        </button>
      )}

      {locked ? null : (
        <section className="panel">
          <h3>Sessão de hoje · {workout.title}</h3>
          <p className="sub tight">
            {workout.minutes} min · {workout.focus}
          </p>
          <ol className="blocks">
            {blocksOf(workout).map((block) => (
              <li key={block.name}>
                <b>{block.name}</b>
                <span>{block.items.join(' · ')}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <p className="fine">
        A sessão segue a ordem do preparo militar: aquecer, esforçar, fortalecer o tronco e soltar.
        A repetição sobe antes do exercício. Dois treinos fáceis adiantam a semana. Dois pesados descem um degrau.
      </p>
    </section>
  )
}
