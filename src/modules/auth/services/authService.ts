import type { Router } from 'vue-router'
import { useToast } from 'vue-toastification'
import { supabase } from '@/db/supabase'

const toast = useToast()

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) console.error(error)
}

export const signIn = async (
  email: string,
  password: string,
  router: Router
) => {
  const {
    data: { user },
    error
  } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  if (error) {
    console.error(error)
    toast.warning('Неверная почта или пароль')
  }
  if (user) {
    router.push({ name: 'Home' })
  }
}

export const signUp = async (
  email: string,
  password: string,
  name: string,
  router: Router
) => {
  const {
    data: { user },
    error
  } = await supabase.auth.signUp({
    email,
    password
  })

  if (error) {
    console.error(error)
    toast.warning('Пользователь уже зарегестрирован')
  }

  if (!user) return

  const { error: errorCreate } = await supabase.from('users').insert({
    name,
    email,
    id: user.id
  })

  if (!errorCreate) {
    router.push({ name: 'Home' })
  }
}
