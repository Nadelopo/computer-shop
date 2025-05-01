import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useToast } from 'vue-toastification'
import type { PostgrestError } from '@supabase/supabase-js'
import { supabase } from '@/db/supabase'
import { useUserStore } from './userStore'
import { updateUserList } from '../services/userService'
import { useLocalStorage } from '@/shared/composables/localStorage'

export const useFavoritesStore = defineStore('favorites', () => {
  const favorites = ref<number[]>([])
  const toast = useToast()

  const favoritesStorage = useLocalStorage<number[]>('favourites', {
    onChange: (newValue) => {
      favorites.value = newValue
    },
    auth: true
  })

  const { getSessionUser } = useUserStore()

  const setFavoritesValue = async (): Promise<PostgrestError | null> => {
    const sessionUser = await getSessionUser()

    if (sessionUser) {
      const { data, error } = await supabase
        .from('users')
        .select('favourites')
        .eq('id', sessionUser.id)
        .single()

      if (error) return error

      favorites.value = data.favourites
      favoritesStorage.set(data.favourites)
    } else {
      favorites.value = []
    }
    return null
  }

  const toggleFavorite = async (
    productId: number
  ): Promise<PostgrestError | null> => {
    const sessionUser = await getSessionUser()

    if (!sessionUser) {
      toast.warning('Требуется авторизация')
      return null
    }

    const updatedValue = favorites.value.includes(productId)
      ? favorites.value.filter((id) => id !== productId)
      : [...favorites.value, productId]

    if (sessionUser) {
      const { error } = await updateUserList(
        'favourites',
        sessionUser.id,
        updatedValue
      )
      if (error) return error
    }

    favorites.value = updatedValue
    favoritesStorage.set(updatedValue)
    return null
  }

  const removeFavorite = async (
    productId: number
  ): Promise<{ error: PostgrestError | null }> => {
    const sessionUser = await getSessionUser()

    const updatedItems = favorites.value.filter((id) => id !== productId)

    if (sessionUser) {
      const { error } = await updateUserList(
        'favourites',
        sessionUser.id,
        updatedItems
      )
      if (error) return { error }
    }

    favorites.value = updatedItems
    favoritesStorage.set(updatedItems)
    return { error: null }
  }

  const clearFavorites = async (): Promise<{
    error: PostgrestError | null
  }> => {
    const sessionUser = await getSessionUser()

    if (sessionUser) {
      const { error } = await updateUserList('favourites', sessionUser.id, [])
      if (error) return { error }
    }

    favorites.value = []
    favoritesStorage.set([])
    return { error: null }
  }

  return {
    favorites,
    toggleFavorite,
    removeFavorite,
    setFavoritesValue,
    clearFavorites
  }
})
