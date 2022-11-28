import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getOneWithId } from '@/utils/dbQueries'
import type { Iuser } from './types'

export const useUserStore = defineStore('user', {
  state: () => {
    const user = ref<Iuser | null>(null)
    const userId = ref('')

    return { user, userId }
  },
  actions: {
    async setUserData(userId: string) {
      const { data } = await getOneWithId<Iuser>('users', userId)
      this.user = data
      this.userId = userId
    },
  },
})
