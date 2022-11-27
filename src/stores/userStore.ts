import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getOneWithId } from '@/utils/dbQueries'

export interface Iuser {
  readonly id: string
  readonly created_at: Date
  email: string
  name: string
  phone: number
  role: number
}

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
