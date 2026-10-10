import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export interface SupabaseResult {
  client?: any
  error?: string
}

export function createSupabaseClient(): SupabaseResult {
  // Validate URL
  if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL') {
    return {
      error: 'VITE_SUPABASE_URL is not configured. Please set it in your .env.local or environment variables.',
    }
  }

  // Validate anon key
  if (!supabaseAnonKey || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
    return {
      error: 'VITE_SUPABASE_ANON_KEY is not configured. Please set it in your .env.local or environment variables.',
    }
  }

  // Create and return client
  try {
    const client = createClient(supabaseUrl, supabaseAnonKey)
    return { client }
  } catch (err) {
    return {
      error: 'Failed to initialize Supabase client. Please check your configuration.',
    }
  }
}

// Initialize client
const result = createSupabaseClient()
export const supabase = result.client!
export const supabaseError = result.error
