import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getOneWithId } from '@/utils/dbQueries'
import type { Iuser } from './types'

export const useUserStore = defineStore('user', {
  state: () => {
    const user = ref<Iuser | null>(null)
    const userId = ref('')

    const setUserData = async (id: string) => {
      const { data } = await getOneWithId<Iuser>('users', id)
      user.value = data
      userId.value = id
    }

    return { user, userId, setUserData }
  },
})
