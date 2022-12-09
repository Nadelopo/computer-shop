import { ref } from 'vue'
import { defineStore } from 'pinia'
import { create, getAll, getAllByColumn, updateOne } from '@/utils/dbQueries'
import type {
  IcategoryR,
  IcategoryC,
  IcategorySpecificationCU,
  IcategorySpecificationR,
  IcategoryU,
} from '@/types/tables'

export const useCategoriesStore = defineStore('categories', {
  state: () => {
    const categories = ref<IcategoryR[]>([])
    const categorySpecifications = ref<IcategorySpecificationCU[]>([])

    const setCategories = async () => {
      const { data } = await getAll<IcategoryR>('categories', 'id')
      if (data) {
        categories.value = data
      }
    }

    const createCategory = async (params: IcategoryC) => {
      const { data } = await create<IcategoryC, IcategoryR>(
        'categories',
        params
      )
      if (data) {
        categories.value.push(data)
      }
    }

    const updateCategory = async (params: IcategoryU) => {
      const { data } = await updateOne<IcategoryU, IcategoryR>(
        'categories',
        params.id,
        params
      )
      if (data) {
        categories.value = categories.value.map((e) =>
          e.id === params.id ? { ...e, ...params } : e
        )
      }
      return data
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
      }
      return { data }
    }

    const getCategorySpecifications = async (categoryId: number) => {
      const { data } = await getAllByColumn<IcategorySpecificationR>(
        'category_specifications',
        'categoryId',
        categoryId,
        '*',
        'id'
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
      updateCategory,
    }
  },
})
