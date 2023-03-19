export interface ManufacturerRead {
  created_at: string
  description: string
  id: number
  img: string
  title: string
}
export interface ManufacturerInsert {
  created_at?: string
  description: string
  id?: number
  img: string
  title: string
}
export interface ManufacturerUpdate {
  created_at?: string
  description?: string
  id?: number
  img?: string
  title?: string
}
