import { useState } from 'react'
import AssessmentCard from '../components/AssessmentCard'
import { levelOf, showDate, standards, todayKey } from '../engine'
import Goals, { GOALS } from './Goals'

const FEEL = { pesado: 'Pesado', certo: 'No ponto', facil: 'Fácil' }
const MEASURES = [
  ['waist', 'Cintura'],
  ['hip', 'Quadril'],
  ['chest', 'Peito'],
]

function amount(value) {
  return String(value || '').replace('.', ',')
}

function weightOf(value) {
  const text = value.replace(',', '.').replace(/[^\d.]/g, '')
  const parts = text.split('.')
  const whole = (parts[0] || '').slice(0, 3)
  if (parts.length === 1) return whole
  return `${whole}.${parts[1].slice(0, 1)}`
}

function centimeters(value) {
  return value.replace(/\D/g, '').slice(0, 3)
}

export default function Profile({ data, onChange, onReset, onSignOut, onAssess, owner, onAdmin }) {
  const level = levelOf(data)
  const [ask, setAsk] = useState(false)
  const [goalsOpen, setGoalsOpen] = useState(false)
  const [draft, setDraft] = useState({ weight: '', waist: '', hip: '', chest: '' })
  const marks = standards(data)
  const records = data.body || []
  const current = records[0]
  const initial = records[records.length - 1]
  const chosen = GOALS.filter(([id]) => (data.goals || []).includes(id))

  function registerBody() {
    if (!draft.weight) return
    onChange({
      body: [{ date: todayKey(), ...draft }, ...records].slice(0, 24),
    })
    setDraft({ weight: '', waist: '', hip: '', chest: '' })
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
            <h3>Peso atual</h3>
            <p className="session-title">{current?.weight ? `${amount(current.weight)} kg` : 'Sem registro'}</p>
            {current ? <p className="fine">Última marca em {showDate(current.date)}.</p> : <p className="fine">O primeiro registro vira o corpo inicial.</p>}
            {initial && records.length > 1 && initial.weight && current.weight ? (
              <p className="fine">Corpo inicial: {amount(initial.weight)} kg em {showDate(initial.date)}.</p>
            ) : null}
          </section>

          <section className="panel">
            <h3>{records.length ? 'Nova marca' : 'Corpo inicial'}</h3>
            <p className="fine">Peso em quilos. Medidas em centímetros, sempre no mesmo ponto.</p>
            <label className="stack tight-stack">
              <span className="tiny">Peso</span>
              <input className="field" inputMode="decimal" value={draft.weight} onChange={(event) => setDraft({ ...draft, weight: weightOf(event.target.value) })} />
            </label>
            {MEASURES.map(([key, label]) => (
              <label key={key} className="stack tight-stack">
                <span className="tiny">{label}</span>
                <input className="field" inputMode="numeric" value={draft[key]} onChange={(event) => setDraft({ ...draft, [key]: centimeters(event.target.value) })} />
              </label>
            ))}
            <button type="button" className="btn" disabled={!draft.weight} onClick={registerBody}>
              {records.length ? 'Registrar de novo' : 'Marcar corpo inicial'}
            </button>
          </section>

          {initial ? (
            <section className="panel">
              <h3>Corpo inicial · {showDate(initial.date)}</h3>
              <ul className="standards">
                <li>
                  <b>Peso</b>
                  <span>{amount(initial.weight)} kg</span>
                </li>
                {MEASURES.map(([key, label]) =>
                  initial[key] ? (
                    <li key={key}>
                      <b>{label}</b>
                      <span>{initial[key]} cm</span>
                    </li>
                  ) : null,
                )}
              </ul>
            </section>
          ) : null}

          {records.length > 1 ? (
            <section className="panel">
              <h3>Marcas</h3>
              <ul className="standards">
                {records.slice(0, 6).map((item, index) => (
                  <li key={`${item.date}-${index}`}>
                    <b>{showDate(item.date)}</b>
                    <span>
                      {amount(item.weight)} kg
                      {MEASURES.filter(([key]) => item[key]).map(([key, label]) => ` · ${label} ${item[key]}`).join('')}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="panel">
            <h3>Objetivos</h3>
            {chosen.length ? (
              <div className="pills">
                {chosen.map(([id, title]) => (
                  <span key={id} className="badge">
                    {title}
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
