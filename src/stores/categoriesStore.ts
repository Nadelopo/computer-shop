import { ref } from 'vue'
import { defineStore } from 'pinia'
import { create, getAll, getAllFromField } from '@/utils/dbQueries'
import type { defaultValues } from './types'

export interface IcategoriesInsert {
  title: string
  enTitle: string
  img: string
}
export interface Icategories extends defaultValues, IcategoriesInsert {}

export interface IcategoryFieldsInsert {
  categoryId: number
  title: string | number
  type: boolean
  visible: boolean
  units: string
}
export interface IcategoryFields extends defaultValues, IcategoryFieldsInsert {}

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
      const { data } = await create<IcategoriesInsert, Icategories>(
        'categories',
        params
      )
      if (data) {
        this.categories.push(data)
      }
    },
    async createCategoryFields(form: IcategoryFieldsInsert) {
      const { data } = await create<IcategoryFieldsInsert, IcategoryFields>(
        'categoryfields',
        form
      )
      if (data) {
        this.categoryFields.push(data)
        return true
      }
    },
    async getCategoryFields(categoryId: number) {
      const { data } = await getAllFromField<IcategoryFields>(
        'categoryfields',
        'categoryId',
        categoryId
      )
      return { data }
    },
  },
})
