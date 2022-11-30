import { ref } from 'vue'
import { defineStore } from 'pinia'
import {
  create,
  createMany,
  getAllByColumn,
  getOneWithId,
  updateMany,
  updateOne,
} from '@/utils/dbQueries'
import type {
  Iproduct,
  IproductWithSpecifications,
  IproductC,
  IproductSpecification,
  IspetificationsCU,
  IproductU,
  IproductSpecificationU,
} from './types'

export const useProductsStore = defineStore('products', {
  state: () => {
    const products = ref<IproductWithSpecifications[]>([])
    const categoryId = ref(0)

    const createProduct = async (params: IproductC) => {
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
              'id, value,  categorySpecificationsId!inner(id, title, units, visible, type)'
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

    const getProduct = async (productId: number) => {
      const product = ref<IproductWithSpecifications | null>(null)
      const { data } = await getOneWithId<Iproduct>(
        'products',
        productId,
        '*, manufacturerId(id, title)'
      )
      if (data) {
        const { data: specifications } =
          await getAllByColumn<IproductSpecification>(
            'specifications',
            'productId',
            productId,
            'id, value,  categorySpecificationsId!inner(id, title, units, visible, type)'
          )
        if (specifications) {
          product.value = { ...data, specifications }
        }
      }
      return product
    }

    const updateProduct = async (id: number, params: IproductU) => {
      const { data } = await updateOne<IproductWithSpecifications>(
        'products',
        id,
        params
      )
      if (data) {
        const product = await getProduct(data.id)
        products.value = products.value.map((prod) =>
          prod.id === data.id ? product.value ?? prod : prod
        )
      }
      return { data }
    }

    const updateProductSpecifications = async (
      specifications: IproductSpecificationU[]
    ) => {
      const { data } = await updateMany<IproductWithSpecifications>(
        'specifications',
        specifications
      )
      return { data }
    }

    return {
      products,
      createProduct,
      createSpecifications,
      getProductsCard,
      categoryId,
      getProduct,
      updateProduct,
      updateProductSpecifications,
    }
  },
})
