import { ref } from 'vue'
import { defineStore } from 'pinia'
import { create, getAll, getAllByColumn } from '@/utils/dbQueries'
import type {
  IcategoryR,
  IcategoryCU,
  IcategorySpecificationCU,
  IcategorySpecificationR,
} from '@/types/tables'

export const useCategoriesStore = defineStore('categories', {
  state: () => {
    const categories = ref<IcategoryR[]>([])
    const categorySpecifications = ref<IcategorySpecificationCU[]>([])

    const setCategories = async () => {
      const { data } = await getAll<IcategoryR>('categories')
      if (data) {
        categories.value = data
      }
    }

    const createCategory = async (params: IcategoryCU) => {
      const { data } = await create<IcategoryCU, IcategoryR>(
        'categories',
        params
      )
      if (data) {
        categories.value.push(data)
      }
    }
    const createCategorySpecifications = async (
      form: IcategorySpecificationCU
    ) => {
      const { data } = await create<
        IcategorySpecificationCU,
        IcategorySpecificationR
      >('category_specifications', form)
      if (data) {
        categorySpecifications.value.push(data)
        return true
      }
    }

    const getCategorySpecifications = async (categoryId: number) => {
      const { data } = await getAllByColumn<IcategorySpecificationR>(
        'category_specifications',
        'categoryId',
        categoryId,
        '*',
        'id'
      )
      console.log(data)
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
