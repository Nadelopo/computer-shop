<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { supabase } from '@/shared/api'
import { useUserStore } from '@/modules/users'
import { ReviewBlock, type ReviewWithDetails } from '@/modules/reviews'
import AppLink from '@/components/AppLink.vue'
import { VLoader } from '@/components/UI'
import type { Loading } from '@/types'

const { getSessionUser } = useUserStore()
const reviews = ref<ReviewWithDetails[]>([])
const loading = ref<Loading>('loading')

onBeforeMount(async () => {
  const user = await getSessionUser()
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
      <VLoader />
    </div>
    <div
      v-else-if="loading === 'success'"
      class="flex flex-col gap-8"
    >
      <AppLink
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
        <ReviewBlock
          :review="review"
          color="#fff"
        />
      </AppLink>
    </div>
    <div v-else-if="loading === 'empty'">Вы не оставили ни одного отзыва</div>
  </div>
</template>

<style scoped lang="sass"></style>
