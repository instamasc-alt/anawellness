import { useEffect, useRef, useState } from 'react'
import { exercises } from '../data'
import { afterWork, formatClock, initialRun, primaryAction, retreat, tick } from '../engine'
import { IconClose, IconNext, IconPause, IconPlay, IconPrev } from '../components/Icons'
import { exerciseVideo, patternPhoto } from '../media'
import Ring from '../components/Ring'

export default function Session({ workout, gender, onClose, onComplete }) {
  const [run, setRun] = useState(() => initialRun(workout))
  const [ask, setAsk] = useState(false)
  const [feeling, setFeeling] = useState('')
  const [test, setTest] = useState({ push: '', squat: '', row: '', plank: '' })
  const audio = useRef(null)
  const previous = useRef(run.mode)

  useEffect(() => {
    const step = workout.steps[run.i]
    const timing = run.mode === 'rest' || (run.mode === 'work' && step?.kind === 'timer')
    if (!timing || run.paused || run.mode === 'done') return undefined
    const id = setInterval(() => setRun((current) => tick(current, workout)), 1000)
    return () => clearInterval(id)
  }, [run.i, run.mode, run.paused, workout])

  useEffect(() => {
    if (previous.current === 'rest' && run.mode !== 'rest') beep(audio)
    previous.current = run.mode
  }, [run.mode, run.i])

  if (run.mode === 'done') {
    return (
      <section className="screen">
        <p className="tiny">Sessão fechada</p>
        <h1>{workout.title}</h1>
        <p className="sub">
          {run.finished.length} séries registradas. Como ficou a posição no fim?
        </p>
        <div className="stack">
          {[
            ['pesado', 'Pesado', 'A forma quebrou ou sobrou pouco.'],
            ['certo', 'No ponto', 'Difícil, e a posição ficou inteira.'],
            ['facil', 'Fácil', 'Dava mais repetição com a mesma forma.'],
          ].map(([id, title, text]) => (
            <button key={id} type="button" className={feeling === id ? 'choice on' : 'choice'} onClick={() => setFeeling(id)}>
              <b>{title}</b>
              <span>{text}</span>
            </button>
          ))}
        </div>
        {workout.id === 'T' ? (
          <div className="stack">
            <h3>Números da prova</h3>
            <NumberField label="Empurrões limpos" value={test.push} onChange={(push) => setTest({ ...test, push })} />
            <NumberField label="Agachamentos limpos" value={test.squat} onChange={(squat) => setTest({ ...test, squat })} />
            <NumberField label="Puxadas limpas" value={test.row} onChange={(row) => setTest({ ...test, row })} />
            <NumberField label="Prancha em segundos" value={test.plank} onChange={(plank) => setTest({ ...test, plank })} />
          </div>
        ) : null}
        <button type="button" className="btn" disabled={!feeling} onClick={() => onComplete({ feeling, test })}>
          Registrar
        </button>
      </section>
    )
  }

  const step = workout.steps[run.i]
  const exercise = exercises[step.exerciseId]
  const nextStep = workout.steps[run.i + 1]
  const shown = run.mode === 'rest' && nextStep ? exercises[nextStep.exerciseId] : exercise
  const total = run.mode === 'rest' ? step.rest : step.kind === 'timer' ? step.seconds : 1
  const progress = run.mode === 'work' && step.kind === 'mark' ? 1 : total ? run.left / total : 0
  const value = run.mode === 'work' && step.kind === 'mark' ? step.reps : formatClock(run.left)
  const label = run.mode === 'rest' ? 'Descanso' : step.kind === 'timer' ? 'Tempo' : 'Repetições'
  const sub = step.set ? `Série ${step.set} de ${step.totalSets}` : step.block
  const action = run.mode === 'rest' ? 'Pular descanso' : step.kind === 'timer' ? 'Terminei antes' : 'Fiz a série'

  return (
    <section className="screen session">
      <header className="spread">
        <div>
          <p className="tiny">{step.block}</p>
          <h2 className="session-title">{run.mode === 'rest' ? 'Descanse' : exercise.name}</h2>
        </div>
        <button type="button" className="icon-btn" aria-label="Sair da sessão" onClick={() => setAsk(true)}>
          <IconClose />
        </button>
      </header>
      {step.tag ? <span className="badge">{step.tag}</span> : null}
      <MoveMedia key={`${shown.id}-${run.mode}`} exercise={shown} gender={gender} paused={run.paused} />
      {run.mode === 'rest' && nextStep ? (
        <article className="next-card">
          <img className="move-thumb" src={patternPhoto(gender, shown.pattern)} alt="" />
          <div>
            <span className="tiny">Próximo movimento</span>
            <b>{shown.name}</b>
          </div>
        </article>
      ) : null}
      {run.mode === 'work' && step.note ? <p className="cue">{step.note}</p> : null}
      {run.mode === 'work' ? (
        <>
          <p className="tiny">Como fazer</p>
          <ol className="steps">
            {exercise.steps.map((line, index) => (
              <li key={line}>
                <b>{index + 1}</b>
                <span>{line}</span>
              </li>
            ))}
          </ol>
          {exercise.tips[0] ? <p className="cue">{exercise.tips[0]}</p> : null}
          {exercise.avoid ? <p className="fine">Evite: {exercise.avoid}</p> : null}
        </>
      ) : (
        <p className="sub tight">A próxima série entra sozinha.</p>
      )}

      <Ring progress={progress} value={value} label={label} sub={sub} />

      <div className="transport">
        <button type="button" className="round" aria-label="Voltar" onClick={() => setRun((current) => retreat(current, workout))}>
          <IconPrev />
        </button>
        <button
          type="button"
          className="round big"
          aria-label={run.paused ? 'Continuar' : 'Pausar'}
          onClick={() => setRun((current) => ({ ...current, paused: !current.paused }))}
        >
          {run.paused ? <IconPlay /> : <IconPause />}
        </button>
        <button type="button" className="round" aria-label="Avançar" onClick={() => setRun((current) => primaryAction(current, workout))}>
          <IconNext />
        </button>
      </div>
      <button type="button" className="btn" onClick={() => setRun((current) => (run.mode === 'rest' ? primaryAction(current, workout) : afterWork(current, workout)))}>
        {action}
      </button>

      <ol className="checks">
        {workout.steps.filter((item) => item.checklist).map((item) => {
          const done = run.finished.includes(item.id)
          const current = item.id === step.id && run.mode !== 'rest'
          return (
            <li key={item.id} className={done ? 'check done' : current ? 'check now' : 'check'}>
              <i />
              <span>
                {exercises[item.exerciseId].short}
                {item.set ? ` · ${item.set}/${item.totalSets}` : ''}
                {item.tag ? ` · ${item.tag}` : ''}
              </span>
            </li>
          )
        })}
      </ol>

      {ask ? (
        <div className="modal-back">
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="leave-title">
            <h3 id="leave-title">Sair da sessão?</h3>
            <p>O que ficou pela metade não avança o plano.</p>
            <button type="button" className="btn" onClick={() => setAsk(false)}>
              Continuar
            </button>
            <button type="button" className="btn ghost" onClick={onClose}>
              Sair
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}

function MoveMedia({ exercise, gender, paused }) {
  const videoRef = useRef(null)
  const video = exerciseVideo(gender, exercise.id)
  const photo = patternPhoto(gender, exercise.pattern)

  useEffect(() => {
    const node = videoRef.current
    if (!node) return undefined
    if (paused) {
      node.pause()
      return undefined
    }
    node.play().catch(() => {})
    return undefined
  }, [paused, video])

  if (video) {
    return (
      <div className="session-media">
        <video ref={videoRef} src={video} poster={photo} playsInline muted loop />
      </div>
    )
  }
  return (
    <div className="session-media">
      <img src={photo} alt="" />
    </div>
  )
}

function NumberField({ label, value, onChange }) {
  return (
    <label className="stack tight-stack">
      <span className="tiny">{label}</span>
      <input
        className="field"
        inputMode="numeric"
        value={value}
        onChange={(event) => onChange(event.target.value.replace(/\D/g, '').slice(0, 3))}
      />
    </label>
  )
}

function beep(audio) {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    if (!audio.current) audio.current = new Ctx()
    const ctx = audio.current
    if (ctx.state === 'suspended') ctx.resume()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.frequency.value = 740
    gain.gain.value = 0.04
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.12)
  } catch {
    /* sem áudio */
  }
}
