<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/userStore'
import ReviewBlock from '@/components/ReviewBlock.vue'
import AppLink from '@/components/AppLink.vue'
import type { ReviewWithDetails } from '@/types/tables/reviews.types'

defineProps<{
  reviews: ReviewWithDetails[]
}>()

const { user } = storeToRefs(useUserStore())
</script>

<template>
  <div>
    <div
      v-if="user"
      class="user__info"
    >
      <div class="row">
        <div class="">Имя</div>
        <div>{{ user.name }}</div>
      </div>
      <div class="row">
        <div class="">Почта</div>
        <div>{{ user.email }}</div>
      </div>
      <div class="row">
        <div class=""></div>
        <div>{{ user.phone }}</div>
      </div>
    </div>
    <div class="reviews__grid">
      <div>
        <div class="text-3xl font-bold">Отзывы</div>
        <app-link
          :to="{ name: 'ProfileReviews' }"
          class="text-xl color-text"
        >
          Посмотреть все
        </app-link>
      </div>
      <div
        v-if="reviews.length"
        class="last__reviews"
      >
        <app-link
          v-for="review in reviews.slice(0, 4)"
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
        </app-link>
      </div>
    </div>
  </div>
</template>

<style scoped lang="sass">

.user__info
  margin-bottom: 100px
  .row
    display: grid
    grid-template-columns: 80px auto
    gap: 10px
    font-size: 20px
    font-weight: 500

.reviews__grid
  display: grid
  grid-template-columns: auto 1fr
  gap: 50px
  .last__reviews
    display: flex
    flex-direction: column
    gap: 40px
</style>
