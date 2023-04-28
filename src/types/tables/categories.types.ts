export type CategoryRead = Required<CategoryCreate>

export type CategoryCreate = {
  created_at?: string
  enTitle: string
  id?: number
  img: string
  title: string
}

export type CategoryUpdate = Partial<CategoryCreate>
