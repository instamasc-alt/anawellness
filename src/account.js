import { defaultState, KEY, loadState, saveState } from './engine'
import { supabase } from './supabase'

const OWNER = 'ana-wellness-owner'

function readJson(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function meaningful(state) {
  return !!(state && (state.onboarded || state.sessionsDone || state.history?.length))
}

function newer(left, right) {
  return (left?.savedAt || 0) >= (right?.savedAt || 0) ? left : right
}

function list(value, fallback) {
  return Array.isArray(value) ? value : fallback
}

function stamp(state, session) {
  const fresh = defaultState()
  const base = {
    ...fresh,
    ...state,
    skill: { ...fresh.skill, ...(state?.skill || {}) },
  }
  return {
    ...base,
    email: session.user.email || base.email || '',
    name: base.name || session.user.user_metadata?.name || '',
    goals: list(base.goals, []),
    body: list(base.body, []),
    history: list(base.history, []),
    favorites: list(base.favorites, []),
    coach: list(base.coach, []),
    photo: typeof base.photo === 'string' ? base.photo : '',
    job: typeof base.job === 'string' ? base.job : '',
  }
}

function withTimeout(promise, ms) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      () => {
        clearTimeout(timer)
        resolve(null)
      },
    )
  })
}

async function pullRemote(session) {
  if (!supabase) return null
  const remote = await withTimeout(
    supabase.from('training_states').select('state').eq('user_id', session.user.id).maybeSingle(),
    8000,
  )
  if (remote && !remote.error && remote.data?.state) return remote.data.state
  const plan = session.user.user_metadata?.plan
  return plan && typeof plan === 'object' ? plan : null
}

export async function loadAccountState(session) {
  try {
    const remote = await pullRemote(session)
    const local = readJson(`${KEY}:${session.user.id}`)
    const owner = localStorage.getItem(OWNER)
    const legacy = !owner || owner === session.user.id ? loadState() : null
    const found = [remote, local, legacy].filter(meaningful).reduce((best, item) => (best ? newer(best, item) : item), null)
    if (found && found === legacy) localStorage.setItem(OWNER, session.user.id)
    return stamp(found || remote || local || { name: session.user.user_metadata?.name || '' }, session)
  } catch {
    return stamp({ name: session.user.user_metadata?.name || '' }, session)
  }
}

export async function saveAccountState(session, state) {
  const payload = { ...state, savedAt: Date.now() }
  try {
    localStorage.setItem(`${KEY}:${session.user.id}`, JSON.stringify(payload))
    localStorage.setItem(OWNER, session.user.id)
  } catch {
    /* o plano segue na memória desta sessão */
  }
  saveState(payload)
  if (!supabase) return
  const saved = { ...payload }
  delete saved.photo
  const result = await withTimeout(
    supabase.from('training_states').upsert({
      user_id: session.user.id,
      state: saved,
      updated_at: new Date().toISOString(),
    }),
    8000,
  )
  if (result && !result.error && session.user.user_metadata?.plan) {
    supabase.auth.updateUser({ data: { plan: null } }).catch(() => {})
  }
}

export function authMessage(error) {
  const text = `${error?.code || ''} ${error?.message || ''}`.toLowerCase()
  if (text.includes('invalid_credentials') || text.includes('invalid login')) return 'E-mail ou senha não confere.'
  if (text.includes('user_already_exists') || text.includes('already registered')) {
    return 'Já existe uma conta com este e-mail. Entre.'
  }
  if (text.includes('email_not_confirmed') || text.includes('not confirmed')) return 'Confirme o e-mail antes de entrar.'
  if (text.includes('password')) return 'A senha precisa de pelo menos 6 caracteres.'
  if (text.includes('email')) return 'Use um e-mail válido.'
  return 'Não foi possível concluir agora. Tente de novo.'
}
