export type ReviewRating = 1 | 2 | 3 | 4 | 5

export type UsersRated = {
  userId: string
  evaluation: boolean // true - like, false - dislike
}

export type ReviewCreate = {
  comment?: string | null
  created_at?: string
  dignities?: string | null
  disadvantages?: string | null
  id?: number
  evaluation?: number
  productId: number
  rating: ReviewRating
  userId: string
  usersRated?: UsersRated[]
}

export type ReviewRead = Required<ReviewCreate>

export type ReviewReadWithDetails = ReviewRead & {
  users: {
    name: string
  }
}

export type ReviewWithDetails = ReviewReadWithDetails & {
  products: {
    categories: {
      id: number
      enTitle: string
    }
  }
}

export type ReviewUpdate = Partial<ReviewCreate>
