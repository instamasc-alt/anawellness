import { supabase } from './supabase'

export const OWNERS = ['conelheiros@gmail.com']

export function isOwner(email) {
  return OWNERS.includes((email || '').trim().toLowerCase())
}

export async function loadBoard() {
  if (!supabase) throw new Error('offline')
  const { data, error } = await supabase.rpc('validator_board')
  if (error) throw error
  return Array.isArray(data) ? data : []
}
