import { ref } from 'vue'
import { defineStore } from 'pinia'
import { create, getAll, getAllFromColumn } from '@/utils/dbQueries'
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

    return { categories, categorySpecifications }
  },
  actions: {
    async setCategories() {
      const { data } = await getAll<Icategory>('categories')
      if (data) {
        this.categories = data
      }
    },
    async createCategory(params: IcategoryCU) {
      const { data } = await create('categories', params)
      if (data) {
        this.categories.push(data)
      }
    },
    async createCategorySpecifications(form: IcategorySpecificationsCU) {
      const { data } = await create('category_specifications', form)
      if (data) {
        this.categorySpecifications.push(data)
        return true
      }
    },
    async getCategorySpecifications(categoryId: number) {
      const { data } = await getAllFromColumn<IcategorySpecifications>(
        'category_specifications',
        'categoryId',
        categoryId
      )
      return { data }
    },
  },
})
