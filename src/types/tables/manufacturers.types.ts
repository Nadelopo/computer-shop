export type ManufacturerRead = {
  created_at: string
  description: string
  id: number
  img: string
  title: string
}
export type ManufacturerCreate = {
  created_at?: string
  description: string
  id?: number
  img: string
  title: string
}

export type ManufacturerUpdate = Partial<ManufacturerCreate>
