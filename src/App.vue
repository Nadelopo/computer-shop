<script setup lang="ts">
import { supabase } from './db/supabase'
import { useUserStore } from './stores/userStore'
import { useCartStore } from './stores/cartStore'
import { useCustomRouter } from './shared/composables/customRouter'

const { setUserData } = useUserStore()
const { setCartItems } = useCartStore()

const router = useCustomRouter()

supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'INITIAL_SESSION') {
    setCartItems()
  }

  if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
    setUserData(session?.user?.id)
    setCartItems()
  }

  if (event === 'SIGNED_OUT') {
    router.push({ name: 'Home' })
  }
})
</script>

<template>
  <router-view />
</template>
