import { useEffect, useState } from 'react'
import { showDate, todayKey } from '../engine'

const MEASURES = [
  ['waist', 'Cintura'],
  ['hip', 'Quadril'],
  ['chest', 'Peito'],
]
const EMPTY = { weight: '', waist: '', hip: '', chest: '' }

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

function num(value) {
  const n = Number(String(value ?? '').replace(',', '.'))
  return Number.isFinite(n) && n > 0 ? n : null
}

function remain(current, target, unit) {
  const now = num(current)
  const want = num(target)
  if (now == null || want == null) return { value: '—', note: 'sem marca' }
  const diff = Math.round((want - now) * 10) / 10
  if (Math.abs(diff) < 0.05) return { value: unit === 'kg' ? amount(current) : String(Math.round(now)), note: 'no ponto' }
  const value = unit === 'kg' ? Math.abs(diff).toFixed(1).replace('.', ',') : String(Math.abs(Math.round(diff)))
  return { value, note: 'falta' }
}

function progressOf(start, current, target) {
  const from = num(start)
  const now = num(current)
  const want = num(target)
  if (from == null || now == null || want == null) return 0
  if (Math.abs(want - from) < 0.05) return Math.abs(now - want) < 0.05 ? 1 : 0
  return Math.max(0, Math.min(1, (now - from) / (want - from)))
}

function Fields({ draft, onDraft, measures }) {
  return (
    <>
      <label className="stack tight-stack">
        <span className="tiny">Peso</span>
        <input
          className="field"
          inputMode="decimal"
          value={draft.weight}
          onChange={(event) => onDraft({ ...draft, weight: weightOf(event.target.value) })}
        />
      </label>
      {measures.map(([key, label]) => (
        <label key={key} className="stack tight-stack">
          <span className="tiny">{label}</span>
          <input
            className="field"
            inputMode="numeric"
            value={draft[key]}
            onChange={(event) => onDraft({ ...draft, [key]: centimeters(event.target.value) })}
          />
        </label>
      ))}
    </>
  )
}

export default function Body({ data, onChange }) {
  const records = data.body || []
  const current = records[0]
  const initial = records[records.length - 1]
  const goal = data.bodyGoal
  const [open, setOpen] = useState(records.length ? '' : 'start')
  const [now, setNow] = useState(EMPTY)
  const [want, setWant] = useState({ ...EMPTY, ...(goal || {}) })
  const [drawn, setDrawn] = useState(0)
  const pct = Math.round(progressOf(initial?.weight, current?.weight, goal?.weight) * 100)
  const weeks = [...records].reverse()

  useEffect(() => {
    const frame = requestAnimationFrame(() => setDrawn(pct))
    return () => cancelAnimationFrame(frame)
  }, [pct])

  function saveNow() {
    if (!now.weight) return
    const mark = { date: todayKey(), week: data.week, ...now }
    let next = [mark, ...records]
    if (records.length > 1 && records[0].week === data.week) next = [mark, ...records.slice(1)]
    onChange({ body: next.slice(0, 24) })
    setNow(EMPTY)
    setOpen(goal?.weight ? '' : 'want')
  }

  function saveWant() {
    if (!want.weight) return
    onChange({ bodyGoal: { weight: want.weight, waist: want.waist, hip: want.hip, chest: want.chest } })
    setOpen(records.length ? '' : 'now')
  }

  function openNow() {
    setNow({
      weight: current?.weight || '',
      waist: current?.waist || '',
      hip: current?.hip || '',
      chest: current?.chest || '',
    })
    setOpen('now')
  }

  const weightLeft = goal?.weight && current?.weight ? remain(current.weight, goal.weight, 'kg') : null

  return (
    <section className="panel body-board">
      <h3>Corpo</h3>
      <p className="fine">Peso de agora e o peso desejado. Cada semana entra uma marca. O arco mostra o caminho que falta.</p>
      <div className="gauge">
        <svg viewBox="0 0 180 108" aria-hidden="true">
          <path d="M16 96 A74 74 0 0 1 164 96" className="gauge-track" pathLength="100" />
          {drawn > 0 ? (
            <path
              d="M16 96 A74 74 0 0 1 164 96"
              className="gauge-value"
              pathLength="100"
              style={{ strokeDasharray: `${drawn} 100` }}
            />
          ) : null}
        </svg>
        <div className="gauge-read">
          <b>{current?.weight ? amount(current.weight) : '—'}</b>
          <span>{current?.weight ? 'kg agora' : 'sem peso'}</span>
        </div>
      </div>
      <p className="fine center">
        {weightLeft
          ? `Desejado ${amount(goal.weight)} kg. ${weightLeft.note === 'no ponto' ? 'No ponto.' : `Faltam ${weightLeft.value} kg.`}`
          : current
            ? 'Marque o peso desejado para ver o que falta.'
            : 'A primeira marca é o ponto de partida.'}
      </p>
      {goal?.weight && current ? (
        <div className="body-gaps">
          <div className="body-gap">
            <b>{weightLeft.value}</b>
            <span>Peso</span>
            <small>{weightLeft.note}</small>
          </div>
          {MEASURES.map(([key, label]) => {
            const item = remain(current[key], goal[key], 'cm')
            return (
              <div className="body-gap" key={key}>
                <b>{item.value}</b>
                <span>{label}</span>
                <small>{item.note}</small>
              </div>
            )
          })}
        </div>
      ) : null}
      {weeks.length ? (
        <div className="body-weeks" aria-label="Marcas por semana">
          {weeks.map((item, index) => (
            <div key={`${item.date}-${index}`} className={index === weeks.length - 1 ? 'on' : ''}>
              <b>{amount(item.weight)}</b>
              <span>{item.week ? `S${item.week}` : showDate(item.date)}</span>
            </div>
          ))}
        </div>
      ) : null}
      {records.length > 1 ? (
        <ul className="standards">
          {records.map((item, index) => (
            <li key={`${item.date}-${index}`}>
              <b>{item.week ? `Semana ${item.week}` : showDate(item.date)}</b>
              <span>
                {amount(item.weight)} kg
                {MEASURES.filter(([key]) => item[key]).map(([key, label]) => ` · ${label} ${item[key]}`).join('')}
                {goal?.weight ? ` · ${remain(item.weight, goal.weight, 'kg').note === 'no ponto' ? 'no ponto' : `faltam ${remain(item.weight, goal.weight, 'kg').value} kg`}` : ''}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {open === 'start' || open === 'now' ? (
        <div className="stack">
          <p className="tiny">{records.length ? 'Nova marca' : 'Agora'}</p>
          <Fields draft={now} onDraft={setNow} measures={MEASURES} />
          <button type="button" className="btn" disabled={!now.weight} onClick={saveNow}>
            {records.length ? 'Registrar esta semana' : 'Marcar ponto de partida'}
          </button>
        </div>
      ) : null}
      {open === 'start' || open === 'want' ? (
        <div className="stack">
          <p className="tiny">Desejado</p>
          <Fields draft={want} onDraft={setWant} measures={MEASURES} />
          <button type="button" className="btn" disabled={!want.weight} onClick={saveWant}>
            Guardar o desejado
          </button>
        </div>
      ) : null}
      {open === '' ? (
        <div className="stack">
          <button type="button" className="btn" onClick={openNow}>
            Nova marca da semana
          </button>
          <button
            type="button"
            className="btn ghost"
            onClick={() => {
              setWant({ ...EMPTY, ...(goal || {}) })
              setOpen('want')
            }}
          >
            {goal?.weight ? 'Ajustar o desejado' : 'Marcar o desejado'}
          </button>
        </div>
      ) : null}
    </section>
  )
}
