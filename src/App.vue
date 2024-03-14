<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from './db/supabase'
import { useUserStore } from './stores/userStore'
import { useCartStore } from './stores/cartStore'
import { useLocalStorage } from './utils/localStorage'

const { setUserData, userLists } = useUserStore()
const { setCartItems } = useCartStore()

const eventValue = ref('')
supabase.auth.onAuthStateChange(async (event, session) => {
  if (eventValue.value !== event) {
    setUserData(session?.user?.id)
    setCartItems()
    eventValue.value = event
  }
})

useLocalStorage<number[]>('favourites', {
  onChange: (newValue) => {
    userLists.favourites = newValue
  }
})
</script>

<template>
  <router-view />
</template>
