import { createClient } from '@supabase/supabase-js'

// export interface Database {
//   public: {
//     Tables: {
//       Users: {
//         Row: {
//           id: string
//           created_at: Date
//           name: string
//           phone: number
//           email: string
//           role: number
//         }
//         Insert: {
//           name: string
//           phone: number
//           email: string
//           role: number
//         }
//         Update: {
//           name?: string
//           phone?: number
//           email?: string
//           role?: number
//         }
//       }
//       Categories: {
//         Row: {
//           id: number
//           created_at: Date
//           title: string
//           enTitle: string
//           img: string
//         }
//         Insert: {
//           title: string
//           enTitle: string
//           img: string
//         }
//         Update: {
//           title: string
//           enTitle: string
//           img: string
//         }
//       }
//     }
//     Functions: {}
//     Views: {}
//   }
// }

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_API_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
