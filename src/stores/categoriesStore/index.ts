import { ref } from 'vue'
import { defineStore } from 'pinia'
import { create, getAll, getAllFromColumn } from '@/utils/dbQueries'
import type {
  Icategories,
  IcategoriesInsert,
  IcategoryFields,
  IcategoryFieldsInsert,
} from './types'

export const useCategoriesStore = defineStore('categories', {
  state: () => {
    const categories = ref<Icategories[]>([])
    const categoryFields = ref<IcategoryFields[]>([])

    return { categories, categoryFields }
  },
  actions: {
    async setCategories() {
      const { data } = await getAll<Icategories>('categories')
      if (data) {
        this.categories = data
      }
    },
    async createCategory(params: IcategoriesInsert) {
      const { data } = await create('categories', params)
      if (data) {
        this.categories.push(data)
      }
    },
    async createCategoryFields(form: IcategoryFieldsInsert) {
      const { data } = await create('categoryfields', form)
      if (data) {
        this.categoryFields.push(data)
        return true
      }
    },
    async getCategoryFields(categoryId: number) {
      const { data } = await getAllFromColumn<IcategoryFields>(
        'categoryfields',
        'categoryId',
        categoryId
      )
      return { data }
    },
  },
})
