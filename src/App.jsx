import { useEffect, useRef, useState } from 'react'
import { loadAccountState, saveAccountState } from './account'
import { isOwner } from './admin'
import { IconBell, IconMenu } from './components/Icons'
import TabBar from './components/TabBar'
import { blocksOf, applyResult, buildWorkout, completeOnboarding, defaultState, sessionForExercise, trainedToday } from './engine'
import { supabase } from './supabase'
import Admin from './screens/Admin'
import Coach from './screens/Coach'
import Exercise from './screens/Exercise'
import Evolution from './screens/Evolution'
import Home from './screens/Home'
import Library from './screens/Library'
import Account from './screens/Account'
import Onboarding, { GenderGate } from './screens/Onboarding'
import Plan from './screens/Plan'
import Profile from './screens/Profile'
import Session from './screens/Session'
import Store from './screens/Store'

function Brand({ onBell, unread, menu, onMenu, onProfile, onStore }) {
  return (
    <header className="brand">
      <img className="logo" src="/logo-ana-light.png" alt="ana. wellness" />
      {onMenu ? (
        <div className="brand-tools">
          <button type="button" className="icon-btn" aria-label="Recados" onClick={onBell}>
            <IconBell />
            {unread > 0 ? <i className="dot" /> : null}
          </button>
          <button type="button" className="icon-btn" aria-label="Menu" aria-expanded={menu} onClick={onMenu}>
            <IconMenu />
          </button>
          {menu ? (
            <div className="menu" role="menu">
              <button type="button" role="menuitem" onClick={onProfile}>
                Perfil
              </button>
              <button type="button" role="menuitem" onClick={onStore}>
                Loja
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </header>
  )
}

export default function App() {
  const [session, setSession] = useState(undefined)
  const [hydrated, setHydrated] = useState(false)
  const [data, setData] = useState(defaultState)
  const [tab, setTab] = useState('plan')
  const [overlay, setOverlay] = useState(null)
  const [pick, setPick] = useState(null)
  const [bell, setBell] = useState(false)
  const [menu, setMenu] = useState(false)
  const [assessing, setAssessing] = useState(false)
  const mainRef = useRef(null)
  const userId = session?.user?.id

  useEffect(() => {
    if (!supabase) {
      setSession(null)
      return undefined
    }
    let live = true
    const giveUp = setTimeout(() => {
      if (live) setSession((current) => (current === undefined ? null : current))
    }, 8000)
    supabase.auth.getSession().then(({ data: auth }) => {
      if (live) setSession(auth.session ?? null)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      if (!live || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') return
      setTimeout(() => {
        if (live) setSession(next)
      }, 0)
    })
    return () => {
      live = false
      clearTimeout(giveUp)
      sub.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!userId || !session) {
      setHydrated(false)
      return undefined
    }
    let live = true
    setHydrated(false)
    loadAccountState(session).then((next) => {
      if (!live) return
      setData(next)
      setHydrated(true)
    })
    return () => {
      live = false
    }
  }, [userId])

  useEffect(() => {
    if (!hydrated || !session) return undefined
    const timer = setTimeout(() => saveAccountState(session, data), 400)
    return () => clearTimeout(timer)
  }, [data, hydrated, userId])

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
    setMenu(false)
    setAssessing(false)
  }

  function start(code) {
    if (!data.onboarded) {
      setAssessing(true)
      return
    }
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

  if (session === undefined || (session && !hydrated)) {
    return (
      <div className="stage">
        <div className="app">
          <Brand />
          <main className="main">
            <p className="fine">Abrindo o plano.</p>
          </main>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="stage">
        <div className="app">
          <Brand />
          <main className="main">
            <Account />
          </main>
        </div>
      </div>
    )
  }

  if (!data.gender && data.onboarded) {
    return (
      <div className="stage">
        <div className="app">
          <Brand />
          <main className="main">
            <GenderGate onPick={(gender) => setData({ ...data, gender })} />
          </main>
        </div>
      </div>
    )
  }

  const inSession = overlay?.type === 'session'
  const owner = isOwner(session?.user?.email)
  const freeze = tab === 'coach' && !overlay && !assessing

  return (
    <div className="stage">
      <div className="app">
        <Brand
          unread={data.coachUnread}
          menu={menu}
          onBell={() => {
            setMenu(false)
            setBell(true)
          }}
          onMenu={() => setMenu((open) => !open)}
          onProfile={() => go('profile')}
          onStore={() => {
            setMenu(false)
            setBell(false)
            setPick(null)
            setAssessing(false)
            setOverlay({ type: 'store' })
          }}
        />
        {menu ? <button type="button" className="menu-back" aria-label="Fechar menu" onClick={() => setMenu(false)} /> : null}
        <main ref={mainRef} className={freeze ? 'main freeze' : 'main'}>
          {assessing ? (
            <Onboarding
              name={data.name}
              onClose={() => setAssessing(false)}
              onDone={(answers) => {
                setData((current) => ({
                  ...completeOnboarding(answers),
                  email: current.email,
                  photo: current.photo,
                  job: current.job,
                  body: current.body,
                  bodyGoal: current.bodyGoal,
                }))
                setAssessing(false)
                setTab('plan')
              }}
            />
          ) : null}
          {!assessing && inSession ? (
            <Session workout={overlay.workout} gender={data.gender} onClose={() => setOverlay(null)} onComplete={finish} />
          ) : null}
          {!overlay && !assessing && tab === 'home' ? (
            <Home
              data={data}
              onStart={start}
              onBell={() => setBell(true)}
              onTrain={() => go('train')}
              onPlan={() => go('plan')}
              onGoals={() => go('profile')}
              onAssess={() => setAssessing(true)}
            />
          ) : null}
          {!overlay && !assessing && tab === 'plan' ? (
            <Plan data={data} onStart={start} onBell={() => setBell(true)} onAssess={() => setAssessing(true)} />
          ) : null}
          {!overlay && !assessing && tab === 'train' ? (
            <Library
              data={data}
              onAssess={() => setAssessing(true)}
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
          {overlay?.type === 'store' ? <Store onBack={() => setOverlay(null)} /> : null}
          {overlay?.type === 'admin' ? <Admin onBack={() => setOverlay(null)} /> : null}
          {overlay?.type === 'exercise' ? (
            <Exercise
              id={overlay.id}
              gender={data.gender}
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
          {!overlay && !assessing && tab === 'coach' ? (
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
          {!overlay && !assessing && tab === 'evolution' ? (
            <Evolution data={data} onChange={(patch) => setData((state) => ({ ...state, ...patch }))} />
          ) : null}
          {!overlay && !assessing && tab === 'profile' ? (
            <Profile
              data={data}
              onAssess={() => setAssessing(true)}
              onChange={(patch) => setData((state) => ({ ...state, ...patch }))}
              owner={owner}
              onAdmin={() => setOverlay({ type: 'admin' })}
              onSignOut={() => supabase?.auth.signOut()}
              onReset={() => {
                setData({ ...defaultState(), name: data.name, email: data.email })
                setTab('plan')
              }}
            />
          ) : null}
        </main>
        {inSession ? null : <TabBar tab={tab} unread={data.coachUnread} onChange={go} />}
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
