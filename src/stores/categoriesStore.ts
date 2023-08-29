import { ref } from 'vue'
import { defineStore } from 'pinia'
import { createOne, getAll, updateOneById } from '@/utils/queries/db'
import type {
  CategoryCreate,
  CategoryRead,
  CategoryUpdate
} from '@/types/tables/categories.types'
import type {
  CategorySpecificationCreate,
  CategorySpecificationRead
} from '@/types/tables/categorySpecifications.types'

export const useCategoriesStore = defineStore('categories', () => {
  const categories = ref<CategoryRead[]>([])

  async function setCategories(): Promise<void> {
    const { data } = await getAll('categories')
    if (data) {
      categories.value = data
    }
  }

  async function createCategory(
    params: CategoryCreate
  ): Promise<CategoryRead | null> {
    const data = await createOne('categories', params)
    if (data) {
      categories.value.push(data)
    }
    return data
  }

  async function updateCategory(
    category: CategoryUpdate
  ): Promise<CategoryRead | null> {
    if (category.id) {
      const data = await updateOneById('categories', category.id, category)
      if (data) {
        categories.value = categories.value.map((e) =>
          e.id === category.id ? { ...e, ...category } : e
        )
      }
      return data
    }
    return null
  }

  async function createCategorySpecifications(
    form: CategorySpecificationCreate
  ): Promise<CategorySpecificationRead | null> {
    return createOne('category_specifications', form)
  }

  async function getCategorySpecifications(
    categoryId: number
  ): Promise<CategorySpecificationRead[] | null> {
    const { data } = await getAll<CategorySpecificationRead>(
      'category_specifications',
      {
        match: { categoryId: categoryId }
      }
    )
    return data
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
