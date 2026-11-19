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

const ASIDE = ['body', 'history', 'favorites', 'coach', 'photo', 'job', 'name', 'email', 'updated_at', 'user_id']

function hasJournal(state) {
  return ['history', 'body', 'coach', 'favorites'].some((key) => Array.isArray(state?.[key]) && state[key].length > 0)
}

function newer(left, right) {
  const leftAt = left?.savedAt || 0
  const rightAt = right?.savedAt || 0
  if (leftAt !== rightAt) return leftAt > rightAt ? left : right
  return hasJournal(right) && !hasJournal(left) ? right : left
}

function planMeta(state) {
  const plan = {}
  for (const [key, value] of Object.entries(state || {})) {
    if (!ASIDE.includes(key)) plan[key] = value
  }
  return plan
}

function asState(plan) {
  if (!plan || typeof plan !== 'object' || Array.isArray(plan)) return null
  const state = planMeta(plan)
  for (const key of ['body', 'history', 'favorites', 'coach']) {
    if (Array.isArray(plan[key])) state[key] = plan[key]
  }
  return state
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
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const error = new Error('timeout')
      error.code = 'timeout'
      reject(error)
    }, ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (error) => {
        clearTimeout(timer)
        reject(error)
      },
    )
  })
}

async function pullRemote(session) {
  if (!supabase) return null
  try {
    const remote = await withTimeout(
      supabase.from('training_states').select('state').eq('user_id', session.user.id).maybeSingle(),
      8000,
    )
    if (!remote?.error && remote?.data?.state && typeof remote.data.state === 'object') return remote.data.state
  } catch {
    return null
  }
  return null
}

export async function loadAccountState(session) {
  try {
    const remote = await pullRemote(session)
    const account = asState(session.user.user_metadata?.plan)
    const local = readJson(`${KEY}:${session.user.id}`)
    const owner = localStorage.getItem(OWNER)
    const legacy = !owner || owner === session.user.id ? loadState() : null
    const found = [remote, account, local, legacy].filter(meaningful).reduce((best, item) => (best ? newer(best, item) : item), null)
    if (found && found === legacy) localStorage.setItem(OWNER, session.user.id)
    return stamp(found || remote || account || local || { name: session.user.user_metadata?.name || '' }, session)
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
  let failed = null
  try {
    const result = await withTimeout(
      supabase.from('training_states').upsert({
        user_id: session.user.id,
        state: saved,
        updated_at: new Date().toISOString(),
      }),
      8000,
    )
    if (result?.error) failed = result.error
  } catch (error) {
    failed = error || new Error('save')
  }
  if (!failed) return
  try {
    await withTimeout(
      supabase.auth.updateUser({ data: { name: saved.name, plan: planMeta(saved) } }),
      8000,
    )
  } catch {
    /* a cópia local permanece */
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
