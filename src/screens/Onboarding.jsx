import { useState } from 'react'

const STEPS = [
  {
    key: 'gender',
    kicker: 'Avaliação',
    title: 'Quem aparece nos treinos?',
    text: 'A biblioteca usa fotos e a demonstração do seu grupo. Dá para trocar depois no perfil.',
  },
  {
    key: 'start',
    kicker: 'Avaliação',
    title: 'De onde você parte?',
    text: 'Seja honesto. Começar baixo demais é fácil de corrigir. Começar alto demais quebra a semana.',
  },
  {
    key: 'days',
    kicker: 'Avaliação',
    title: 'Quantos dias você sustenta?',
    text: 'Folga entre as sessões faz parte do método. Músculo e tendão crescem no intervalo.',
  },
  {
    key: 'pull',
    kicker: 'Avaliação',
    title: 'O que você tem para puxar?',
    text: 'A flexão usa o chão. A puxada usa o que existe na sua casa. Toque na opção que descreve o seu lugar.',
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

const GENDERS = [
  ['m', 'Masculino', 'Fotos e vídeo de homens na execução.'],
  ['f', 'Feminino', 'Fotos de mulheres na execução.'],
]

const PULLS = [
  ['porta', 'Uma porta fechada', 'Passe uma toalha na maçaneta, segure as duas pontas e puxe o corpo em direção à porta. É o caminho de quem não tem barra.'],
  ['barra', 'Uma barra', 'Você se pendura e puxa o queixo até a barra. Vale a barra encaixada na porta e a barra fixa na parede.'],
  ['chao', 'Somente o chão', 'Não há porta firme nem barra. Você deita de bruços e puxa o peito do chão. A puxada do plano fica nesse movimento.'],
]

export default function Onboarding({ name = '', onDone, onClose }) {
  const [cover, setCover] = useState(true)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({ gender: '', start: '', days: 0, pull: '' })
  const current = STEPS[step]
  const ready =
    (current.key === 'gender' && answers.gender) ||
    (current.key === 'start' && answers.start) ||
    (current.key === 'days' && answers.days) ||
    (current.key === 'pull' && answers.pull)

  function next() {
    if (!ready) return
    if (step < STEPS.length - 1) setStep(step + 1)
    else onDone({ ...answers, name })
  }

  if (cover) {
    return (
      <section className="screen onboard">
        <header className="spread">
          <img className="logo" src="/logo-ana-light.png" alt="ana. wellness" />
          <button type="button" className="pill" onClick={onClose || (() => setCover(false))}>
            Pular
          </button>
        </header>
        <div className="cover-photo">
          <img src="/library/m-push.jpg" alt="" />
        </div>
        <p className="tiny">Avaliação</p>
        <h1>Quatro perguntas e o treino abre.</h1>
        <p className="sub">O plano começa em oito semanas e segue depois. A avaliação só marca o seu ponto.</p>
        <button type="button" className="btn" onClick={() => setCover(false)}>
          Começar avaliação
        </button>
      </section>
    )
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

      {current.key === 'gender' ? <Choices options={GENDERS} value={answers.gender} onPick={(gender) => setAnswers({ ...answers, gender })} /> : null}
      {current.key === 'start' ? <Choices options={STARTS} value={answers.start} onPick={(start) => setAnswers({ ...answers, start })} /> : null}
      {current.key === 'days' ? <Choices options={DAYS} value={answers.days} onPick={(days) => setAnswers({ ...answers, days })} /> : null}
      {current.key === 'pull' ? (
        <>
          <Choices options={PULLS} value={answers.pull} onPick={(pull) => setAnswers({ ...answers, pull })} />
          <p className="fine">
            Se a escolha for a porta, ela fica fechada e abre para o outro cômodo. Um calço segura a porta no chão. Se a maçaneta girar ou a porta ceder, pare e escolha somente o chão.
          </p>
        </>
      ) : null}

      <div className="onboard-actions">
        {step > 0 || onClose ? (
          <button type="button" className="btn ghost" onClick={() => (step > 0 ? setStep(step - 1) : onClose())}>
            Voltar
          </button>
        ) : null}
        <button type="button" className="btn" disabled={!ready} onClick={next}>
          {step === STEPS.length - 1 ? 'Montar meu plano' : 'Continuar'}
        </button>
      </div>
    </section>
  )
}

export function GenderGate({ onPick }) {
  return (
    <section className="screen onboard">
      <img className="logo" src="/logo-ana-light.png" alt="ana. wellness" />
      <p className="tiny">Cadastro</p>
      <h1>Quem aparece nos treinos?</h1>
      <p className="sub">A biblioteca troca as fotos conforme esta escolha. O plano que você já começou continua.</p>
      <Choices options={GENDERS} value="" onPick={onPick} />
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
