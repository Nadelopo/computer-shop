import { ref } from 'vue'
import { defineStore } from 'pinia'
import { create, createMany, getAllFromField } from '@/utils/dbQueries'
import { supabase } from '@/supabase'
import type {
  Iproduct,
  IproductCard,
  IproductForm,
  IspecificationsProductCard,
  Ispetifications,
  IspetificationsForm,
} from './types'

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
      const products = ref<IproductCard[]>([])
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
            products.value.push(product)
            // console.log(product)
          }
        })
      }
      return { products }
    },
  },
})
