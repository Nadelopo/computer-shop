export type UserRead = Required<
  Omit<
    UserCreate,
    | 'address'
    | 'floor'
    | 'apartment'
    | 'entrance'
    | 'city'
    | 'comparison'
    | 'favourites'
  >
>
export type UserReadWithDetails = Required<UserCreate>

export type UserCreate = {
  created_at?: string
  email: string
  id: string
  name: string
  phone?: number | null
  role?: (typeof Role)[keyof typeof Role]
  favourites?: number[]
  comparison?: number[]
  address?: string | null
  apartment?: number | null
  floor?: number | null
  entrance?: number | null
  city?: string | null
}

export type UserUpdate = Partial<UserCreate>

export const Role = {
  ADMIN: 0,
  USER: 1
} as const
