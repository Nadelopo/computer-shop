<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from './db/supabase'
import { useUserStore } from './stores/userStore'
import { useCartStore } from './stores/cartStore'
// import { useCustomRouter } from './utils/useCustomRouter'

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
// ;(async () => {
//   const { data, error } = await supabase
//     // .from('specifications')
//     // .select('*,products!inner(id)')
//     // .match({
//     //   'products.categoryId': 14,
//     //   categorySpecificationsId: 46
//     //   // categorySpecificationsId: specification.id
//     // })
//     // // .or(
//     // //   'and(categorySpecificationsId.eq.46,valueString.overlaps.{"DDR4"})'
//     // // 'and(categorySpecificationsId.eq.6,valueNumber.gte.1,valueNumber.lte.9)'
//     // // )
//     // // .or('valueString.cs.(["DDR4"])')
//     // // .or(`valueString.cs.{DDR4}`)
//     // .or(
//     //   // 'and(categorySpecificationsId.eq.46,or(valueString.cs.{DDR4},valueString.cs.{DDR3}))'
//     //   'and(categorySpecificationsId.eq.46,or(valueString.cs.{DDR4}))'
//     // )
//     // .overlaps('valueString', ['DDR4'])
//     .from('products')
//     .select(
//       '*, categories(id, enTitle), manufacturers(id, title), specifications!inner(*,category_specifications(id, title, units, visible, type))'
//     )
//     .eq('categoryId', 14)
//     .in('id', [36, 24, 7, 23, 35, 6, 3, 5])
//     .order('countReviews', { ascending: false })
//     .order('id', {
//       foreignTable: 'specifications'
//     })

//   console.log(data, error)
// })()
</script>

<template>
  <router-view />
</template>
