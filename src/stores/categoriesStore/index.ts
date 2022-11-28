import { ref } from 'vue'
import { defineStore } from 'pinia'
import { create, getAll, getAllFromColumn } from '@/utils/dbQueries'
import type {
  Icategories,
  IcategoriesCU,
  IcategoryField,
  IcategoryFieldCU,
} from './types'

export const useCategoriesStore = defineStore('categories', {
  state: () => {
    const categories = ref<Icategories[]>([])
    const categoryFields = ref<IcategoryField[]>([])

    return { categories, categoryFields }
  },
  actions: {
    async setCategories() {
      const { data } = await getAll<Icategories>('categories')
      if (data) {
        this.categories = data
      }
    },
    async createCategory(params: IcategoriesCU) {
      const { data } = await create('categories', params)
      if (data) {
        this.categories.push(data)
      }
    },
    async createCategoryFields(form: IcategoryFieldCU) {
      const { data } = await create('categoryfields', form)
      if (data) {
        this.categoryFields.push(data)
        return true
      }
    },
    async getCategoryFields(categoryId: number) {
      const { data } = await getAllFromColumn<IcategoryField>(
        'categoryfields',
        'categoryId',
        categoryId
      )
      return { data }
    },
  },
})
