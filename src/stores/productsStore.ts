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
  getAll,
  getOneById,
  updateMany,
  updateOne
} from '@/utils/queries/db'
import type { UpdateMany } from '@/utils/queries/types'

export const useProductsStore = defineStore('products', () => {
  async function createProduct(
    params: ProductCreate
  ): Promise<ProductRead | null> {
    const data = await createOne('products', params)
    return data
  }

  async function createSpecifications(
    params: SpecificationCreate[]
  ): Promise<SpecificationRead[] | null> {
    return await createMany('specifications', params)
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
  ): Promise<{ data: ProductWithSpecifications[]; count: number | null }> {
    const newProducts = ref<ProductWithSpecifications[]>([])

    const { data, count } = await getAll<ProductReadWithDetails>('products', {
      match: { categoryId: categoryId },
      select: '*, categories(id, enTitle), manufacturers(id, title)',
      range: [
        params.page * params.limit,
        params.page * params.limit + params?.limit - 1
      ]
    })

    if (data?.length) {
      const promises = []
      for (const product of data) {
        promises.push(
          getAll<SpecificationReadWithDetails>('specifications', {
            match: { productId: product.id },
            select: '*,  category_specifications(id, title, units, visible)',
            order: {
              value: 'categorySpecificationsId'
            }
          })
        )
      }

      const specifications = await Promise.all(promises)
      for (const product of data) {
        const specificationProduct = specifications
          .map((s) => s.data)
          .find((s) => s?.find((s) => s.productId === product.id))
        if (specificationProduct?.length) {
          const newProduct: ProductWithSpecifications = {
            ...product,
            specifications: specificationProduct
          }
          newProducts.value.push(newProduct)
        }
      }
    }
    return { data: newProducts.value, count }
  }

  async function getProduct(
    productId: number
  ): Promise<Ref<ProductWithSpecifications | null>> {
    const product = ref<ProductWithSpecifications | null>(null)

    const [data, { data: specifications }] = await Promise.all([
      getOneById<ProductReadWithDetails>('products', productId, {
        select: '*, categories(id, enTitle), manufacturers(id, title)'
      }),
      getAll<SpecificationReadWithDetails>('specifications', {
        match: { productId: productId },
        select: '*, category_specifications(id, title, units, visible)',
        order: {
          value: 'categorySpecificationsId'
        }
      })
    ])
    if (data && specifications) {
      product.value = { ...data, specifications }
    }

    return product
  }

  async function updateProduct(
    id: number,
    params: ProductUpdate
  ): Promise<ProductRead | null> {
    const data = await updateOne('products', id, params)
    if (data) {
      const product = await getProduct(data.id)
      product.value?.specifications.sort(
        (a, b) => a.category_specifications.id - b.category_specifications.id
      )
    }
    return data
  }

  async function updateProductSpecifications(
    specifications: UpdateMany<SpecificationUpdate>[]
  ) {
    const updatedSpecifications = await updateMany(
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
