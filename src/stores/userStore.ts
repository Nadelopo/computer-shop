import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import { useToast } from 'vue-toastification'
import type { PostgrestError, User } from '@supabase/supabase-js'
import { supabase } from '@/db/supabase'
import { getOneById, updateOneById } from '@/db/queries/tables'
import { useLocalStorage } from '@/utils/localStorage'
import type { UserRead } from '@/types/tables/users.types'

type ListTitle = 'favourites' | 'comparison'

type UserLists = {
  favourites: number[]
  comparison: number[]
}

const toast = useToast()

export const useUserStore = defineStore('user', () => {
  const user = ref<UserRead | null>(null)
  const userLists = reactive<UserLists>({
    favourites: [],
    comparison: []
  })
  const favouritesStorage = useLocalStorage<number[]>('favourites', {
    onChange: (newValue) => {
      userLists.favourites = newValue
    },
    auth: true
  })
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
    const sessionUser = (await supabase.auth.getSession()).data.session?.user
    if (sessionUser) {
      return sessionUser
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

  async function changeUserListsValueOnToggle(
    listTitle: ListTitle,
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
    }
    userLists[listTitle] = updatedValue
    if (listTitle === 'comparison') {
      comparisonStorage.set(updatedValue)
    } else {
      favouritesStorage.set(updatedValue)
    }
    return null
  }

  async function deleteItemFromUserList(
    listTitle: ListTitle,
    productId: number
  ): Promise<{ error: PostgrestError | null }> {
    const isUser = await isUserAuthenticated()
    const updatedItems = userLists[listTitle].filter((e) => e !== productId)
    if (isUser) {
      const { error } = await updateOneById('users', isUser.id, {
        [listTitle]: updatedItems
      })
      if (error) return { error }
    }
    userLists[listTitle] = updatedItems
    if (listTitle === 'comparison') {
      comparisonStorage.set(updatedItems)
    } else {
      favouritesStorage.set(updatedItems)
    }
    return { error: null }
  }

  async function clearUserLists(listTitle: ListTitle, products: number[]) {
    if (user.value) {
      const { error } = await updateOneById('users', user.value.id, {
        [listTitle]: products
      })
      if (error) return { error }
    }
    userLists[listTitle] = products
    if (listTitle === 'favourites') {
      favouritesStorage.set(products)
    } else {
      comparisonStorage.set(products)
    }
    return { error: null }
  }

  return {
    user,
    setUserData,
    isUserAuthenticated,
    userLists,
    changeUserListsValueOnToggle,
    deleteItemFromUserList,
    setUserListsValue,
    clearUserLists
  }
})
