export type CategoryRead = {
  created_at: string
  enTitle: string
  id: number
  img: string
  title: string
}

export type CategoryCreate = {
  created_at?: string
  enTitle: string
  id?: number
  img: string
  title: string
}

export type CategoryUpdate = Partial<CategoryCreate>
