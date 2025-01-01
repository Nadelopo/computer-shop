import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/db/supabase'
import type {
  CategoryCreate,
  CategoryRead,
  CategoryUpdate
} from '@/types/tables/categories.types'
import type {
  CategorySpecificationCreate,
  CategorySpecificationRead
} from '@/types/tables/categorySpecifications.types'
import type { DataError } from '@/types'

export const useCategoriesStore = defineStore('categories', () => {
  const categories = ref<CategoryRead[]>([])

  async function setCategories(): Promise<void> {
    const { data } = await supabase.from('categories').select().order('id')
    if (data) {
      categories.value = data
    }
  }

  async function createCategory(
    params: CategoryCreate
  ): Promise<DataError<CategoryRead>> {
    const response = await supabase
      .from('categories')
      .insert(params)
      .select()
      .single()

    if (response.data) {
      categories.value.push(response.data)
    }

    return response
  }

  async function updateCategory(
    category: Omit<CategoryUpdate, 'id'> & { id: number }
  ): Promise<DataError<CategoryRead>> {
    const response = await supabase
      .from('categories')
      .update(category)
      .eq('id', category.id)
      .select()
      .single()

    categories.value = categories.value.map((e) =>
      e.id === category.id ? { ...e, ...category } : e
    )

    return response
  }

  async function createCategorySpecifications(
    form: CategorySpecificationCreate
  ): Promise<DataError<CategorySpecificationRead>> {
    const response = supabase
      .from('category_specifications')
      .insert(form)
      .select()
      .single()

    return response
  }

  async function getCategorySpecifications(
    categoryId: number
  ): Promise<DataError<CategorySpecificationRead[]>> {
    const response = await supabase
      .from('category_specifications')
      .select()
      .match({ categoryId })

    return response
  }

  setCategories()

  return {
    categories,
    setCategories,
    createCategory,
    createCategorySpecifications,
    getCategorySpecifications,
    updateCategory
  }
})
