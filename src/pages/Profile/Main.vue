<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/userStore'
import { formatPhoneNumber } from '@/utils/formatPhone'
import ReviewBlock from '@/components/ReviewBlock.vue'
import AppLink from '@/components/AppLink.vue'
import { VLoader } from '@/components/UI'
import type { ReviewWithDetails } from '@/types/tables/reviews.types'
import type { Loading } from '@/types'

defineProps<{
  reviews: ReviewWithDetails[]
  loading: Loading
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
        <div>Имя</div>
        <div>{{ user.name }}</div>
      </div>
      <div class="row">
        <div>Почта</div>
        <div>{{ user.email }}</div>
      </div>
      <div class="row">
        <div>Телефон</div>
        <div>{{ formatPhoneNumber(user.phone) }}</div>
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
        v-if="loading === 'success'"
        class="last__reviews"
      >
        <app-link
          v-for="review in reviews.slice(0, 4)"
          :key="review.id"
          :to="{
            name: 'Product',
            params: {
              categoryId: review.products.categories.id,
              category: review.products.categories.enTitle,
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
      <v-loader v-else-if="loading === 'loading'" />
      <div v-else-if="loading === 'empty'">Вы не оставили ни одного отзыва</div>
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
