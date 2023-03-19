export interface CategoriesRead {
  created_at: string
  enTitle: string
  id: number
  img: string
  title: string
}

export interface CategoriesInsert {
  created_at?: string
  enTitle: string
  id?: number
  img: string
  title: string
}

export interface CategoriesUpdate {
  created_at?: string
  enTitle?: string
  id?: number
  img?: string
  title?: string
}
