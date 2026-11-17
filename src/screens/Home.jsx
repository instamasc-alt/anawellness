import AssessmentCard from '../components/AssessmentCard'
import { Pose } from '../components/Icons'
import { IconBell } from '../components/Icons'
import { adaptLine, blocksOf, buildWorkout, greeting, levelOf, trainedToday } from '../engine'

export default function Home({ data, onStart, onBell, onTrain, onAssess, onPlan }) {
  if (!data.onboarded) {
    return (
      <section className="screen">
        <header className="spread">
          <img className="logo" src="/logo-ana-light.png" alt="ana. wellness" />
          <button type="button" className="icon-btn" aria-label="Recados" onClick={onBell}>
            <IconBell />
          </button>
        </header>
        <div>
          <p className="tiny">Calistenia em casa</p>
          <h1>{greeting(data.name)}</h1>
        </div>
        <AssessmentCard onAssess={onAssess} />
        <button type="button" className="btn ghost" onClick={onPlan}>
          Ver o plano
        </button>
      </section>
    )
  }

  const workout = buildWorkout(data)
  const level = levelOf(data)
  const done = trainedToday(data)
  const meters = [
    ['Empurrar', data.skill.push],
    ['Puxar', data.skill.pull],
    ['Pernas', data.skill.legs],
    ['Core', data.skill.core],
  ]

  return (
    <section className="screen">
      <header className="spread">
        <img className="logo" src="/logo-ana-light.png" alt="ana. wellness" />
        <button type="button" className="icon-btn" aria-label="Recados" onClick={onBell}>
          <IconBell />
          {data.coachUnread > 0 ? <i className="dot" /> : null}
        </button>
      </header>

      <div>
        <p className="tiny">Calistenia em casa</p>
        <h1>{greeting(data.name)}</h1>
      </div>

      <article className="mission">
        <div className="spread">
          <span className="tiny">{done ? 'Missão de hoje feita' : 'Missão de hoje'}</span>
          <span className="badge">{workout.minutes} min</span>
        </div>
        <h2>{workout.title}</h2>
        <p className="sub tight">{workout.summary}</p>
        <p className="cue">{adaptLine(data)}</p>
        <button type="button" className="btn" onClick={() => onStart(workout.id)}>
          {done ? 'Treino extra' : 'Começar missão'}
        </button>
      </article>

      <div className="stats">
        <div className="stat">
          <b>{data.week}</b>
          <span>semana</span>
        </div>
        <div className="stat">
          <b>{data.streak}</b>
          <span>{data.streak === 1 ? 'dia seguido' : 'dias seguidos'}</span>
        </div>
        <div className="stat">
          <b>{data.level}</b>
          <span>{level.name}</span>
        </div>
      </div>

      <section className="panel">
        <h3>Capacidade</h3>
        <p className="fine">{level.line}</p>
        <div className="meters">
          {meters.map(([label, value]) => (
            <div className="meter" key={label}>
              <span>{label}</span>
              <div className="track">
                <div className="fill" style={{ width: `${value}%` }} />
              </div>
              <b>{value}</b>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="spread">
          <h3>Por dentro de hoje</h3>
          <Pose name={workout.art} />
        </div>
        <ol className="blocks">
          {blocksOf(workout).map((block) => (
            <li key={block.name}>
              <b>{block.name}</b>
              <span>{block.items.join(' · ')}</span>
            </li>
          ))}
        </ol>
        <button type="button" className="btn ghost" onClick={onTrain}>
          Ver a biblioteca
        </button>
      </section>
    </section>
  )
}
