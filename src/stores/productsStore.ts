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
  getAllByColumns,
  getOneById,
  updateMany,
  updateOne
} from '@/utils/queries/db'
import type { UpdateMany } from '@/utils/queries/types'

export const useProductsStore = defineStore('products', {
  state: () => {
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
      search?: string,
      order?: string
    ): Promise<void> {
      loader.value = 'loading'
      products.value = []
      const newProducts = ref<ProductWithSpecifications[]>([])

      const data = await getAllByColumns<ProductRead>(
        'products',
        [
          {
            column: 'categoryId',
            value: categoryId
          }
        ],
        {
          select: '*, manufacturerId(id, title)',
          order,
          search: {
            column: 'name',
            value: search
          }
        }
      )
      if (data?.length) {
        for (const product of data) {
          const specifications = await getAllByColumns<SpecificationRead>(
            'specifications',
            [
              {
                column: 'productId',
                value: product.id
              }
            ],
            {
              select: '*,  categorySpecificationsId(id, title, units, visible)',
              order: 'categorySpecificationsId'
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
      const data = await getOneById<ProductRead>(
        'products',
        productId,
        '*, manufacturerId(id, title)'
      )

      if (data) {
        const specifications = await getAllByColumns<SpecificationRead>(
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
  }
})
