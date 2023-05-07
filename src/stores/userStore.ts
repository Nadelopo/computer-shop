import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getOneById } from '@/utils/queries/db'
import type { UserRead } from '@/types/tables/users.types'

export const useUserStore = defineStore('user', () => {
  const user = ref<UserRead | null>(null)

  async function setUserData(id: string | undefined): Promise<void> {
    if (id) {
      const data = await getOneById<UserRead>('users', id)
      user.value = data
    } else {
      user.value = null
    }
  }

  return { user, setUserData }
})
