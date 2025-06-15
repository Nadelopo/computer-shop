export type ManufacturerCreate = {
  created_at?: string
  description: string
  id?: number
  img: string
  title: string
}

export type ManufacturerRead = Required<ManufacturerCreate>

export type ManufacturerUpdate = Partial<ManufacturerCreate>
