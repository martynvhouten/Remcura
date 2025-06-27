import { boot } from 'quasar/wrappers'
import { createClient } from '@supabase/supabase-js'
import type { Database } from 'src/types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export default boot(({ app }) => {
  // Make supabase available globally
  app.config.globalProperties.$supabase = supabase
  app.provide('supabase', supabase)
}) 