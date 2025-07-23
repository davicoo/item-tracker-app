import { supabase } from '../supabaseClient'

export async function signOut() {
  document.cookie = 'introShown=; path=/; max-age=0'
  await supabase.auth.signOut()
}
