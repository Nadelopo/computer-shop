import { ref } from 'vue'
import { defineStore } from 'pinia'
import {
  create,
  createMany,
  getAllByColumn,
  getOneWithId,
  updateManyById,
  updateOne,
} from '@/utils/dbQueries'
import type { IproductWithSpecifications } from '@/types'
import type {
  IproductC,
  IproductR,
  IproductSpecificationC,
  IproductSpecificationR,
  IproductSpecificationU,
  IproductU,
} from '@/types/tables'

export const useProductsStore = defineStore('products', {
  state: () => {
    const products = ref<IproductWithSpecifications[]>([])
    const categoryId = ref(0)

    const createProduct = async (params: IproductC) => {
      const { data } = await create<IproductC, IproductR>('products', params)

      return { data }
    }

    const createSpecifications = async (params: IproductSpecificationC[]) => {
      const { data } = await createMany<
        IproductSpecificationC[],
        IproductSpecificationR[]
      >('specifications', params)
      if (data) {
        console.log(data)
      }
    }

    //fix
    const getProductsCard = async (categoryId: number) => {
      const newProducts = ref<IproductWithSpecifications[]>([])
      const { data } = await getAllByColumn<IproductR>(
        'products',
        'categoryId',
        categoryId,
        '*, manufacturerId(id, title)'
      )
      if (data?.length) {
        data.forEach(async (product) => {
          const { data: specifications } =
            await getAllByColumn<IproductSpecificationR>(
              'specifications',
              'productId',
              product.id,
              'id, value,  categorySpecificationsId(id, title, units, visible)'
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

    const getProduct = async (
      productId: number,
      selectSpecifications?: string
    ) => {
      const product = ref<IproductWithSpecifications | null>(null)

      const { data } = await getOneWithId<IproductR>(
        'products',
        productId,
        '*, manufacturerId(id, title)'
      )

      const selectValue =
        selectSpecifications ??
        'id, value,  categorySpecificationsId(id, title, units)'
      if (data) {
        const { data: specifications } =
          await getAllByColumn<IproductSpecificationR>(
            'specifications',
            'productId',
            productId,
            selectValue
          )
        if (specifications) {
          product.value = { ...data, specifications }
        }
      }
      return product
    }

    const updateProduct = async (id: number, params: IproductU) => {
      const { data } = await updateOne<IproductU, IproductR>(
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
      const { data } = await updateManyById<
        IproductSpecificationU[],
        IproductSpecificationR[]
      >('specifications', specifications)
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
