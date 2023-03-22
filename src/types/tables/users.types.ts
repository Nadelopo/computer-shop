export type UserRead = {
  created_at: string
  email: string
  id: string
  name: string
  phone: number | null
  role: number
}

export type UserCreate = {
  created_at?: string
  email: string
  id: string
  name: string
  phone?: number | null
  role?: number
}

export type UserUpdate = Partial<UserCreate>
