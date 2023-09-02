<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/userStore'
import { getAll } from '@/utils/queries/db'
import type { ReviewWithDetails } from '@/types/tables/reviews.types'
import { useRoute } from 'vue-router'

const { user } = storeToRefs(useUserStore())

const route = useRoute()
const pageName = route.name

const reviews = ref<ReviewWithDetails[]>([])
const setReviews = async (limit?: number) => {
  if (!user.value) return null
  const { data } = await getAll('reviews', {
    match: { userId: user.value.id },
    select: '*, users(name), categories(id, enTitle)',
    order: ['created_at', false],
    limit
  })
  if (data) {
    reviews.value = data
  }
}

onBeforeMount(() => {
  if (!reviews.value.length && pageName === 'ProfileMain') {
    setReviews(4)
  }
})
</script>

<template>
  <div class="container">
    <div class="grid">
      <div class="sidebar">
        <router-link :to="{ name: 'ProfileMain' }"> Мой профиль </router-link>
        <router-link :to="{ name: 'ProfileOrders' }"> Заказы </router-link>
        <router-link :to="{ name: 'ProfileReviews' }"> Отзывы</router-link>
        <router-link :to="{ name: 'ProfileDelivery' }"> Доставка </router-link>
        <router-link :to="{ name: 'ProfileMain' }">
          Гарантийный отдел
        </router-link>
        <router-link :to="{ name: 'ProfileMain' }">
          Настройки профиля
        </router-link>
      </div>
      <div>
        <router-view :reviews="reviews" :set-reviews="setReviews" />
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
      color: var(--color-text)
</style>
