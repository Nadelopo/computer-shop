export interface UserRead {
  created_at: string
  email: string
  id: string
  name: string
  phone: number | null
  role: number
}

export interface UserInsert {
  created_at?: string
  email: string
  id: string
  name: string
  phone?: number | null
  role?: number
}

export interface UserUpdate {
  created_at?: string
  email?: string
  id?: string
  name?: string
  phone?: number | null
  role?: number
}
