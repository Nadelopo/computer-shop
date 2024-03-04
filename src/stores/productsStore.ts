import { defineStore } from 'pinia'
import {
  createMany,
  createOne,
  getAll,
  getOneById,
  updateManyById,
  updateOneById
} from '@/db/queries/tables'
import type {
  SpecificationCreate,
  SpecificationRead,
  SpecificationUpdate
} from '@/types/tables/specifications.types'
import type {
  ProductCreate,
  ProductRead,
  ProductWithSpecifications
} from '@/types/tables/products.types'
import type { ProductUpdate } from '@/types/tables/products.types'
import type { UpdateMany } from '@/db/queries/types'
import type { DataError } from '@/types'

export const useProductsStore = defineStore('products', () => {
  async function createProduct(
    params: ProductCreate
  ): Promise<DataError<ProductRead>> {
    const { data, error } = await createOne('products', params)
    return { data, error } as DataError<ProductRead>
  }

  async function createSpecifications(
    params: SpecificationCreate[]
  ): Promise<DataError<SpecificationRead[]>> {
    const { data, error } = await createMany('specifications', params)
    return { data, error } as DataError<SpecificationRead[]>
  }

  async function getProducts(
    categoryId: number,
    params: {
      page: number
      limit: number
    } = {
      limit: 300,
      page: 0
    }
  ): Promise<
    DataError<ProductWithSpecifications[]> & { count: number | null }
  > {
    const { data, count, error } = await getAll('products', {
      match: { categoryId: categoryId },
      select:
        '*, categories(id, enTitle), manufacturers(id, title), specifications(*,  category_specifications(id, title, units, visible, type))',
      range: [
        params.page * params.limit,
        params.page * params.limit + params?.limit - 1
      ],
      order: [
        ['id'],
        ['categorySpecificationsId', { foreignTable: 'specifications' }]
      ]
    })

    if (error) {
      return { data: null, count, error }
    }

    return { data, count, error: null }
  }

  async function getProduct(
    productId: number
  ): Promise<DataError<ProductWithSpecifications>> {
    const { data, error } = await getOneById(
      'products',
      productId,
      '*, categories(id, enTitle), manufacturers(id, title), specifications(*, category_specifications!inner(id, title, units, visible, type))',
      {
        order: ['categorySpecificationsId', { foreignTable: 'specifications' }]
      }
    )
    if (error) {
      return { data: null, error }
    }

    return { data, error: null }
  }

  async function updateProduct(
    id: number,
    params: ProductUpdate
  ): Promise<DataError<ProductRead>> {
    const { data, error } = await updateOneById('products', id, params)

    return { data, error } as DataError<ProductRead>
  }

  async function updateProductSpecifications(
    specifications: UpdateMany<SpecificationUpdate>[]
  ) {
    const updatedSpecifications = await updateManyById(
      'specifications',
      specifications
    )
    return updatedSpecifications.sort(
      (a, b) => a.categorySpecificationsId - b.categorySpecificationsId
    )
  }

  return {
    createProduct,
    createSpecifications,
    getProducts,
    getProduct,
    updateProduct,
    updateProductSpecifications
  }
})
