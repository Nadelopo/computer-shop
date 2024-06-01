<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { getAll } from '@/db/queries/tables'
import AppLink from '@/components/AppLink.vue'
import type { ReviewWithDetails } from '@/types/tables/reviews.types'

const { isUserAuthenticated } = useUserStore()

const reviews = ref<ReviewWithDetails[]>([])
const setReviews = async (limit?: number) => {
  const user = await isUserAuthenticated()
  if (!user) return
  const { data } = await getAll('reviews', {
    match: { userId: user.id },
    select: '*, users(name), products(categories(id, enTitle))',
    order: ['created_at', { ascending: false }],
    limit
  })
  if (data) {
    reviews.value = data
  }
}

onBeforeMount(() => {
  if (!reviews.value.length) {
    setReviews(4)
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
          :reviews="reviews"
          :set-reviews="setReviews"
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
