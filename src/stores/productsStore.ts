import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { defaultValues } from './types'
import { create, createMany, getAllFromField } from '@/utils/dbQueries'
import { supabase } from '@/supabase'

export interface IspetificationsForm {
  productId: number
  value: string
  categoryFieldId: number
}

export interface Ispetifications extends defaultValues, IspetificationsForm {}

export interface IproductForm {
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

interface Iproduct extends defaultValues, IproductForm {}

interface IspecificationsProductCard {
  categoryFieldId: {
    title: string
    units: string
  }
  value: string
}

interface IproductCard extends defaultValues, IproductForm {
  fields: IspecificationsProductCard[]
}

export const useProductsStore = defineStore('products', {
  state: () => {
    const products = ref<Iproduct[]>([])

    return { products }
  },
  actions: {
    async createProduct(params: IproductForm) {
      const { data } = await create<IproductForm, Iproduct>('products', params)
      if (data) {
        this.products.push(data)
      }
      return { data }
    },
    async createSpecifications(params: IspetificationsForm[]) {
      const { data } = await createMany<
        IspetificationsForm[],
        Ispetifications[]
      >('specifications', params)
      if (data) {
        console.log(data)
        // this.products.push(data)
      }
    },
    //fix
    async getProductsCard(categoryId: number) {
      const products: IproductCard[] = []
      const { data } = await getAllFromField<any>(
        'products',
        'categoryId',
        categoryId
      )
      if (data) {
        // console.log(data)
        data.forEach(async (product: IproductCard) => {
          // console.log(product)
          const { data: fields, error: fieldsError } = await supabase
            .from<IspecificationsProductCard>('specifications')
            .select('value,  categoryFieldId!inner(title, units)')
            .match({ 'categoryFieldId.visible': true, productId: product.id })
          if (fieldsError) console.log(fieldsError)
          if (fields) {
            product.fields = fields
            products.push(product)
            // console.log(product)
          }
        })
      }
      return { products }
    },
  },
})
