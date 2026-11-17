import { IconBack } from '../components/Icons'
import { achievementsOf } from '../engine'

export default function Achievements({ data, onClose }) {
  const board = achievementsOf(data)

  return (
    <section className="screen">
      <header className="spread">
        <button type="button" className="icon-btn" aria-label="Voltar" onClick={onClose}>
          <IconBack />
        </button>
      </header>
      <p className="tiny">Conquistas</p>
      <h1>O que ficou feito</h1>
      <p className="sub">Marcas da sua conta. A semana continua depois das oito.</p>
      <div className="stats">
        <div className="stat">
          <b>{board.done}</b>
          <span>feitas</span>
        </div>
        <div className="stat">
          <b>{board.total - board.done}</b>
          <span>em aberto</span>
        </div>
        <div className="stat">
          <b>{data.onboarded ? data.week : 0}</b>
          <span>semana</span>
        </div>
      </div>
      {board.items.map((item) => (
        <article key={item.id} className="panel">
          <div className="spread">
            <h3>{item.title}</h3>
            {item.done ? <span className="badge">Feita</span> : null}
          </div>
          <p className="fine">{item.text}</p>
          {!item.done && item.goal > 1 ? (
            <>
              <p className="fine">
                {item.progress} de {item.goal}
              </p>
              <div className="track">
                <div className="fill" style={{ width: `${Math.round((item.progress / item.goal) * 100)}%` }} />
              </div>
            </>
          ) : null}
        </article>
      ))}
    </section>
  )
}
