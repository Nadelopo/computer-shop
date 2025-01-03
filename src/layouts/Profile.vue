<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { supabase } from '@/db/supabase'
import { useUserStore } from '@/stores/userStore'
import AppLink from '@/components/AppLink.vue'
import type { ReviewWithDetails } from '@/types/tables/reviews.types'
import type { Loading } from '@/types'

const { isUserAuthenticated } = useUserStore()
const reviews = ref<ReviewWithDetails[]>([])
const loading = ref<Loading>('loading')

onBeforeMount(async () => {
  const user = await isUserAuthenticated()
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
        <app-link :to="{ name: 'ProfileMain' }"> Мой профиль </app-link>
        <app-link :to="{ name: 'ProfileOrders' }"> Заказы </app-link>
        <app-link :to="{ name: 'ProfileReviews' }"> Отзывы</app-link>
        <app-link :to="{ name: 'ProfileDelivery' }"> Доставка </app-link>
        <app-link :to="{ name: 'ProfileMain' }"> Гарантийный отдел </app-link>
        <app-link :to="{ name: 'ProfileSettings' }">
          Настройки профиля
        </app-link>
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
