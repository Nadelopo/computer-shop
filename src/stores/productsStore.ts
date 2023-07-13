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
  const products = ref<ProductWithSpecifications[]>([])
  const loading = ref<'loading' | 'success' | 'empty'>('loading')

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

  async function setProducts(categoryId: number): Promise<void> {
    loading.value = 'loading'
    products.value = []
    const newProducts = ref<ProductWithSpecifications[]>([])

    const data = await getAll<ProductReadWithDetails>('products', {
      eq: [['categoryId', categoryId]],
      select: '*, categories(id, enTitle), manufacturers(id, title)'
    })

    if (data?.length) {
      const promises = []
      for (const product of data) {
        promises.push(
          getAll<SpecificationReadWithDetails>('specifications', {
            eq: [['productId', product.id]],
            select: '*,  category_specifications(id, title, units, visible)',
            order: {
              value: 'categorySpecificationsId'
            }
          })
        )
      }

      const specifications = await Promise.all(promises)
      for (const product of data) {
        const specificationProduct = specifications.find((s) =>
          s?.find((s) => s.productId === product.id)
        )
        if (specificationProduct?.length) {
          const newProduct: ProductWithSpecifications = {
            ...product,
            specifications: specificationProduct
          }
          newProducts.value.push(newProduct)
        }
      }
    } else loading.value = 'empty'
    products.value = newProducts.value
    loading.value = 'success'
  }

  async function getProduct(
    productId: number
  ): Promise<Ref<ProductWithSpecifications | null>> {
    const product = ref<ProductWithSpecifications | null>(null)
    const data = await getOneById<ProductReadWithDetails>(
      'products',
      productId,
      {
        select: '*, categories(id, enTitle), manufacturers(id, title)'
      }
    )

    if (data) {
      const specifications = await getAll<SpecificationReadWithDetails>(
        'specifications',
        {
          eq: [['productId', productId]],
          select: '*, category_specifications(id, title, units, visible)',
          order: {
            value: 'categorySpecificationsId'
          }
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
    const data = await updateOne('products', id, params)
    if (data) {
      const product = await getProduct(data.id)
      product.value?.specifications.sort(
        (a, b) => a.category_specifications.id - b.category_specifications.id
      )
      console.log(product)
      products.value = products.value.map((prod) =>
        prod.id === data.id ? product.value ?? prod : prod
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
    products,
    createProduct,
    createSpecifications,
    setProducts,
    getProduct,
    updateProduct,
    updateProductSpecifications,
    loading
  }
})
