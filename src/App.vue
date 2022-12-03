<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from './stores/userStore'
import { supabase } from './supabase'
import Navbar from './components/Navbar.vue'

const { setUserData } = useUserStore()

onBeforeMount(async () => {
  const token = JSON.parse(localStorage.getItem('supabase.auth.token') || '{}')
    ?.currentSession?.access_token
  if (token) {
    const { user, error } = await supabase.auth.api.getUser(token)
    if (user) {
      setUserData(user.id)
    }
    if (error) console.log(error)
  }
})

const eventValue = ref('')
supabase.auth.onAuthStateChange(async (event, session) => {
  if (eventValue.value !== event) {
    if (session?.user) {
      setUserData(session.user.id)
    } else {
      setUserData('')
    }
    eventValue.value = event
  }
})

const isNeed = computed((): boolean => {
  const href = useRoute().fullPath
  return !href.includes('admin') && !href.includes('auth')
})

// ;(async () => {
//   const response = await fetch(
//     'https://www.dns-shop.ru/product/09a7f8b0c526ed20/65-165-sm-televizor-led-tcl-65c735-cernyj/'
//   )
//   console.log(await response.text())
// })()
</script>

<template>
  <Navbar v-if="isNeed" />
  <main><router-view /></main>
</template>
