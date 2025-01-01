<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from './db/supabase'
import { useUserStore } from './stores/userStore'
import { useCartStore } from './stores/cartStore'

const { setUserData } = useUserStore()
const { setCartItems } = useCartStore()

const eventValue = ref('')
supabase.auth.onAuthStateChange(async (event, session) => {
  if (eventValue.value !== event) {
    setUserData(session?.user?.id)
    setCartItems()
    eventValue.value = event
  }
})
</script>

<template>
  <router-view />
</template>
