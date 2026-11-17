import { useEffect, useState } from 'react'
import { PATTERN_BLURB, exercises } from '../data'
import { easierThan, harderThan } from '../engine'
import { patternPhoto, patternVideo } from '../media'
import { IconBack, IconHeart, IconPlay } from '../components/Icons'

const TABS = ['Como fazer', 'Músculos', 'Ajustes']

export default function Exercise({ id, gender, favorite, onBack, onStart, onToggleFav, onOpen }) {
  const [tab, setTab] = useState('Como fazer')
  const [playing, setPlaying] = useState(false)
  const exercise = exercises[id]
  const easier = easierThan(id)
  const harder = harderThan(id)
  useEffect(() => {
    setPlaying(false)
  }, [id])

  if (!exercise) return null
  const video = patternVideo(gender, exercise.pattern)
  const photo = patternPhoto(gender, exercise.pattern)

  return (
    <section className="screen">
      <header className="spread">
        <button type="button" className="icon-btn" aria-label="Voltar" onClick={onBack}>
          <IconBack />
        </button>
        <button
          type="button"
          className={favorite ? 'icon-btn on' : 'icon-btn'}
          aria-label="Salvar movimento"
          onClick={onToggleFav}
        >
          <IconHeart on={favorite} />
        </button>
      </header>
      <div className="hero">
        {playing && video ? (
          <video src={video} poster={photo} controls autoPlay playsInline />
        ) : (
          <img src={photo} alt="" />
        )}
        {video && !playing ? (
          <button type="button" className="round big play-on-photo" aria-label="Ver execução" onClick={() => setPlaying(true)}>
            <IconPlay />
          </button>
        ) : null}
      </div>
      <p className="tiny">{exercise.pattern}</p>
      <div className="spread">
        <h1>{exercise.name}</h1>
      </div>
      <p className="sub tight">{exercise.equipment}</p>
      <div className="pills">
        {TABS.map((item) => (
          <button key={item} type="button" className={tab === item ? 'pill on' : 'pill'} onClick={() => setTab(item)}>
            {item}
          </button>
        ))}
      </div>

      {tab === 'Como fazer' ? (
        <ol className="steps">
          {exercise.steps.map((step, index) => (
            <li key={step}>
              <b>{index + 1}</b>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      ) : null}

      {tab === 'Músculos' ? (
        <div className="stack">
          <p>{PATTERN_BLURB[exercise.pattern]}</p>
          <div className="pills">
            {exercise.muscles.map((muscle) => (
              <span key={muscle} className="pill static">
                {muscle}
              </span>
            ))}
          </div>
          {exercise.tips.map((tip) => (
            <p key={tip} className="cue">
              {tip}
            </p>
          ))}
        </div>
      ) : null}

      {tab === 'Ajustes' ? (
        <div className="stack">
          <p className="cue">Evite: {exercise.avoid}</p>
          {exercise.ceiling ? <p className="cue">{exercise.ceiling}</p> : null}
          <div className="chain">
            <ChainItem exercise={easier} label="Mais fácil" onOpen={onOpen} />
            <div className="chain-now">
              <b>Você está aqui</b>
              <span>{exercise.name}</span>
            </div>
            <ChainItem exercise={harder} label="Mais difícil" onOpen={onOpen} />
          </div>
          <p className="fine">O plano só troca o exercício quando a faixa de cima fica limpa, ou na fase de padrão.</p>
        </div>
      ) : null}

      <button type="button" className="btn" onClick={onStart}>
        Praticar agora
      </button>
    </section>
  )
}

function ChainItem({ exercise, label, onOpen }) {
  if (!exercise) {
    return (
      <div className="chain-item mute">
        <b>{label}</b>
        <span>Fim da cadeia</span>
      </div>
    )
  }
  return (
    <button type="button" className="chain-item" onClick={() => onOpen(exercise.id)}>
      <b>{label}</b>
      <span>{exercise.name}</span>
    </button>
  )
}
