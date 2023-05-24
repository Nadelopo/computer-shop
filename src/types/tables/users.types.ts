export type UserRead = Required<UserCreate>

export type UserCreate = {
  created_at?: string
  email: string
  id: string
  name: string
  phone?: number | null
  role?: number
  favourites?: number[]
  comparison?: number[]
}

export type UserUpdate = Partial<UserCreate>
