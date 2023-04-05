<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from './supabase'
import { useUserStore } from './stores/userStore'
import { useCartStore } from './stores/cartStore'
import Navbar from './components/Navbar.vue'
import VLoader from './components/UI/Vloader.vue'

const { setUserData } = useUserStore()

const { setCartItems } = useCartStore()
setCartItems()

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
</script>

<template>
  <Navbar v-if="isNeed" />
  <main>
    <router-view v-slot="{ Component }">
      <suspense timeout="0">
        <template v-if="Component" #default>
          <component :is="Component" />
        </template>
        <template #fallback>
          <div class="min-h-screen flex items-center">
            <v-loader />
          </div>
        </template>
      </suspense>
    </router-view>
  </main>
</template>
