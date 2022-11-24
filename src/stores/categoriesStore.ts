import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/supabase'

export interface IcategoriesValues {
  title: string
  enTitle: string
  img: string
}

export interface Icategories extends IcategoriesValues {
  id: string
  created_at: Date
}

export const useCategoriesStore = defineStore('categories', {
  state: () => {
    const categories = ref<Icategories[]>([])

    return { categories }
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
  },
})
