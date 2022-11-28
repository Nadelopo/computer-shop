import { ref } from 'vue'
import { defineStore } from 'pinia'
import { create, getAll, getAllByColumn } from '@/utils/dbQueries'
import type {
  Icategory,
  IcategoryCU,
  IcategorySpecifications,
  IcategorySpecificationsCU,
} from './types'

export const useCategoriesStore = defineStore('categories', {
  state: () => {
    const categories = ref<Icategory[]>([])
    const categorySpecifications = ref<IcategorySpecifications[]>([])

    const setCategories = async () => {
      const { data } = await getAll<Icategory>('categories')
      if (data) {
        categories.value = data
      }
    }

    const createCategory = async (params: IcategoryCU) => {
      const { data } = await create('categories', params)
      if (data) {
        categories.value.push(data)
      }
    }
    const createCategorySpecifications = async (
      form: IcategorySpecificationsCU
    ) => {
      const { data } = await create('category_specifications', form)
      if (data) {
        categorySpecifications.value.push(data)
        return true
      }
    }

    const getCategorySpecifications = async (categoryId: number) => {
      const { data } = await getAllByColumn<IcategorySpecifications>(
        'category_specifications',
        'categoryId',
        categoryId
      )
      return { data }
    }

    setCategories()

    return {
      categories,
      categorySpecifications,
      setCategories,
      createCategory,
      createCategorySpecifications,
      getCategorySpecifications,
    }
  },
})
