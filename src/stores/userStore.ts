import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import { useToast } from 'vue-toastification'
import { supabase } from '@/db/supabase'
import { getOneById, updateOneById } from '@/db/queries/tables'
import { useLocalStorage } from '@/utils/localStorage'
import type { UserRead } from '@/types/tables/users.types'
import type { PostgrestError, User } from '@supabase/supabase-js'

type listTitle = 'favourites' | 'comparison'

type UsersLists = {
  favourites: number[]
  comparison: number[]
}

const toast = useToast()

export const useUserStore = defineStore('user', () => {
  const user = ref<UserRead | null>(null)
  const userLists = reactive<UsersLists>({
    favourites: [],
    comparison: []
  })
  const favouritesStorage = useLocalStorage<number[]>('favourites')
  const comparisonStorage = useLocalStorage<number[]>('compareList', {
    onChange: (newValue) => {
      userLists.comparison = newValue
    }
  })

  async function setUserData(id: string | undefined): Promise<void> {
    if (id) {
      const { data } = await getOneById(
        'users',
        id,
        'id, created_at, email, name, phone, role'
      )
      user.value = data
    } else {
      user.value = null
    }
    setUserListsValue()
  }

  async function isUserAuthenticated(): Promise<User | null> {
    const user = (await supabase.auth.getSession()).data.session?.user
    if (user) {
      return user
    }
    return null
  }

  async function setUserListsValue(): Promise<PostgrestError | null> {
    const isUser = await isUserAuthenticated()
    if (isUser) {
      const { data, error } = await getOneById(
        'users',
        isUser.id,
        'favourites,  comparison'
      )
      if (error) {
        return error
      }

      userLists.favourites = data.favourites
      userLists.comparison = data.comparison
      favouritesStorage.set(data.favourites)
      comparisonStorage.set(data.comparison)
    } else {
      userLists.comparison = comparisonStorage.get() ?? []
      userLists.favourites = []
    }
    return null
  }

  async function changeUserListValueOnClick(
    listTitle: listTitle,
    productId: number
  ): Promise<PostgrestError | null> {
    const isUser = await isUserAuthenticated()
    if (!isUser && listTitle === 'favourites') {
      toast.warning('Требуется авторизация')
      return null
    }
    let items: number[]
    if (isUser) {
      const { data, error } = await getOneById(
        'users',
        isUser.id,
        'favourites,  comparison'
      )
      if (error) return error
      items = data[listTitle]
    } else {
      items = comparisonStorage.get() ?? []
    }

    const updatedValue = items.includes(productId)
      ? items.filter((e) => e !== productId)
      : [...items, productId]
    if (isUser) {
      const { error } = await updateOneById('users', isUser.id, {
        [listTitle]: updatedValue
      })
      if (error) return error

      userLists[listTitle] = updatedValue
      favouritesStorage.set(userLists.favourites)
      // comparisonStorage.set(userLists.comparison)
    } else {
      // comparisonStorage.set(updatedValue)
      userLists[listTitle] = updatedValue
    }
    comparisonStorage.set(updatedValue)
    return null
  }

  async function deleteItemFromUserList(
    listTitle: listTitle,
    productId: number
  ): Promise<{ error: PostgrestError | null }> {
    const isUser = await isUserAuthenticated()
    const updatedItems = userLists[listTitle].filter((e) => e !== productId)
    if (isUser) {
      const { error } = await updateOneById('users', isUser.id, {
        [listTitle]: updatedItems
      })
      if (error) return { error }
      userLists[listTitle] = updatedItems
      favouritesStorage.set(userLists.favourites)
      // comparisonStorage.set(userLists.comparison)
    } else {
      // comparisonStorage.set(updatedItems)
      userLists[listTitle] = updatedItems
    }
    comparisonStorage.set(updatedItems)
    return { error: null }
  }

  return {
    user,
    setUserData,
    isUserAuthenticated,
    userLists,
    changeUserListValueOnClick,
    deleteItemFromUserList,
    setUserListsValue
  }
})
