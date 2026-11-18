import { useState } from 'react'
import Achievements from './Achievements'
import Body from './Body'
import { achievementsOf, evolutionOf, showDate } from '../engine'

const FEEL = { pesado: 'Pesado', certo: 'No ponto', facil: 'Fácil' }
const RANGES = [
  ['semana', 'Semana'],
  ['mes', 'Mês'],
  ['tudo', 'Tudo'],
]

export default function Evolution({ data, onChange }) {
  const [range, setRange] = useState('semana')
  const [board, setBoard] = useState(false)
  const view = evolutionOf(data, range)
  const marks = achievementsOf(data)

  if (board) return <Achievements data={data} onClose={() => setBoard(false)} />

  return (
    <section className="screen">
      <p className="tiny">Evolução</p>
      <h1>O que já foi feito</h1>
      <p className="sub">Sessões, peso e medidas. A semana no plano não para nas oito.</p>
      <Body data={data} onChange={onChange} />
      <button type="button" className="panel spread" onClick={() => setBoard(true)}>
        <span>
          <b>Conquistas</b>
          <span className="fine">
            {marks.done} de {marks.total}
          </span>
        </span>
        <span className="badge">Abrir</span>
      </button>
      <div className="pills">
        {RANGES.map(([id, label]) => (
          <button key={id} type="button" className={range === id ? 'pill on' : 'pill'} onClick={() => setRange(id)}>
            {label}
          </button>
        ))}
      </div>
      <div className="stats evolution-stats">
        <div className="stat">
          <b>{view.sessions}</b>
          <span>sessões concluídas</span>
        </div>
        <div className="stat">
          <b>{view.weeks}</b>
          <span>semanas registradas</span>
        </div>
      </div>
      <section className="panel">
        <h3>{range === 'tudo' ? 'Semanas recentes' : range === 'mes' ? 'Semanas do mês' : 'Dias da semana'}</h3>
        <div className="evo-bars" aria-hidden="true">
          {view.bars.map((bar, index) => (
            <div className="evo-bar" key={`${bar.label}-${index}`}>
              <div className="track">
                <div className="fill" style={{ height: `${bar.amount}%` }} />
              </div>
              <span>{bar.label}</span>
            </div>
          ))}
        </div>
      </section>
      {view.items.length === 0 ? (
        <article className="mission">
          <p className="sub tight">Sua história ainda vai começar. Os números surgem a partir de registros reais.</p>
        </article>
      ) : (
        <section className="panel">
          <h3>Histórico</h3>
          <ul className="standards">
            {view.items.slice(0, 12).map((item, index) => (
              <li key={`${item.date}-${item.title}-${index}`}>
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
      )}
    </section>
  )
}
