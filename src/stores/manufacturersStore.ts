import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { PostgrestError } from '@supabase/supabase-js'
import type {
  ManufacturerCreate,
  ManufacturerRead,
  ManufacturerUpdate
} from '@/types/tables/manufacturers.types'
import {
  createOne,
  getAll,
  getOneById,
  updateOneById
} from '@/db/queries/tables'
import type { DataError } from '@/types'

export const useManufacturersStore = defineStore('manufacturers', () => {
  const manufacturers = ref<ManufacturerRead[]>([])

  async function createManufacturer(
    params: ManufacturerCreate
  ): Promise<DataError<ManufacturerRead>> {
    const { data, error } = await createOne('manufacturers', params)
    if (error) return { data, error }
    manufacturers.value.push(data)
    return { data, error }
  }

  async function setManufacturers(): Promise<void> {
    const { data } = await getAll('manufacturers')
    if (data) manufacturers.value = data
  }

  async function getManufacturer(
    id: number
  ): Promise<DataError<ManufacturerRead>> {
    const { data, error } = await getOneById('manufacturers', id)
    return { data, error } as
      | { data: ManufacturerRead; error: null }
      | { data: null; error: PostgrestError }
  }

  async function updateManufacturer(
    id: number,
    params: ManufacturerUpdate
  ): Promise<DataError<ManufacturerRead>> {
    const { data, error } = await updateOneById('manufacturers', id, params)
    if (error) return { data, error }
    manufacturers.value = manufacturers.value.map((e) =>
      e.id === id ? data : e
    )
    return { data, error }
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
