export type UserRead = Required<UserCreate>

export type UserCreate = {
  created_at?: string
  email: string
  id: string
  name: string
  phone?: number | null
  role?: 1 | 0
  favourites?: number[]
  comparison?: number[]
}

export type UserUpdate = Partial<UserCreate>

export const Role = {
  ADMIN: 0,
  USER: 1
} as const
