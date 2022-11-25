import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/supabase'

export interface IcategoriesValues {
  title: string
  enTitle: string
  img: string
}

export interface Icategories extends IcategoriesValues {
  id: number
  created_at: Date
}

export interface IcategoryFields {
  categoryId: number
  title: string | number
  type: boolean
  visible: boolean
  units: string
}

export const useCategoriesStore = defineStore('categories', {
  state: () => {
    const categories = ref<Icategories[]>([])
    const categoryFields = ref<IcategoryFields[]>([])

    return { categories, categoryFields }
  },
  actions: {
    async createCategory(params: IcategoriesValues) {
      const { enTitle, title, img } = params
      const { data, error } = await supabase
        .from<Icategories>('categories')
        .insert({ enTitle, title, img })
        .single()
      if (error) console.log(error)
      if (data) this.categories.push(data)
    },
    async setCategories() {
      const { data, error } = await supabase
        .from<Icategories>('categories')
        .select()
      if (error) console.log(error)
      if (data) this.categories = data
    },
    async createCategoryFields(form: IcategoryFields) {
      const { data, error } = await supabase
        .from<IcategoryFields>('categoryfields')
        .insert(form)
        .single()
      if (error) console.log(error)
      if (data) return true
    },
  },
})
