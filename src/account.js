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

function stamp(state, session) {
  const base = {
    ...defaultState(),
    ...state,
    skill: { ...defaultState().skill, ...(state?.skill || {}) },
  }
  return {
    ...base,
    email: session.user.email || base.email || '',
    name: base.name || session.user.user_metadata?.name || '',
  }
}

async function pullRemote(session) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('training_states')
    .select('state')
    .eq('user_id', session.user.id)
    .maybeSingle()
  if (!error && data?.state) return data.state
  const plan = session.user.user_metadata?.plan
  return plan && typeof plan === 'object' ? plan : null
}

export async function loadAccountState(session) {
  const remote = await pullRemote(session)
  const local = readJson(`${KEY}:${session.user.id}`)
  const owner = localStorage.getItem(OWNER)
  const legacy = !owner || owner === session.user.id ? loadState() : null
  const found = [remote, local, legacy].filter(meaningful).reduce((best, item) => (best ? newer(best, item) : item), null)
  if (found && found === legacy) localStorage.setItem(OWNER, session.user.id)
  return stamp(found || remote || local || { name: session.user.user_metadata?.name || '' }, session)
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
  const { error } = await supabase.from('training_states').upsert({
    user_id: session.user.id,
    state: payload,
    updated_at: new Date().toISOString(),
  })
  if (!error) return
  await supabase.auth.updateUser({ data: { name: payload.name, plan: payload } })
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
