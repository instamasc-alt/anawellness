import { useState } from 'react'

const STEPS = [
  {
    key: 'name',
    kicker: 'Entrada',
    title: 'Como te chamo no treino?',
    text: 'O plano começa no seu ponto, não num exercício de internet.',
  },
  {
    key: 'start',
    kicker: 'Ponto de partida',
    title: 'De onde você parte?',
    text: 'Seja honesto. Começar baixo demais é fácil de corrigir. Começar alto demais quebra a semana.',
  },
  {
    key: 'days',
    kicker: 'Frequência',
    title: 'Quantos dias você sustenta?',
    text: 'Folga entre as sessões faz parte do método. Músculo e tendão crescem no intervalo.',
  },
  {
    key: 'pull',
    kicker: 'Puxada',
    title: 'Como você puxa em casa?',
    text: 'Empurrar no chão é fácil de achar. Puxar é o que falta na maioria dos treinos caseiros.',
  },
]

const STARTS = [
  ['zero', 'Nunca treinei de verdade', 'Parede, cadeira e a puxada mais fácil.'],
  ['base', 'Treino sem constância', 'Mesa, agachamento livre e remada.'],
  ['ativo', 'Já faço flexão no chão', 'Linha do corpo e a puxada mais baixa.'],
]

const DAYS = [
  [3, '3 dias', 'Um dia de folga entre as sessões. A melhor entrada.'],
  [4, '4 dias', 'Três de força e um de mobilidade.'],
]

const PULLS = [
  ['porta', 'Porta firme', 'Toalha na maçaneta. A puxada de quem não tem barra.'],
  ['barra', 'Barra', 'Suspensão, negativa e barra estrita.'],
  ['chao', 'Só o chão', 'Remada deitado. A porta abre o degrau seguinte.'],
]

export default function Onboarding({ onDone }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({ name: '', start: '', days: 0, pull: '' })
  const current = STEPS[step]
  const ready =
    (step === 0) ||
    (step === 1 && answers.start) ||
    (step === 2 && answers.days) ||
    (step === 3 && answers.pull)

  function next() {
    if (!ready) return
    if (step < 3) setStep(step + 1)
    else onDone(answers)
  }

  return (
    <section className="screen onboard">
      <img className="logo" src="/logo-ana-light.png" alt="ana. wellness" />
      <div className="dots" aria-hidden="true">
        {STEPS.map((item, index) => (
          <i key={item.key} className={index <= step ? 'on' : ''} />
        ))}
      </div>
      <p className="tiny">{current.kicker}</p>
      <h1>{current.title}</h1>
      <p className="sub">{current.text}</p>

      {step === 0 ? (
        <label className="stack">
          <span className="tiny">Nome</span>
          <input
            className="field"
            value={answers.name}
            placeholder="Pode deixar em branco"
            onChange={(event) => setAnswers({ ...answers, name: event.target.value })}
          />
        </label>
      ) : null}

      {step === 1 ? <Choices options={STARTS} value={answers.start} onPick={(start) => setAnswers({ ...answers, start })} /> : null}
      {step === 2 ? <Choices options={DAYS} value={answers.days} onPick={(days) => setAnswers({ ...answers, days })} /> : null}
      {step === 3 ? (
        <>
          <Choices options={PULLS} value={answers.pull} onPick={(pull) => setAnswers({ ...answers, pull })} />
          <p className="fine">Porta travada, abrindo para o lado oposto, com um calço no pé. Se a maçaneta mexer, pare.</p>
        </>
      ) : null}

      <div className="onboard-actions">
        {step > 0 ? (
          <button type="button" className="btn ghost" onClick={() => setStep(step - 1)}>
            Voltar
          </button>
        ) : null}
        <button type="button" className="btn" disabled={!ready} onClick={next}>
          {step === 3 ? 'Montar meu plano' : 'Continuar'}
        </button>
      </div>
    </section>
  )
}

function Choices({ options, value, onPick }) {
  return (
    <div className="stack">
      {options.map(([id, title, text]) => (
        <button key={id} type="button" className={value === id ? 'choice on' : 'choice'} onClick={() => onPick(id)}>
          <b>{title}</b>
          <span>{text}</span>
        </button>
      ))}
    </div>
  )
}
