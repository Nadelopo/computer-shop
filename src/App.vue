<script setup lang="ts">
import { supabase } from './shared/api'
import { useUserStore, useComparisonStore, useFavoritesStore } from './modules/users'
import { useCartStore } from './modules/cart'
import { useCustomRouter } from './shared/composables/customRouter'

const { setUserData } = useUserStore()
const { setCartItems } = useCartStore()
const { setFavoritesValue } = useFavoritesStore()
const { setComparisonValue } = useComparisonStore()

const router = useCustomRouter()

supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'INITIAL_SESSION') {
    setCartItems()
    setFavoritesValue()
    setComparisonValue()
  }

  if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
    setUserData(session?.user?.id)
    setCartItems()
    setFavoritesValue()
    setComparisonValue()
  }

  if (event === 'SIGNED_OUT') {
    router.push({ name: 'Home' })
  }
})
</script>

<template>
  <router-view />
</template>
