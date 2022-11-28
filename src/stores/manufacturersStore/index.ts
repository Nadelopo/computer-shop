import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { ImanufacturerCU, Imanufacturer } from './types'
import { create, getAll } from '@/utils/dbQueries'

export const useManufacturersStore = defineStore('manufacturers', {
  state: () => {
    const manufacturers = ref<Imanufacturer[]>([])

    const createManufacturer = async (params: ImanufacturerCU) => {
      const { data } = await create('manufacturers', params)
      if (data) {
        manufacturers.value.push(data)
      }
      return { data }
    }

    const setManufacturers = async () => {
      const { data } = await getAll<Imanufacturer>('manufacturers')
      if (data) manufacturers.value = data
    }

    setManufacturers()
    return { manufacturers, createManufacturer, setManufacturers }
  },
})
