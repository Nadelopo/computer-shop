export type ReviewRead = Required<ReviewCreate>

export type ReviewCreateRating = 1 | 2 | 3 | 4 | 5

export type ReviewWithDetails = Required<Omit<ReviewCreate, 'userId'>> & {
  userId: {
    id: string
    name: string
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
  rating: ReviewCreateRating
  userId: string
  name: string
}

export type ReviewUpdate = Partial<ReviewCreate>
