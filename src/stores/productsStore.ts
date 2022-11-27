import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { defaultValues } from './types'
import { create } from '@/utils/dbQueries'

export interface IspetificationsForm {
  productId: number
  value: string
  categoryFieldId: number
}

export interface Ispetifications extends defaultValues, IspetificationsForm {}

export interface IproductsForm {
  categoryId: number
  name: string
  description: string
  manufacturer: string
  img: string
  warranty: number
  quantity: number
  price: number
  rating: number
  countReviews: number
  popularity: number
}

interface Iproducts extends defaultValues, IproductsForm {}

export const useProductsStore = defineStore('products', {
  state: () => {
    const products = ref<Iproducts[]>([])

    return { products }
  },
  actions: {
    async createProduct(params: IproductsForm) {
      const { data } = await create<IproductsForm, Iproducts>(
        'products',
        params
      )
      if (data) {
        this.products.push(data)
      }
    },
    async createSpecifications(params: IspetificationsForm) {
      const { data } = await create<IspetificationsForm, Ispetifications>(
        'specifications',
        params
      )
      if (data) {
        // this.products.push(data)
      }
    },
  },
})
