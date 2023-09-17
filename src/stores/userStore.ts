import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import { useToast } from 'vue-toastification'
import { supabase } from '@/supabase'
import { getOneById, updateOneById } from '@/utils/queries/db'
import { localStorageGet, localStorageSet } from '@/utils/localStorage'
import type { UserRead } from '@/types/tables/users.types'
import type { User } from '@supabase/supabase-js'

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

  async function setUserData(id: string | undefined): Promise<void> {
    if (id) {
      const data = await getOneById('users', id)
      user.value = data
    } else {
      user.value = null
    }
    setUserListsValue(user.value)
  }

  async function isUserAuthenticated(): Promise<User | null> {
    const user = (await supabase.auth.getSession()).data.session?.user
    if (user) {
      return user
    }
    return null
  }

  async function setUserListsValue(user?: UserRead | null) {
    const isUser = await isUserAuthenticated()
    if (isUser && user) {
      userLists.favourites = user.favourites
      userLists.comparison = user.comparison
    } else if (isUser) {
      const data = await getOneById(
        'users',
        isUser.id,
        'favourites,  comparison'
      )
      if (data) {
        userLists.favourites = data.favourites
        userLists.comparison = data.comparison
      }
    } else {
      userLists.comparison = localStorageGet<number[]>('compareList') ?? []
      userLists.favourites = []
    }
  }

  async function changeUserListValueOnClick(
    listTitle: listTitle,
    productId: number
  ): Promise<void> {
    const isUser = await isUserAuthenticated()
    if (!isUser && listTitle === 'favourites') {
      toast.warning('Требуется авторизация')
    }
    let items: number[]
    if (isUser) {
      items = (await getOneById('users', isUser.id))?.[listTitle] ?? []
    } else {
      items = localStorageGet<number[]>('compareList') ?? []
    }

    const updatedValue = items.includes(productId)
      ? items.filter((e) => e !== productId)
      : [...items, productId]
    if (isUser) {
      const data = await updateOneById('users', isUser.id, {
        [listTitle]: updatedValue
      })
      if (data) {
        userLists[listTitle] = updatedValue
        user.value && (user.value[listTitle] = updatedValue)
      }
    } else {
      localStorageSet('compareList', updatedValue)
      userLists[listTitle] = updatedValue
    }
  }

  async function deleteItemFromUserList(
    listTitle: listTitle,
    productId: number
  ): Promise<boolean> {
    const isUser = await isUserAuthenticated()
    const updatedItems = userLists[listTitle].filter((e) => e !== productId)
    if (isUser) {
      const data = await updateOneById('users', isUser.id, {
        [listTitle]: updatedItems
      })
      if (data) {
        userLists[listTitle] = updatedItems
        user.value && (user.value[listTitle] = updatedItems)
        return true
      }
    } else {
      localStorageSet('compareList', updatedItems)
      userLists[listTitle] = updatedItems
      return true
    }
    return false
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
