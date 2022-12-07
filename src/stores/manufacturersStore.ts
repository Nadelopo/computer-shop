import { ref } from 'vue'
import { defineStore } from 'pinia'
import { create, getAll, getOneWithId, updateOne } from '@/utils/dbQueries'
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

    const getManufacturer = async (id: number) => {
      const { data } = await getOneWithId<ImanufacturerR>('manufacturers', id)
      return { data }
    }

    const updateManufacturer = async (id: number, params: ImanufacturerCU) => {
      const { data } = await updateOne<ImanufacturerCU, ImanufacturerR>(
        'manufacturers',
        id,
        params
      )
      if (data) {
        manufacturers.value = manufacturers.value.map((e) =>
          e.id === id ? data : e
        )
      }
    }

    setManufacturers()
    return {
      manufacturers,
      createManufacturer,
      setManufacturers,
      getManufacturer,
      updateManufacturer,
    }
  },
})
