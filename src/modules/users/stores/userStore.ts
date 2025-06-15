import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/shared/api'
import type { UserRead } from '@/modules/users'

export const useUserStore = defineStore('user', () => {
  const user = ref<UserRead | null>(null)

  const getSessionUser = async (): Promise<User | null> => {
    const sessionUser = (await supabase.auth.getSession()).data.session?.user
    return sessionUser ?? null
  }

  const setUserData = async (id: string | undefined): Promise<void> => {
    if (id) {
      const { data } = await supabase.from('users').select().eq('id', id).single()
      user.value = data
    } else {
      user.value = null
    }
  }

  return {
    user,
    setUserData,
    getSessionUser
  }
})
