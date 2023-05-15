<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/userStore'
import { getAllByColumns } from '@/utils/queries/db'
import type { ReviewReadWithDetails } from '@/types/tables/reviews'

const { user } = storeToRefs(useUserStore())

const reviews = ref<ReviewReadWithDetails[]>([])

onBeforeMount(async () => {
  if (user.value) {
    const data = await getAllByColumns<'reviews', ReviewReadWithDetails>(
      'reviews',
      [
        {
          column: 'userId',
          value: user.value.id
        }
      ],
      {
        select: '*, users(name)'
      }
    )
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
        <router-link :to="{ name: 'ProfileMain' }"> Заказы </router-link>
        <router-link :to="{ name: 'ProfileMain' }"> Доставка </router-link>
        <router-link :to="{ name: 'ProfileMain' }">
          Гарантийный отдел
        </router-link>
        <router-link :to="{ name: 'ProfileMain' }">
          Настройки профиля
        </router-link>
      </div>
      <div>
        <router-view />
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
