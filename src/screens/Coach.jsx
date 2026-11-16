import { useEffect, useRef, useState } from 'react'
import { buildWorkout, replyTo } from '../engine'
import { IconSend } from '../components/Icons'

const PROMPTS = ['O que faço hoje?', 'A flexão pesou', 'Está fácil', 'Dor no punho', 'Dor no joelho', 'Como progrido?']

export default function Coach({ data, onSend, onStart }) {
  const [text, setText] = useState('')
  const endRef = useRef(null)
  const today = buildWorkout(data)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [data.coach.length])

  function send(value) {
    const message = (value ?? text).trim()
    if (!message) return
    onSend(message, replyTo(data, message))
    setText('')
  }

  return (
    <section className="screen chat-screen">
      <div>
        <h1>Seu coach</h1>
        <p className="sub tight">Orientação do plano, com base no seu nível e no último treino.</p>
      </div>
      <div className="pills">
        {PROMPTS.map((prompt) => (
          <button key={prompt} type="button" className="pill" onClick={() => send(prompt)}>
            {prompt}
          </button>
        ))}
      </div>
      <div className="thread">
        {data.coach.map((message, index) => (
          <div key={`${message.time}-${index}`} className={message.from === 'me' ? 'bubble me' : 'bubble'}>
            {message.text}
            <time>{message.time}</time>
          </div>
        ))}
        <article className="next-card">
          <div>
            <p className="tiny">Próxima missão</p>
            <b>{today.title}</b>
            <span>
              {today.minutes} min · {today.levelName}
            </span>
          </div>
          <button type="button" className="round big" aria-label="Começar missão" onClick={() => onStart(today.id)}>
            <IconSend />
          </button>
        </article>
        <div ref={endRef} />
      </div>
      <form
        className="composer"
        onSubmit={(event) => {
          event.preventDefault()
          send()
        }}
      >
        <input
          className="field"
          value={text}
          placeholder="Escreva sua dúvida"
          onChange={(event) => setText(event.target.value)}
        />
        <button type="submit" className="round big" aria-label="Enviar">
          <IconSend />
        </button>
      </form>
    </section>
  )
}
