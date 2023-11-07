import { ref } from 'vue'
import { defineStore } from 'pinia'
import { createOne, getAll, updateOneById } from '@/db/queries/tables'
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
    const { data } = await getAll('categories')
    if (data) {
      categories.value = data
    }
  }

  async function createCategory(
    params: CategoryCreate
  ): Promise<DataError<CategoryRead>> {
    const { data, error } = await createOne('categories', params)
    if (error) return { data, error }
    categories.value.push(data)
    return { data, error }
  }

  async function updateCategory(
    category: Omit<CategoryUpdate, 'id'> & { id: number }
  ): Promise<DataError<CategoryRead>> {
    const { data, error } = await updateOneById(
      'categories',
      category.id,
      category
    )
    if (error) return { data, error }
    categories.value = categories.value.map((e) =>
      e.id === category.id ? { ...e, ...category } : e
    )

    return { data, error }
  }

  async function createCategorySpecifications(
    form: CategorySpecificationCreate
  ): Promise<DataError<CategorySpecificationRead>> {
    const { data, error } = await createOne('category_specifications', form)
    return { data, error } as DataError<CategorySpecificationRead>
  }

  async function getCategorySpecifications(
    categoryId: number
  ): Promise<DataError<CategorySpecificationRead[]>> {
    const { data, error } = await getAll('category_specifications', {
      match: { categoryId: categoryId }
    })
    return { data, error } as DataError<CategorySpecificationRead[]>
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
