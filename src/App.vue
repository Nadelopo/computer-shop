<script setup lang="ts">
import { supabase } from './db/supabase'
import { useUserStore } from './modules/user/model/userStore'
import { useComparisonStore } from './modules/user/model/comparisonStore'
import { useFavoritesStore } from './modules/user/model/favoritesStore'
import { useCartStore } from './stores/cartStore'
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
