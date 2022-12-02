import { ref } from 'vue'
import { defineStore } from 'pinia'
import { create, getAll } from '@/utils/dbQueries'
import type { ImanufacturerCU, ImanufacturerR } from '@/types/tables'

export const useManufacturersStore = defineStore('manufacturers', {
  state: () => {
    const manufacturers = ref<ImanufacturerR[]>([])

    const createManufacturer = async (params: ImanufacturerCU) => {
      const { data } = await create<ImanufacturerCU, ImanufacturerR>(
        'manufacturers',
        params
      )
      if (data) {
        manufacturers.value.push(data)
      }
      return { data }
    }

    const setManufacturers = async () => {
      const { data } = await getAll<ImanufacturerR>('manufacturers')
      if (data) manufacturers.value = data
    }

    setManufacturers()
    return { manufacturers, createManufacturer, setManufacturers }
  },
})
