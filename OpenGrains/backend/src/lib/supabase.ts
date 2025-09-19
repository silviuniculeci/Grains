import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../../shared/types/database'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create admin client with service role key for backend operations
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Helper function to create user-specific client with RLS
export const createUserClient = (accessToken: string) => {
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
  if (!supabaseAnonKey) {
    throw new Error('Missing Supabase anon key')
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export default supabaseAdmin