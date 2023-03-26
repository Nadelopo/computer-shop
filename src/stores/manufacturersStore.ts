import { ref } from 'vue'
import { defineStore } from 'pinia'
import type {
  ManufacturerCreate,
  ManufacturerRead,
  ManufacturerUpdate
} from '@/types/tables/manufacturers.types'
import { createOne, getAll, getOneById, updateOne } from '@/utils/queries/db'

export const useManufacturersStore = defineStore('manufacturers', () => {
  const manufacturers = ref<ManufacturerRead[]>([])

  async function createManufacturer(
    params: ManufacturerCreate
  ): Promise<ManufacturerRead | null> {
    const data = await createOne<ManufacturerRead>('manufacturers', params)
    if (data) {
      manufacturers.value.push(data)
    }
    return data
  }

  async function setManufacturers(): Promise<void> {
    const data = await getAll<ManufacturerRead>('manufacturers')
    if (data) manufacturers.value = data
  }

  async function getManufacturer(id: number): Promise<ManufacturerRead | null> {
    const data = await getOneById<ManufacturerRead>('manufacturers', id)
    return data
  }

  async function updateManufacturer(
    id: number,
    params: ManufacturerUpdate
  ): Promise<ManufacturerRead | null> {
    const data = await updateOne<ManufacturerRead>('manufacturers', id, params)
    if (data) {
      manufacturers.value = manufacturers.value.map((e) =>
        e.id === id ? data : e
      )
    }
    return data
  }

  setManufacturers()
  return {
    manufacturers,
    createManufacturer,
    setManufacturers,
    getManufacturer,
    updateManufacturer
  }
})
