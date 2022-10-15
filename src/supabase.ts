import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_API_KEY

type Database = {
  public: {
    Tables: {
      Users: {
        Row: {
          id: string
          created_at: Date
          email: string
          name: string
          phone: number
          role: number
        } // The data expected to be returned from a "select" statement.
        Insert: {
          id?: string
          created_at?: Date
          email?: string
          name?: string
          phone?: number
          role?: number
        } // The data expected passed to an "insert" statement.
        Update: {
          id?: string
          created_at?: Date
          email?: string
          name?: string
          phone?: number
          role?: number
        } // The data expected passed to an "update" statement.
      }
    }
    Views: {}
    Functions: {}
  }
}

export const supabase = createClient<Database, 'public', Database['public']>(
  supabaseUrl,
  supabaseAnonKey
)

export async function getMovies() {
  const { data } = await supabase.from('Users').select()
  return data
}
