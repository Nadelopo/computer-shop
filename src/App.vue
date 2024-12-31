<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { supabase } from './db/supabase'
import { useUserStore } from './stores/userStore'
import { useCartStore } from './stores/cartStore'
import { getAll } from './db/queries/tables'
import Test from './Test.vue'

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

// onMounted(async () => {
//   const { data, error } = await getAll('product_quantity_in_stores', {
//     match: { productId: 36 },
//     select: 'id, quantity'
//   })
//   console.log(data, error)
// })

const q = ref()
</script>

<template>
  <router-view />
</template>
