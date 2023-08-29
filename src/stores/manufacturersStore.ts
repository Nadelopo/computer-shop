import { ref } from 'vue'
import { defineStore } from 'pinia'
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
} from '@/utils/queries/db'

export const useManufacturersStore = defineStore('manufacturers', () => {
  const manufacturers = ref<ManufacturerRead[]>([])

  async function createManufacturer(
    params: ManufacturerCreate
  ): Promise<ManufacturerRead | null> {
    const data = await createOne('manufacturers', params)
    if (data) {
      manufacturers.value.push(data)
    }
    return data
  }

  async function setManufacturers(): Promise<void> {
    const { data } = await getAll('manufacturers')
    if (data) manufacturers.value = data
  }

  async function getManufacturer(id: number): Promise<ManufacturerRead | null> {
    return getOneById('manufacturers', id)
  }

  async function updateManufacturer(
    id: number,
    params: ManufacturerUpdate
  ): Promise<ManufacturerRead | null> {
    const data = await updateOneById('manufacturers', id, params)
    if (data) {
      manufacturers.value = manufacturers.value.map((e) =>
        e.id === id ? data : e
      )
    }
    return data
  }

  return {
    manufacturers,
    createManufacturer,
    setManufacturers,
    getManufacturer,
    updateManufacturer
  }
})
