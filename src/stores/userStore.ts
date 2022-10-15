import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/supabase'

interface Iuser {
  id: string
  created_at: Date
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
    async getUserData(userId: string) {
      const { data, error } = await supabase
        .from('Users')
        .select()
        .eq('id', userId)
        .single()
      if (error) {
        console.log(error)
      }
      return data
    },
  },
})
