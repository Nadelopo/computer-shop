import { ref } from 'vue'
import { defineStore } from 'pinia'
import { create, createMany, getAllFromColumn } from '@/utils/dbQueries'
import { supabase } from '@/supabase'
import type {
  Iproduct,
  IproductCard,
  IproductForm,
  IspecificationsProductCard,
  IspetificationsForm,
} from './types'

export const useProductsStore = defineStore('products', {
  state: () => {
    const products = ref<Iproduct[]>([])

    return { products }
  },
  actions: {
    async createProduct(params: IproductForm) {
      const { data } = await create('products', params)

      return { data }
    },
    async createSpecifications(params: IspetificationsForm[]) {
      const { data } = await createMany('specifications', params)
      if (data) {
        console.log(data)
      }
    },
    //fix
    async getProductsCard(categoryId: number) {
      const products = ref<IproductCard[]>([])
      const { data } = await getAllFromColumn<Iproduct>(
        'products',
        'categoryId',
        categoryId
      )

      if (data) {
        data.forEach(async (product) => {
          const { data: fields, error: fieldsError } = await supabase
            .from<IspecificationsProductCard>('specifications')
            .select('value,  categoryFieldId!inner(title, units, visible)')
            .eq('productId', product.id)
          if (fieldsError) console.log(fieldsError)
          if (fields) {
            const newProduct: IproductCard = { ...product, fields }
            products.value.push(newProduct)
          }
        })
      }
      return { products }
    },
  },
})
