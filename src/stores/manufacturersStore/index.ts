import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { ImanufacturerCU, Imanufacturer } from './types'
import { create, getAll } from '@/utils/dbQueries'

export const useManufacturersStore = defineStore('manufacturers', {
  state: () => {
    const manufacturers = ref<Imanufacturer[]>([])

    return { manufacturers }
  },
  actions: {
    async createManufacturer(params: ImanufacturerCU) {
      const { data } = await create('manufacturers', params)
      if (data) {
        this.manufacturers.push(data)
      }
      return { data }
    },
    async setManufacturers() {
      const { data } = await getAll<Imanufacturer>('manufacturers')
      if (data) this.manufacturers = data
    },
  },
})
