export interface CategoryRead {
  created_at: string
  enTitle: string
  id: number
  img: string
  title: string
}

export interface CategoryInsert {
  created_at?: string
  enTitle: string
  id?: number
  img: string
  title: string
}

export interface CategoryUpdate {
  created_at?: string
  enTitle?: string
  id?: number
  img?: string
  title?: string
}
