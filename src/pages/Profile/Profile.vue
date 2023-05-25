<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/userStore'
import { getAll } from '@/utils/queries/db'
import type { ReviewWithDetails } from '@/types/tables/reviews'

const { user } = storeToRefs(useUserStore())

const reviews = ref<ReviewWithDetails[]>([])

onBeforeMount(async () => {
  if (user.value) {
    const data = await getAll<'reviews', ReviewWithDetails>('reviews', {
      eq: [
        {
          column: 'userId',
          value: user.value.id
        }
      ],
      select: '*, users(name), categories(id, enTitle)',
      order: {
        value: 'created_at',
        ascending: false
      }
    })
    console.log(data)
    if (data) {
      reviews.value = data
    }
  }
})
</script>

<template>
  <div class="container">
    <div class="grid">
      <div class="sidebar">
        <router-link :to="{ name: 'ProfileMain' }"> Мой профиль </router-link>
        <router-link :to="{ name: 'ProfileOrders' }"> Заказы </router-link>
        <router-link :to="{ name: 'ProfileDelivery' }"> Доставка </router-link>
        <router-link :to="{ name: 'ProfileMain' }">
          Гарантийный отдел
        </router-link>
        <router-link :to="{ name: 'ProfileMain' }">
          Настройки профиля
        </router-link>
      </div>
      <div>
        <router-view :reviews="reviews" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="sass">
.grid
  display: grid
  grid-template-columns: 300px 1fr
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
