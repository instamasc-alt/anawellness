import { useEffect, useRef, useState } from 'react'
import TabBar from './components/TabBar'
import { blocksOf, applyResult, buildWorkout, completeOnboarding, defaultState, loadState, saveState, sessionForExercise, trainedToday } from './engine'
import Coach from './screens/Coach'
import Exercise from './screens/Exercise'
import Home from './screens/Home'
import Library from './screens/Library'
import Onboarding from './screens/Onboarding'
import Plan from './screens/Plan'
import Profile from './screens/Profile'
import Session from './screens/Session'

export default function App() {
  const [data, setData] = useState(loadState)
  const [tab, setTab] = useState('plan')
  const [overlay, setOverlay] = useState(null)
  const [pick, setPick] = useState(null)
  const [bell, setBell] = useState(false)
  const mainRef = useRef(null)

  useEffect(() => {
    saveState(data)
  }, [data])

  useEffect(() => {
    mainRef.current?.scrollTo(0, 0)
  }, [tab, overlay])

  useEffect(() => {
    if (tab === 'coach' && data.coachUnread) setData((current) => ({ ...current, coachUnread: 0 }))
  }, [tab, data.coachUnread])

  function go(next) {
    setTab(next)
    setOverlay(null)
    setPick(null)
    setBell(false)
  }

  function start(code) {
    const extra = trainedToday(data)
    setPick(null)
    setBell(false)
    setOverlay({ type: 'session', workout: buildWorkout(data, code), extra })
  }

  function finish({ feeling, test }) {
    const current = overlay
    setData((state) => applyResult(state, { workout: current.workout, feeling, test, extra: current.extra }))
    setOverlay(null)
    setTab('home')
  }

  if (!data.onboarded) {
    return (
      <div className="stage">
        <div className="app">
          <main className="main">
            <Onboarding
              onDone={(answers) => {
                setData(completeOnboarding(answers))
                setTab('plan')
              }}
            />
          </main>
        </div>
      </div>
    )
  }

  const session = overlay?.type === 'session'
  const freeze = tab === 'coach' && !overlay

  return (
    <div className="stage">
      <div className="app">
        <main ref={mainRef} className={freeze ? 'main freeze' : 'main'}>
          {session ? (
            <Session workout={overlay.workout} onClose={() => setOverlay(null)} onComplete={finish} />
          ) : null}
          {!overlay && tab === 'home' ? (
            <Home data={data} onStart={start} onBell={() => setBell(true)} onTrain={() => go('train')} />
          ) : null}
          {!overlay && tab === 'plan' ? <Plan data={data} onStart={start} onBell={() => setBell(true)} /> : null}
          {!overlay && tab === 'train' ? (
            <Library
              data={data}
              onBell={() => setBell(true)}
              onOpenWorkout={setPick}
              onOpenExercise={(id) => setOverlay({ type: 'exercise', id })}
              onToggleFav={(id) =>
                setData((state) => ({
                  ...state,
                  favorites: state.favorites.includes(id)
                    ? state.favorites.filter((item) => item !== id)
                    : [...state.favorites, id],
                }))
              }
            />
          ) : null}
          {overlay?.type === 'exercise' ? (
            <Exercise
              id={overlay.id}
              favorite={data.favorites.includes(`e:${overlay.id}`)}
              onBack={() => setOverlay(null)}
              onOpen={(id) => setOverlay({ type: 'exercise', id })}
              onToggleFav={() => {
                const id = `e:${overlay.id}`
                setData((state) => ({
                  ...state,
                  favorites: state.favorites.includes(id)
                    ? state.favorites.filter((item) => item !== id)
                    : [...state.favorites, id],
                }))
              }}
              onStart={() =>
                setOverlay({
                  type: 'session',
                  workout: sessionForExercise(data, overlay.id),
                  extra: trainedToday(data),
                })
              }
            />
          ) : null}
          {!overlay && tab === 'coach' ? (
            <Coach
              data={data}
              onStart={start}
              onSend={(text, answer) => {
                const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                setData((state) => ({
                  ...state,
                  coachUnread: 0,
                  coach: [
                    ...state.coach,
                    { from: 'me', text, time },
                    { from: 'coach', text: answer, time },
                  ],
                }))
              }}
            />
          ) : null}
          {!overlay && tab === 'profile' ? (
            <Profile
              data={data}
              onChange={(patch) => setData((state) => ({ ...state, ...patch }))}
              onReset={() => {
                setData(defaultState())
                setTab('plan')
              }}
            />
          ) : null}
        </main>
        {session ? null : <TabBar tab={tab} unread={data.coachUnread} onChange={go} />}
        {bell ? (
          <div className="sheet-back" onClick={() => setBell(false)}>
            <div className="sheet" onClick={(event) => event.stopPropagation()}>
              <h3>Recados</h3>
              {data.coach.slice(-3).reverse().map((message, index) => (
                <p key={`${message.time}-${index}`} className="fine">
                  {message.text}
                </p>
              ))}
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setBell(false)
                  go('coach')
                }}
              >
                Abrir coach
              </button>
            </div>
          </div>
        ) : null}
        {pick ? (
          <div className="sheet-back" onClick={() => setPick(null)}>
            <div className="sheet" onClick={(event) => event.stopPropagation()}>
              <p className="tiny">
                {pick.minutes} min · {pick.levelName}
              </p>
              <h2>{pick.title}</h2>
              <p>{pick.why}</p>
              <ol className="blocks">
                {blocksOf(pick).map((block) => (
                  <li key={block.name}>
                    <b>{block.name}</b>
                    <span>{block.items.join(' · ')}</span>
                  </li>
                ))}
              </ol>
              <button type="button" className="btn" onClick={() => start(pick.id)}>
                Começar
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
