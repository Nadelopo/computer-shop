<script setup lang="ts">
import RatingStars from '../RatingStars.vue'
import AvatarSvg from '@/assets/icons/avatar.svg?component'
import type { ReviewReadWithDetails } from '@/types/tables/reviews'

defineProps<{
  review: ReviewReadWithDetails
}>()
</script>

<template>
  <div>
    <div class="review">
      <div class="flex gap-x-6">
        <AvatarSvg width="40" fill="#cdcdcd" />
        <div class="flex items-center">{{ review.users.name }}</div>
        <div class="flex gap-x-2 items-center">
          <RatingStars :model-value="review.rating" />
        </div>
        <div class="ml-auto">
          {{ new Date(review.created_at).toLocaleDateString() }}
        </div>
      </div>
      <div v-if="review.dignities" class="mb-4 mt-6">
        <div class="title">Достоинства</div>
        <div>{{ review.dignities }}</div>
      </div>
      <div v-if="review.disadvantages" class="mb-4">
        <div class="title">Недостатки</div>
        <div>{{ review.disadvantages }}</div>
      </div>
      <div v-if="review.comment" class="mb-4">
        <div class="title">Комментарий</div>
        <div>{{ review.comment }}</div>
      </div>
      <slot></slot>
    </div>
  </div>
</template>

<style scoped lang="sass">

.review
  background: #f6f6f6
  border-radius: 8px
  padding: 8px 16px
  .title
    font-size: 20px
    font-weight: 500
    margin-bottom: 10px
</style>
