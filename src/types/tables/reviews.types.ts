export type ReviewRead = Required<ReviewCreate>

export type ReviewRating = 1 | 2 | 3 | 4 | 5

export type UsersRated = {
  userId: string
  evaluation: boolean // true - like, false - dislike
}

export type ReviewReadWithDetails = ReviewRead & {
  users: {
    name: string
  }
}

export type ReviewWithDetails = ReviewReadWithDetails & {
  categories: {
    id: number
    enTitle: string
  }
}

export type ReviewCreate = {
  comment?: string | null
  created_at?: string
  dignities?: string | null
  disadvantages?: string | null
  dislikes?: number
  id?: number
  likes?: number
  productId: number
  rating: ReviewRating
  userId: string
  usersRated?: UsersRated[]
  categoryId: number
}

export type ReviewUpdate = Partial<ReviewCreate>
