<script setup lang="ts">
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/userStore'
import { getAll, updateOne } from '@/utils/queries/db'
import { VButton } from '@/components/UI'
import ProductCard from '@/components/ProductCard.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import TrashSVG from '@/assets/icons/trash.svg?component'
import type { ProductCardData } from './types'

const { user } = storeToRefs(useUserStore())

const favourites = ref<ProductCardData[]>([])

const loading = ref<'loading' | 'empty' | 'success'>('loading')

const watcher = watch(
  () => user.value?.favourites.length,
  async () => {
    if (!user.value) return
    loading.value = 'loading'
    const { data } = await getAll<ProductCardData>('products', {
      select: '*, categories(id, enTitle)',
      in: ['id', user.value.favourites]
    })
    favourites.value = data || []
    loading.value = favourites.value.length ? 'success' : 'empty'
    watcher()
  },
  {
    immediate: true
  }
)
const clear = async () => {
  if (user.value) {
    const data = await updateOne('users', user.value.id, {
      favourites: []
    })
    if (data) {
      user.value.favourites = []
      favourites.value = []
      loading.value = 'empty'
    }
  }
}

const deleteItem = async (id: number) => {
  if (user.value) {
    const data = await updateOne('users', user.value.id, {
      favourites: user.value.favourites.filter((e) => e !== id)
    })
    if (data) {
      user.value.favourites = data.favourites
      favourites.value = favourites.value.filter((e) => e.id !== id)
      if (favourites.value.length === 0) {
        loading.value = 'empty'
      }
    }
  }
}
</script>

<template>
  <div class="container">
    <div class="favourites">
      <div class="sidebar">
        <div class="text-3xl font-bold mb-8">Избранное</div>
        <v-button v-if="loading === 'success'" class="noactive" @click="clear">
          <TrashSVG />
          очистить список
        </v-button>
        <div v-else-if="loading === 'empty'">
          В списке желаемых покупок нет товаров
        </div>
      </div>
      <div class="cards">
        <template v-if="loading === 'success'">
          <product-card
            v-for="item in favourites"
            :key="item.id"
            :item="item"
            :delete="true"
            :favourites="false"
            @on-delete-item="deleteItem"
          />
        </template>
        <template v-if="loading === 'success'">
          <skeleton-card v-for="i in 8" :key="i" />
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped lang="sass">
.favourites
  display: grid
  grid-template-columns: 200px 1fr
  gap: 40px
  .cards
    display: grid
    grid-template-columns: repeat(4, 1fr)
    gap: 20px
    justify-items: center
</style>
