import { Ref, ref } from 'vue'
import { defineStore } from 'pinia'

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
import {
  createMany,
  createOne,
  getAll,
  getOneById,
  updateManyById,
  updateOneById
} from '@/utils/queries/db'
import type { UpdateMany } from '@/utils/queries/types'

export const useProductsStore = defineStore('products', () => {
  async function createProduct(
    params: ProductCreate
  ): Promise<ProductRead | null> {
    return createOne('products', params)
  }

  async function createSpecifications(
    params: SpecificationCreate[]
  ): Promise<SpecificationRead[] | null> {
    return createMany('specifications', params)
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

    const { data, count } = await getAll('products', {
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
          getAll('specifications', {
            match: { productId: product.id },
            select: '*,  category_specifications(id, title, units, visible)',
            order: ['categorySpecificationsId']
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
      getOneById(
        'products',
        productId,
        '*, categories(id, enTitle), manufacturers(id, title)'
      ),
      getAll('specifications', {
        match: { productId: productId },
        select: '*, category_specifications(id, title, units, visible)',
        order: ['categorySpecificationsId']
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
    const data = await updateOneById('products', id, params)
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
