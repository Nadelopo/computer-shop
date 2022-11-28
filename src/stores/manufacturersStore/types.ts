import type { defaultValues } from '../types'

export interface ImanufacturerCU {
  title: string
  img: string
  description: string
}

export interface Imanufacturer extends ImanufacturerCU, defaultValues {}
