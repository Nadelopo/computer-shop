import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/db/supabase'
import type {
  ManufacturerCreate,
  ManufacturerRead,
  ManufacturerUpdate
} from '@/types/tables/manufacturers.types'
import type { DataError } from '@/types'

export const useManufacturersStore = defineStore('manufacturers', () => {
  const manufacturers = ref<ManufacturerRead[]>([])

  async function createManufacturer(
    params: ManufacturerCreate
  ): Promise<DataError<ManufacturerRead>> {
    const response = await supabase
      .from('manufacturers')
      .insert(params)
      .select()
      .single()

    if (response.data) {
      manufacturers.value.push(response.data)
    }

    return response
  }

  async function setManufacturers(): Promise<void> {
    const { data } = await supabase.from('manufacturers').select()
    if (data) manufacturers.value = data
  }

  async function getManufacturer(
    id: number
  ): Promise<DataError<ManufacturerRead>> {
    const response = await supabase
      .from('manufacturers')
      .select()
      .eq('id', id)
      .single()
    return response
  }

  async function updateManufacturer(
    id: number,
    params: ManufacturerUpdate
  ): Promise<DataError<ManufacturerRead>> {
    const response = await supabase
      .from('manufacturers')
      .update(params)
      .eq('id', id)
      .select()
      .single()

    if (response.data) {
      manufacturers.value = manufacturers.value.map((e) =>
        e.id === id ? response.data : e
      )
    }

    return response
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
