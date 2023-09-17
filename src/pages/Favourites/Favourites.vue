<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/userStore'
import { getAll, updateOneById } from '@/utils/queries/db'
import { VButton } from '@/components/UI'
import ProductCard from '@/components/ProductCard.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import { TrashSvg } from '@/assets/icons'
import type { ProductCardData } from './types'

const { userLists, setUserListsValue, deleteItemFromUserList } = useUserStore()
const { user } = storeToRefs(useUserStore())

const favourites = ref<ProductCardData[]>([])
const loading = ref<'loading' | 'empty' | 'success'>('success')

onBeforeMount(async () => {
  loading.value = 'loading'
  await setUserListsValue()
  const { data } = await getAll('products', {
    select: '*, categories(id, enTitle)',
    in: ['id', userLists.favourites]
  })
  favourites.value = data || []
  loading.value = favourites.value.length ? 'success' : 'empty'
})

const clear = async () => {
  if (user.value) {
    const data = await updateOneById('users', user.value.id, {
      favourites: []
    })
    if (data) {
      favourites.value = []
      user.value.favourites = []
      userLists.favourites = []
      loading.value = 'empty'
    }
  }
}

const deleteItem = async (id: number) => {
  const data = await deleteItemFromUserList('favourites', id)
  if (!data) return
  favourites.value = favourites.value.filter((e) => e.id !== id)
  if (favourites.value.length === 0) {
    loading.value = 'empty'
  }
}
</script>

<template>
  <div class="container">
    <div class="favourites">
      <div class="sidebar">
        <div class="text-3xl font-bold mb-8">Избранное</div>
        <v-button v-if="loading === 'success'" class="noactive" @click="clear">
          <trash-svg />
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
            @on-delete="deleteItem"
          />
        </template>
        <template v-else-if="loading === 'loading'">
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
  gap: 20px
  @media (width < 768px)
    grid-template-columns: 1fr
    grid-template-rows: auto 1fr
  .cards
    display: grid
    grid-template-columns: repeat(4, 1fr)
    gap: 30px 20px
    justify-items: center
    @media (width < 1536px)
      grid-template-columns: repeat(3, 1fr)
    @media (width < 1024px)
      grid-template-columns: repeat(2, 1fr)
    @media (width < 530px)
      grid-template-columns: 1fr
</style>
