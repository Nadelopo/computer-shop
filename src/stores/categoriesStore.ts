import { ref } from 'vue'
import { defineStore } from 'pinia'
import type {
  CategoryCreate,
  CategoryRead,
  CategoryUpdate
} from '@/types/tables/categories.types'
import type {
  CategorySpecificationCreate,
  CategorySpecificationRead
} from '@/types/tables/categorySpecifications.types'
import { createOne, getAll, updateOne } from '@/utils/queries/db'

export const useCategoriesStore = defineStore('categories', () => {
  const categories = ref<CategoryRead[]>([])
  const categorySpecifications = ref<CategorySpecificationRead[]>([])

  async function setCategories(): Promise<void> {
    const data = await getAll('categories')
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
      const data = await updateOne('categories', category.id, category)
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
    const data = await createOne('category_specifications', form)
    if (data) {
      categorySpecifications.value.push(data)
    }
    return data
  }

  async function getCategorySpecifications(
    categoryId: number
  ): Promise<CategorySpecificationRead[] | null> {
    const data = await getAll<
      'category_specifications',
      CategorySpecificationRead
    >('category_specifications', {
      eq: [
        {
          column: 'categoryId',
          value: categoryId
        }
      ]
    })
    return data
  }

  setCategories()

  return {
    categories,
    categorySpecifications,
    setCategories,
    createCategory,
    createCategorySpecifications,
    getCategorySpecifications,
    updateCategory
  }
})
