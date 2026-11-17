import { useEffect, useState } from 'react'
import { loadBoard } from '../admin'
import { IconBack } from '../components/Icons'
import { LEVELS } from '../engine'

const PULL = { porta: 'Porta', barra: 'Barra', chao: 'Chão' }

function when(value) {
  if (!value) return ''
  const text = String(value)
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    const [, month, day] = text.split('-')
    return `${day}/${month}`
  }
  const date = new Date(text)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export default function Admin({ onBack }) {
  const [people, setPeople] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let live = true
    loadBoard()
      .then((rows) => {
        if (live) setPeople(rows)
      })
      .catch(() => {
        if (!live) return
        setPeople([])
        setError('As contas ainda não chegam neste painel.')
      })
    return () => {
      live = false
    }
  }, [])

  const list = people || []
  const assessed = list.filter((person) => person.onboarded).length
  const sessions = list.reduce((sum, person) => sum + (person.sessions_done || 0), 0)

  return (
    <section className="screen">
      <header className="spread">
        <button type="button" className="icon-btn" aria-label="Voltar" onClick={onBack}>
          <IconBack />
        </button>
      </header>
      <p className="tiny">Painel</p>
      <h1>Validadores</h1>
      <p className="sub">Quem criou conta e em que ponto do plano está.</p>

      <div className="stats">
        <div className="stat">
          <b>{people ? list.length : '—'}</b>
          <span>contas</span>
        </div>
        <div className="stat">
          <b>{people ? assessed : '—'}</b>
          <span>avaliações</span>
        </div>
        <div className="stat">
          <b>{people ? sessions : '—'}</b>
          <span>sessões</span>
        </div>
      </div>

      {error ? <p className="cue">{error}</p> : null}
      {people && list.length === 0 && !error ? <p className="fine">Nenhuma conta ainda.</p> : null}

      {list.map((person) => {
        const level = LEVELS.find((item) => item.id === person.level)
        return (
          <article key={person.id} className="panel">
            <h3>{person.name || 'Sem nome'}</h3>
            <p className="fine">{person.email}</p>
            <div className="pills">
              <span className="badge">{person.confirmed ? 'Confirmado' : 'E-mail pendente'}</span>
              <span className="badge">{person.onboarded ? 'Avaliação feita' : 'Sem avaliação'}</span>
            </div>
            <p className="fine">
              {person.onboarded
                ? `Semana ${person.week || 0} · ${person.sessions_done || 0} sessões${level ? ` · ${level.name}` : ''}${person.gender === 'm' ? ' · Masculino' : person.gender === 'f' ? ' · Feminino' : ''}${PULL[person.pull] ? ` · ${PULL[person.pull]}` : ''}`
                : 'Ainda sem plano'}
            </p>
            <p className="fine">Conta em {when(person.created_at)}{person.last_session ? ` · último treino ${when(person.last_session)}` : ''}</p>
          </article>
        )
      })}
    </section>
  )
}
