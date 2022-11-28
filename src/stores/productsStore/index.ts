import { ref } from 'vue'
import { defineStore } from 'pinia'
import { create, createMany, getAllFromColumn } from '@/utils/dbQueries'
import { supabase } from '@/supabase'
import type {
  Iproduct,
  IproductWithSpecifications,
  IproductCU,
  IproductSpecification,
  IspetificationsCU,
} from './types'

export const useProductsStore = defineStore('products', {
  state: () => {
    const products = ref<Iproduct[]>([])

    return { products }
  },
  actions: {
    async createProduct(params: IproductCU) {
      const { data } = await create('products', params)

      return { data }
    },
    async createSpecifications(params: IspetificationsCU[]) {
      const { data } = await createMany('specifications', params)
      if (data) {
        console.log(data)
      }
    },
    //fix
    async getProductsCard(categoryId: number) {
      const products = ref<IproductWithSpecifications[]>([])
      const { data } = await getAllFromColumn<Iproduct>(
        'products',
        'categoryId',
        categoryId
      )

      if (data) {
        data.forEach(async (product) => {
          const { data: fields, error: fieldsError } = await supabase
            .from<IproductSpecification>('specifications')
            .select('value,  categoryFieldId!inner(title, units, visible)')
            .eq('productId', product.id)
          if (fieldsError) console.log(fieldsError)
          if (fields) {
            const newProduct: IproductWithSpecifications = {
              ...product,
              fields,
            }
            products.value.push(newProduct)
          }
        })
      }
      return { products }
    },
  },
})
