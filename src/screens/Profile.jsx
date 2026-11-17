import { useState } from 'react'
import AssessmentCard from '../components/AssessmentCard'
import { levelOf, showDate, standards } from '../engine'

const FEEL = { pesado: 'Pesado', certo: 'No ponto', facil: 'Fácil' }

export default function Profile({ data, onChange, onReset, onSignOut, onAssess, owner, onAdmin }) {
  const level = levelOf(data)
  const [ask, setAsk] = useState(false)
  const marks = standards(data)

  return (
    <section className="screen">
      <p className="tiny">Perfil</p>
      <h1>{data.name}</h1>
      <p className="sub tight">
        {data.onboarded ? `Nível ${level.name}. ${level.line}` : 'A avaliação ainda não marcou o seu nível.'}
      </p>
      {data.email ? <p className="fine">{data.email}</p> : null}

      <label className="stack tight-stack">
        <span className="tiny">Nome no treino</span>
        <input className="field" value={data.name} onChange={(event) => onChange({ name: event.target.value })} />
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
