<script setup lang="ts">
import { onBeforeMount, onUnmounted } from 'vue'
import ReviewBlock from '@/components/ReviewBlock.vue'
import type { ReviewWithDetails } from '@/types/tables/reviews.types'

const props = defineProps<{
  reviews: ReviewWithDetails[]
  setReviews: (limit?: number) => Promise<ReviewWithDetails[]>
}>()

onBeforeMount(async () => {
  props.setReviews()
})

onUnmounted(() => {
  props.setReviews(4)
})
</script>

<template>
  <div>
    <div class="text-3xl font-bold mb-8">Отзывы</div>
    <div class="flex flex-col gap-8">
      <router-link
        v-for="review in props.reviews"
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
        <review-block
          :review="review"
          color="#fff"
        />
      </router-link>
    </div>
  </div>
</template>

<style scoped lang="sass"></style>
