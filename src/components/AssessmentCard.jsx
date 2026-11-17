export default function AssessmentCard({ onAssess }) {
  return (
    <article className="mission">
      <span className="tiny">Avaliação</span>
      <h2>Avaliação inicial</h2>
      <p className="sub tight">O plano de oito semanas fica visível. O treino abre no seu ponto de partida.</p>
      <button type="button" className="btn" onClick={onAssess}>
        Iniciar avaliação
      </button>
    </article>
  )
}
