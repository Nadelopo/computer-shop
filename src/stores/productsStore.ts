import { Ref, ref } from 'vue'
import { defineStore } from 'pinia'

import type {
  SpecificationCreate,
  SpecificationRead,
  SpecificationReadWithDetails,
  SpecificationUpdate
} from '@/types/tables/specifications.types'
import type {
  ProductCreate,
  ProductRead,
  ProductReadWithDetails,
  ProductWithSpecifications
} from '@/types/tables/products.types'
import type { ProductUpdate } from '@/types/tables/products.types'
import {
  createMany,
  createOne,
  getAllByColumns,
  getOneById,
  updateMany,
  updateOne
} from '@/utils/queries/db'
import type { UpdateMany } from '@/utils/queries/types'

export const useProductsStore = defineStore('products', () => {
  const products = ref<ProductWithSpecifications[]>([])
  const searchProducts = ref('')
  const loader = ref<'loading' | 'success' | 'empty'>('loading')

  async function createProduct(
    params: ProductCreate
  ): Promise<ProductRead | null> {
    const data = await createOne<ProductRead>('products', params)
    return data
  }

  async function createSpecifications(
    params: SpecificationCreate[]
  ): Promise<SpecificationRead[] | null> {
    const data = await createMany<SpecificationRead>('specifications', params)
    return data
  }

  async function setProducts(
    categoryId: number,
    params?: {
      search?: string
      order?: {
        value: string
        ascending?: boolean
      }
    }
  ): Promise<void> {
    loader.value = 'loading'
    products.value = []
    const newProducts = ref<ProductWithSpecifications[]>([])

    const data = await getAllByColumns<ProductReadWithDetails>(
      'products',
      [
        {
          column: 'categoryId',
          value: categoryId
        }
      ],
      {
        select: '*, categoryId(id, enTitle), manufacturerId(id, title)',
        order: {
          value: params?.order?.value,
          ascending: params?.order?.ascending
        },
        search: {
          column: 'name',
          value: params?.search
        }
      }
    )
    if (data?.length) {
      for (const product of data) {
        const specifications =
          await getAllByColumns<SpecificationReadWithDetails>(
            'specifications',
            [
              {
                column: 'productId',
                value: product.id
              }
            ],
            {
              select: '*,  categorySpecificationsId(id, title, units, visible)',
              order: {
                value: 'categorySpecificationsId'
              }
            }
          )

        if (specifications) {
          const newProduct: ProductWithSpecifications = {
            ...product,
            specifications
          }
          newProducts.value.push(newProduct)
        }
      }
    } else loader.value = 'empty'
    products.value = newProducts.value
    loader.value = 'success'
  }

  async function getProduct(
    productId: number
  ): Promise<Ref<ProductWithSpecifications | null>> {
    const product = ref<ProductWithSpecifications | null>(null)
    const data = await getOneById<ProductReadWithDetails>(
      'products',
      productId,
      '*, categoryId(id, enTitle), manufacturerId(id, title)'
    )

    if (data) {
      const specifications =
        await getAllByColumns<SpecificationReadWithDetails>(
          'specifications',
          [
            {
              column: 'productId',
              value: productId
            }
          ],
          {
            select: '*, categorySpecificationsId(id, title, units, visible)'
          }
        )
      if (specifications) {
        product.value = { ...data, specifications }
      }
    }
    return product
  }

  async function updateProduct(
    id: number,
    params: ProductUpdate
  ): Promise<ProductRead | null> {
    const data = await updateOne<ProductRead>('products', id, params)
    if (data) {
      const product = await getProduct(data.id)
      products.value = products.value.map((prod) =>
        prod.id === data.id ? product.value ?? prod : prod
      )
    }
    return data
  }

  async function updateProductSpecifications(
    specifications: UpdateMany<SpecificationUpdate>[]
  ) {
    const data = await updateMany<SpecificationRead>(
      'specifications',
      specifications
    )
    return data
  }

  return {
    products,
    createProduct,
    createSpecifications,
    setProducts,
    getProduct,
    updateProduct,
    updateProductSpecifications,
    searchProducts,
    loader
  }
})
