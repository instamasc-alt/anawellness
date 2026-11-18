import { IconBack } from '../components/Icons'

export default function Store({ onBack }) {
  return (
    <section className="screen">
      <button type="button" className="icon-btn" aria-label="Voltar" onClick={onBack}>
        <IconBack />
      </button>
      <div>
        <p className="tiny">Loja</p>
        <h1>Em breve</h1>
        <p className="sub tight">Os produtos da ana. wellness entram aqui.</p>
      </div>
    </section>
  )
}
