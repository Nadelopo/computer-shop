<script setup lang="ts">
import { ref, onBeforeMount } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/userStore'
import { getAll } from '@/utils/queries/db'
import ReviewsBlock from '@/components/Product/ReviewsBlock.vue'
import type { ReviewWithDetails } from '@/types/tables/reviews.types'

const { user } = storeToRefs(useUserStore())

const reviews = ref<ReviewWithDetails[]>([])

onBeforeMount(async () => {
  if (user.value) {
    const { data } = await getAll<ReviewWithDetails>('reviews', {
      match: { userId: user.value.id },
      select: '*, users(name), categories(id, enTitle)',
      order: {
        value: 'created_at',
        ascending: false
      }
    })
    if (data) {
      reviews.value = data
    }
  }
})
</script>

<template>
  <div>
    <div class="text-3xl font-bold mb-8">Отзывы</div>
    <div class="flex flex-col gap-8">
      <router-link
        v-for="review in reviews"
        :key="review.id"
        :to="{
          name: 'Product',
          params: {
            categoryId: review.categories.id,
            category: review.categories.enTitle,
            productId: review.productId
          },
          query: {
            comm_id: review.id
          }
        }"
      >
        <reviews-block :review="review" color="#fff" />
      </router-link>
    </div>
  </div>
</template>

<style scoped lang="sass"></style>
