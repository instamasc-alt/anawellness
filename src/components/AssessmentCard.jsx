export default function AssessmentCard({ onAssess }) {
  return (
    <article className="mission">
      <span className="tiny">Avaliação</span>
      <h2>Avaliação inicial</h2>
      <p className="sub tight">O plano abre em oito semanas e segue depois. O treino espera o seu ponto de partida.</p>
      <button type="button" className="btn" onClick={onAssess}>
        Iniciar avaliação
      </button>
    </article>
  )
}
