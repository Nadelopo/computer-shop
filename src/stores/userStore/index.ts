import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getOneWithId } from '@/utils/dbQueries'
import type { IuserR } from '@/types/tables'

export const useUserStore = defineStore('user', {
  state: () => {
    const user = ref<IuserR | null>(null)
    const userId = ref('')

    const setUserData = async (id: string) => {
      const { data } = await getOneWithId<IuserR>('users', id)
      user.value = data
      userId.value = id
    }

    return { user, userId, setUserData }
  },
})
