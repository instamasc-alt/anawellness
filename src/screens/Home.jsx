import AssessmentCard from '../components/AssessmentCard'
import { Pose } from '../components/Icons'
import { adaptLine, aimLine, blocksOf, buildWorkout, greeting, levelOf, trainedToday } from '../engine'
import { GOALS } from './Goals'

export default function Home({ data, onStart, onTrain, onAssess, onPlan, onGoals }) {
  if (!data.onboarded) {
    return (
      <section className="screen">
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
  const aim = aimLine(data)
  const chosen = GOALS.filter(([id]) => (data.goals || []).includes(id)).sort(
    (a, b) => data.goals.indexOf(a[0]) - data.goals.indexOf(b[0]),
  )
  const meters = [
    ['Empurrar', data.skill.push],
    ['Puxar', data.skill.pull],
    ['Pernas', data.skill.legs],
    ['Core', data.skill.core],
  ]

  return (
    <section className="screen">
      <div>
        <p className="tiny">Calistenia em casa</p>
        <h1>{greeting(data.name)}</h1>
        {data.job ? <p className="fine">{data.job}</p> : null}
      </div>
      {chosen.length ? (
        <div className="pills">
          {chosen.map(([id, title], index) => (
            <span key={id} className="badge">
              {index === 0 ? `${title} · hoje` : title}
            </span>
          ))}
        </div>
      ) : (
        <button type="button" className="btn ghost" onClick={onGoals}>
          Marcar o objetivo
        </button>
      )}

      <article className="mission">
        <div className="spread">
          <span className="tiny">{done ? 'Missão de hoje feita' : 'Missão de hoje'}</span>
          <span className="badge">{workout.minutes} min</span>
        </div>
        <h2>{workout.title}</h2>
        <p className="sub tight">{workout.summary}</p>
        <p className="cue">{adaptLine(data)}</p>
        {aim ? <p className="fine">{aim}</p> : null}
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
