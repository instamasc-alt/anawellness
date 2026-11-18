import { useState } from 'react'
import AssessmentCard from '../components/AssessmentCard'
import { levelOf, showDate, standards } from '../engine'
import Goals, { GOALS } from './Goals'

const FEEL = { pesado: 'Pesado', certo: 'No ponto', facil: 'Fácil' }

export default function Profile({ data, onChange, onReset, onSignOut, onAssess, owner, onAdmin }) {
  const level = levelOf(data)
  const [ask, setAsk] = useState(false)
  const [goalsOpen, setGoalsOpen] = useState(false)
  const marks = standards(data)
  const chosen = GOALS.filter(([id]) => (data.goals || []).includes(id)).sort(
    (a, b) => (data.goals || []).indexOf(a[0]) - (data.goals || []).indexOf(b[0]),
  )
  const letter = (data.name || 'A').trim().charAt(0).toUpperCase()

  function onPhoto(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !file.type.startsWith('image/')) return
    const image = new Image()
    const url = URL.createObjectURL(file)
    image.onload = () => {
      const max = 320
      const scale = Math.min(1, max / Math.max(image.width, image.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(image.width * scale))
      canvas.height = Math.max(1, Math.round(image.height * scale))
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      onChange({ photo: canvas.toDataURL('image/jpeg', 0.72) })
    }
    image.src = url
  }

  if (goalsOpen) {
    return (
      <Goals
        selected={data.goals}
        onChange={(goals) => onChange({ goals })}
        onClose={() => setGoalsOpen(false)}
      />
    )
  }

  return (
    <section className="screen">
      <div className="who">
        <label className="avatar">
          {data.photo ? <img src={data.photo} alt="" /> : <span>{letter}</span>}
          <input type="file" accept="image/*" aria-label="Foto do perfil" onChange={onPhoto} />
        </label>
        <div>
          <p className="tiny">Perfil</p>
          <h1>{data.name}</h1>
        </div>
      </div>
      <p className="sub tight">
        {data.onboarded ? `Nível ${level.name}. ${level.line}` : 'A avaliação ainda não marcou o seu nível.'}
      </p>
      {data.email ? <p className="fine">{data.email}</p> : null}

      <label className="stack tight-stack">
        <span className="tiny">Nome no treino</span>
        <input className="field" value={data.name} onChange={(event) => onChange({ name: event.target.value })} />
      </label>
      <label className="stack tight-stack">
        <span className="tiny">Profissão</span>
        <input
          className="field"
          value={data.job || ''}
          placeholder="O que você faz no dia"
          onChange={(event) => onChange({ job: event.target.value.slice(0, 48) })}
        />
      </label>

      {data.onboarded ? <div className="stats">
        <div className="stat">
          <b>{data.sessionsDone}</b>
          <span>sessões</span>
        </div>
        <div className="stat">
          <b>{data.streak}</b>
          <span>sequência</span>
        </div>
        <div className="stat">
          <b>{data.week}</b>
          <span>semana</span>
        </div>
      </div> : null}

      {data.onboarded ? null : <AssessmentCard onAssess={onAssess} />}

      {data.onboarded ? (
        <>
          <p className="fine">Peso, medidas e o que falta para o desejado ficam na Evolução.</p>
          <section className="panel">
            <h3>Objetivos</h3>
            {chosen.length ? (
              <div className="pills">
                {chosen.map(([id, title], index) => (
                  <span key={id} className="badge">
                    {index === 0 ? `${title} · hoje` : title}
                  </span>
                ))}
              </div>
            ) : (
              <p className="fine">Ainda sem objetivo marcado.</p>
            )}
            <button type="button" className="btn ghost" onClick={() => setGoalsOpen(true)}>
              {chosen.length ? 'Rever objetivos' : 'Escolher objetivos'}
            </button>
          </section>
        </>
      ) : null}

      {data.onboarded ? (
      <>
      <section className="panel">
        <h3>Fotos da biblioteca</h3>
        <div className="pills">
          {[
            ['m', 'Masculino'],
            ['f', 'Feminino'],
          ].map(([id, label]) => (
            <button key={id} type="button" className={data.gender === id ? 'pill on' : 'pill'} onClick={() => onChange({ gender: id })}>
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="panel">
        <h3>Padrão desta fase</h3>
        <ul className="standards">
          {marks.map(([name, target]) => (
            <li key={name}>
              <b>{name}</b>
              <span>{target}</span>
            </li>
          ))}
        </ul>
        {data.pull === 'chao' && data.level >= 3 ? (
          <p className="fine">No chão a puxada chega até a remada unilateral. Uma porta firme ou uma barra abre o resto.</p>
        ) : null}
      </section>

      {data.test ? (
        <section className="panel">
          <h3>Última prova · {showDate(data.test.date)}</h3>
          <p>
            Empurrar {data.test.push} · Agachar {data.test.squat} · Puxar {data.test.row} · Prancha {data.test.plank}s
          </p>
        </section>
      ) : (
        <p className="fine">A prova entra na semana 7. Ela também está na biblioteca, se quiser um número antes.</p>
      )}

      <section className="panel">
        <h3>Dias por semana</h3>
        <div className="pills">
          {[3, 4].map((days) => (
            <button key={days} type="button" className={data.days === days ? 'pill on' : 'pill'} onClick={() => onChange({ days })}>
              {days} dias
            </button>
          ))}
        </div>
        <h3>Puxada</h3>
        <div className="pills">
          {[
            ['porta', 'Porta'],
            ['barra', 'Barra'],
            ['chao', 'Chão'],
          ].map(([id, label]) => (
            <button key={id} type="button" className={data.pull === id ? 'pill on' : 'pill'} onClick={() => onChange({ pull: id })}>
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="panel">
        <h3>Histórico</h3>
        {data.history.length === 0 ? <p className="fine">A primeira sessão aparece aqui.</p> : null}
        <ul className="standards">
          {data.history.slice(0, 6).map((item, index) => (
            <li key={`${item.date}-${index}`}>
              <b>
                {showDate(item.date)} · {item.title}
              </b>
              <span>
                {FEEL[item.feeling] || item.feeling}
                {item.extra ? ' · extra' : ''}
              </span>
            </li>
          ))}
        </ul>
      </section>
      </>
      ) : null}

      <p className="fine">
        Dor aguda, fisgada ou inchaço: pare. Isto é treino, não atendimento médico. A estrutura vem do preparo de
        prontidão militar, com regressão de calistenia para quem começa em casa.
      </p>
      {data.onboarded ? (
        <button type="button" className="btn ghost" onClick={() => setAsk(true)}>
          Zerar progresso
        </button>
      ) : null}
      {owner ? (
        <button type="button" className="btn ghost" onClick={onAdmin}>
          Painel
        </button>
      ) : null}
      <button type="button" className="btn ghost" onClick={onSignOut}>
        Sair da conta
      </button>

      {ask ? (
        <div className="modal-back">
          <div className="modal" role="dialog" aria-modal="true">
            <h3>Zerar o plano?</h3>
            <p>Histórico, prova e nível saem. A conta continua, e o treino espera uma nova avaliação.</p>
            <button type="button" className="btn" onClick={() => setAsk(false)}>
              Manter
            </button>
            <button type="button" className="btn ghost" onClick={onReset}>
              Zerar
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
