<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from './supabase'
import { useUserStore } from './stores/userStore'
import { useCartStore } from './stores/cartStore'
import Navbar from './components/Navbar.vue'

const { setUserData } = useUserStore()

const { setCartItems } = useCartStore()
setCartItems()

const eventValue = ref('')
supabase.auth.onAuthStateChange(async (event, session) => {
  if (eventValue.value !== event) {
    setUserData(session?.user?.id)
    eventValue.value = event
  }
})

const pathMissing = (path: string) => {
  const href = useRoute().fullPath
  return !href.includes(path)
}

const showNavbar = computed((): boolean => {
  return pathMissing('admin') && pathMissing('auth')
})
</script>

<template>
  <Navbar v-if="showNavbar" />
  <main>
    <router-view />
  </main>
</template>
