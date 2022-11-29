import { ref } from 'vue'
import { defineStore } from 'pinia'
import { create, createMany, getAllByColumn } from '@/utils/dbQueries'
import type {
  Iproduct,
  IproductWithSpecifications,
  IproductCU,
  IproductSpecification,
  IspetificationsCU,
} from './types'

export const useProductsStore = defineStore('products', {
  state: () => {
    const products = ref<IproductWithSpecifications[]>([])
    const categoryId = ref(0)

    const createProduct = async (params: IproductCU) => {
      const { data } = await create('products', params)

      return { data }
    }

    const createSpecifications = async (params: IspetificationsCU[]) => {
      const { data } = await createMany('specifications', params)
      if (data) {
        console.log(data)
      }
    }

    //fix
    const getProductsCard = async (categoryId: number) => {
      const newProducts = ref<IproductWithSpecifications[]>([])
      const { data } = await getAllByColumn<Iproduct>(
        'products',
        'categoryId',
        categoryId,
        '*, manufacturerId(id, title)'
      )
      if (data?.length) {
        data.forEach(async (product) => {
          const { data: specifications } =
            await getAllByColumn<IproductSpecification>(
              'specifications',
              'productId',
              product.id,
              'value,  categorySpecificationsId!inner(title, units, visible)'
            )

          if (specifications) {
            const newProduct: IproductWithSpecifications = {
              ...product,
              specifications,
            }
            newProducts.value.push(newProduct)
          }
        })
      }
      products.value = newProducts.value
    }
    return {
      products,
      createProduct,
      createSpecifications,
      getProductsCard,
      categoryId,
    }
  },
})
