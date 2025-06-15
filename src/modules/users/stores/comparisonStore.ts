import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { PostgrestError } from '@supabase/supabase-js'
import { useUserStore } from '../stores/userStore'
import { getUserList, updateUserList } from '../services/userService'
import { useLocalStorage } from '@/shared/composables/localStorage'

export const useComparisonStore = defineStore('comparison', () => {
  const comparison = ref<number[]>([])

  const comparisonStorage = useLocalStorage<number[]>('compareList', {
    onChange: (newValue) => {
      comparison.value = newValue
    }
  })

  const { getSessionUser } = useUserStore()

  const setComparisonValue = async (): Promise<PostgrestError | null> => {
    const sessionUser = await getSessionUser()

    if (sessionUser) {
      const { data, error } = await getUserList('comparison', sessionUser.id)

      if (error) return error

      comparison.value = data.comparison
      comparisonStorage.set(data.comparison)
    } else {
      comparison.value = comparisonStorage.get() ?? []
    }
    return null
  }

  const toggleComparison = async (productId: number): Promise<PostgrestError | null> => {
    const sessionUser = await getSessionUser()

    const updatedValue = comparison.value.includes(productId)
      ? comparison.value.filter((id) => id !== productId)
      : [...comparison.value, productId]

    if (sessionUser) {
      const { error } = await updateUserList('comparison', sessionUser.id, updatedValue)
      if (error) return error
    }

    comparison.value = updatedValue
    comparisonStorage.set(updatedValue)
    return null
  }

  const removeComparison = async (
    productId: number
  ): Promise<{ error: PostgrestError | null }> => {
    const sessionUser = await getSessionUser()

    const updatedItems = comparison.value.filter((id) => id !== productId)

    if (sessionUser) {
      const { error } = await updateUserList('comparison', sessionUser.id, updatedItems)
      if (error) return { error }
    }

    comparison.value = updatedItems
    comparisonStorage.set(updatedItems)
    return { error: null }
  }

  const clearComparison = async () => {
    const sessionUser = await getSessionUser()

    if (sessionUser) {
      const { error } = await updateUserList('comparison', sessionUser.id, [])
      if (error) return { error }
    }

    comparison.value = []
    comparisonStorage.set([])

    return { error: null }
  }

  const updateComparison = async (updatedItemsIds: number[]) => {
    const sessionUser = await getSessionUser()

    if (sessionUser) {
      const { error } = await updateUserList(
        'comparison',
        sessionUser.id,
        updatedItemsIds
      )
      if (error) return { error }
    }

    comparison.value = updatedItemsIds
    comparisonStorage.set(updatedItemsIds)

    return { error: null }
  }

  return {
    comparison,
    toggleComparison,
    removeComparison,
    setComparisonValue,
    clearComparison,
    updateComparison
  }
})
