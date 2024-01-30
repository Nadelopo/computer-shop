import { ref } from 'vue'
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
  ProductWithSpecifications
} from '@/types/tables/products.types'
import type { ProductUpdate } from '@/types/tables/products.types'
import {
  createMany,
  createOne,
  getAll,
  getOneById,
  updateManyById,
  updateOneById
} from '@/db/queries/tables'
import type { UpdateMany } from '@/db/queries/types'
import type { PostgrestError } from '@supabase/supabase-js'
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
    const newProducts = ref<ProductWithSpecifications[]>([])

    const { data, count, error } = await getAll('products', {
      match: { categoryId: categoryId },
      select: '*, categories(id, enTitle), manufacturers(id, title)',
      range: [
        params.page * params.limit,
        params.page * params.limit + params?.limit - 1
      ]
    })
    if (error) {
      return { data: null, count, error }
    }

    const promises = []
    for (const product of data) {
      promises.push(
        getAll('specifications', {
          match: { productId: product.id },
          select:
            '*,  category_specifications(id, title, units, visible, type)',
          order: ['categorySpecificationsId']
        })
      )
    }

    let specificationsError: PostgrestError | null = null
    const specifications = await Promise.all(promises)
    for (const product of data) {
      const specificationProduct = specifications
        .map((s) => {
          if (s.error) {
            specificationsError = s.error
          }
          return s.data
        })
        .find((s) => s?.find((s) => s.productId === product.id))
      if (specificationProduct?.length) {
        const newProduct: ProductWithSpecifications = {
          ...product,
          specifications: specificationProduct
        }
        newProducts.value.push(newProduct)
      }
    }
    if (specificationsError) {
      return { data: null, count, error: specificationsError }
    }

    return { data: newProducts.value, count, error: null }
  }

  async function getProduct(
    productId: number
  ): Promise<DataError<ProductWithSpecifications>> {
    const [
      { data, error: errorProduct },
      { data: specifications, error: errorSpecifications }
    ] = await Promise.all([
      getOneById(
        'products',
        productId,
        '*, categories(id, enTitle), manufacturers(id, title)'
      ),
      getAll('specifications', {
        match: { productId: productId },
        select: '*, category_specifications(id, title, units, visible, type)',
        order: ['categorySpecificationsId']
      })
    ])
    const error: PostgrestError | null = errorProduct ?? errorSpecifications

    if (error) {
      return { data: null, error }
    }

    return {
      data: {
        ...data!,
        specifications: specifications!
      },
      error: null
    }
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
