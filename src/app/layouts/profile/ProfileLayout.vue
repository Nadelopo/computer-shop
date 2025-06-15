<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { supabase } from '@/shared/api'
import { useUserStore } from '@/modules/users'
import { type ReviewWithDetails } from '@/modules/reviews'
import AppLink from '@/components/AppLink.vue'
import type { Loading } from '@/types'

const { getSessionUser } = useUserStore()
const reviews = ref<ReviewWithDetails[]>([])
const loading = ref<Loading>('loading')

onBeforeMount(async () => {
  const user = await getSessionUser()
  if (!user) return

  const { data } = await supabase
    .from('reviews')
    .select('*, users(name), products(categories(id, enTitle))')
    .eq('userId', user.id)
    .order('created_at', { ascending: false })
    .limit(4)
  if (data?.length === 0) {
    loading.value = 'empty'
    return
  }
  if (data) {
    reviews.value = data
    loading.value = 'success'
  }
})
</script>

<template>
  <div class="container">
    <div class="grid">
      <div class="sidebar">
        <AppLink :to="{ name: 'ProfileMain' }"> Мой профиль </AppLink>
        <AppLink :to="{ name: 'ProfileOrders' }"> Заказы </AppLink>
        <AppLink :to="{ name: 'ProfileReviews' }"> Отзывы</AppLink>
        <AppLink :to="{ name: 'ProfileDelivery' }"> Доставка </AppLink>
        <AppLink :to="{ name: 'ProfileMain' }"> Гарантийный отдел </AppLink>
        <AppLink :to="{ name: 'ProfileSettings' }"> Настройки профиля </AppLink>
      </div>
      <div>
        <router-view
          :reviews
          :loading
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="sass">
.grid
  display: grid
  grid-template-columns: 240px 1fr
  gap: 20px

.sidebar
  display: flex
  flex-direction: column
  gap: 15px
  a
    font-weight: 400
    transition: .2s
    &:hover
      color: var(--main-semi-light)
    &.router-link-exact-active
      color: var(--main-semi-light)
</style>
