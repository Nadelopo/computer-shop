import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getOneById } from '@/utils/queries/db'
import type { UserRead } from '@/types/tables/users.types'

export const useUserStore = defineStore('user', () => {
  const user = ref<UserRead | null>(null)
  const userId = ref('')

  async function setUserData(id: string): Promise<void> {
    const data = await getOneById<UserRead>('users', id)
    user.value = data
    userId.value = id
  }

  return { user, userId, setUserData }
})
