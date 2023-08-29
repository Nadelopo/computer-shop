import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/supabase'
import { getOneById } from '@/utils/queries/db'
import type { UserRead } from '@/types/tables/users.types'
import type { User } from '@supabase/supabase-js'

export const useUserStore = defineStore('user', () => {
  const user = ref<UserRead | null>(null)

  async function setUserData(id: string | undefined): Promise<void> {
    if (id) {
      const data = await getOneById('users', id)
      user.value = data
    } else {
      user.value = null
    }
  }

  async function isUserAuthenticated(): Promise<User | null> {
    const user = (await supabase.auth.getSession()).data.session?.user
    if (user) {
      return user
    }
    return null
  }

  return { user, setUserData, isUserAuthenticated }
})
