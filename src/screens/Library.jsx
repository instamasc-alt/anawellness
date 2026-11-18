import { useMemo, useState } from 'react'
import { PATTERN_ORDER, exercises } from '../data'
import { FILTERS, levelSeal, listWorkouts, todayCode } from '../engine'
import { IconHeart } from '../components/Icons'
import { workoutPhoto, patternPhoto } from '../media'
import AssessmentCard from '../components/AssessmentCard'

export default function Library({ data, onOpenWorkout, onOpenExercise, onToggleFav, onAssess }) {
  const [filter, setFilter] = useState('Tudo')
  const [query, setQuery] = useState('')
  const today = todayCode(data)
  const needle = query.trim().toLowerCase()
  const filters = data.favorites.length ? [...FILTERS, 'Salvos'] : FILTERS

  const workouts = useMemo(() => {
    return listWorkouts(data).filter((workout) => {
      if (filter === 'Salvos') return data.favorites.includes(`w:${workout.id}`)
      if (filter !== 'Tudo' && workout.filter !== filter) return false
      if (!needle) return true
      return `${workout.title} ${workout.summary} ${workout.focus}`.toLowerCase().includes(needle)
    })
  }, [data, filter, needle])

  const groups = useMemo(() => {
    const all = Object.values(exercises).filter((exercise) => {
      if (filter === 'Salvos') return data.favorites.includes(`e:${exercise.id}`)
      if (filter === 'Força') return exercise.pattern === 'Empurrar' || exercise.pattern === 'Puxar'
      if (filter === 'Motor') return exercise.pattern === 'Pernas' || exercise.pattern === 'Motor'
      if (filter === 'Mobilidade') return exercise.pattern === 'Preparação' || exercise.pattern === 'Recuperação'
      if (filter === 'Prova') return false
      if (!needle) return true
      return `${exercise.name} ${exercise.pattern} ${exercise.muscles.join(' ')} ${exercise.equipment}`
        .toLowerCase()
        .includes(needle)
    })
    return PATTERN_ORDER.map((pattern) => ({
      pattern,
      items: all.filter((exercise) => exercise.pattern === pattern),
    })).filter((group) => group.items.length)
  }, [data.favorites, filter, needle])

  return (
    <section className="screen">
      <div>
        <p className="tiny">Biblioteca</p>
        <h1>Treinos</h1>
      </div>
      <p className="sub tight">
        {data.onboarded
          ? 'Sessões desenhadas para casa. O movimento certo muda com o seu nível.'
          : 'A biblioteca abre com a avaliação. O plano continua visível.'}
      </p>
      {data.onboarded ? null : <AssessmentCard onAssess={onAssess} />}
      {data.onboarded ? (
      <>
      <input
        className="field"
        value={query}
        placeholder="Buscar sessão ou movimento"
        onChange={(event) => setQuery(event.target.value)}
      />
      <div className="pills">
        {filters.map((item) => (
          <button key={item} type="button" className={filter === item ? 'pill on' : 'pill'} onClick={() => setFilter(item)}>
            {item}
          </button>
        ))}
      </div>

      {groups.map((group) => (
        <section key={group.pattern} className="stack">
          <h3>{group.pattern}</h3>
          {group.items.map((exercise) => (
            <button key={exercise.id} type="button" className="move-card" onClick={() => onOpenExercise(exercise.id)}>
              <div className="move-photo">
                <img src={patternPhoto(data.gender, exercise.pattern)} alt="" />
                <span className="badge">{levelSeal(exercise.id)}</span>
              </div>
              <span className="move-copy">
                <b>{exercise.name}</b>
                <span>{exercise.equipment}</span>
              </span>
            </button>
          ))}
        </section>
      ))}

      <h3>Sessões</h3>
      <div className="stack">
        {workouts.map((workout) => (
          <article key={workout.id} className="work">
            <button type="button" className="work-hit" onClick={() => onOpenWorkout(workout)}>
              <div className="work-art">
                <img src={workoutPhoto(data.gender, workout.id)} alt="" />
              </div>
              <div className="work-copy">
                <div className="spread">
                  <b>{workout.title}</b>
                  {workout.id === today ? <span className="badge">Hoje</span> : null}
                </div>
                <span>{workout.summary}</span>
                <small>
                  {workout.minutes} min · {workout.levelName}
                </small>
              </div>
            </button>
            <button
              type="button"
              className={data.favorites.includes(`w:${workout.id}`) ? 'heart on' : 'heart'}
              aria-label="Salvar sessão"
              onClick={() => onToggleFav(`w:${workout.id}`)}
            >
              <IconHeart on={data.favorites.includes(`w:${workout.id}`)} />
            </button>
          </article>
        ))}
        {workouts.length === 0 ? <p className="fine">Nenhuma sessão com esse filtro.</p> : null}
      </div>
      </>
      ) : null}
    </section>
  )
}
