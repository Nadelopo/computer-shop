<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { supabase } from '@/db/supabase'
import { useUserStore } from '@/stores/userStore'
import ReviewBlock from '@/components/ReviewBlock.vue'
import AppLink from '@/components/AppLink.vue'
import { VLoader } from '@/components/UI'
import type { ReviewWithDetails } from '@/types/tables/reviews.types'
import type { Loading } from '@/types'

const { isUserAuthenticated } = useUserStore()
const reviews = ref<ReviewWithDetails[]>([])
const loading = ref<Loading>('loading')

onBeforeMount(async () => {
  const user = await isUserAuthenticated()
  if (!user) return

  const { data, error } = await supabase
    .from('reviews')
    .select('*, users(name), products(categories(id, enTitle))')
    .eq('userId', user.id)
    .order('created_at', { ascending: false })
  if (error) {
    loading.value = 'error'
    return
  }

  if (!data.length) {
    loading.value = 'empty'
    return
  }

  reviews.value = data
  loading.value = 'success'
})
</script>

<template>
  <div>
    <div class="text-3xl font-bold mb-8">Отзывы</div>
    <div v-if="loading === 'loading'">
      <v-loader />
    </div>
    <div
      v-else-if="loading === 'success'"
      class="flex flex-col gap-8"
    >
      <app-link
        v-for="review in reviews"
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
    <div v-else-if="loading === 'empty'">Вы не оставили ни одного отзыва</div>
  </div>
</template>

<style scoped lang="sass"></style>
