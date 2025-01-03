<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { supabase } from '@/db/supabase'
import { useUserStore } from '@/stores/userStore'
import { useLocalStorage } from '@/utils/localStorage'
import { getProductQuantity } from '@/utils/getProductQuantity'
import { VButton } from '@/components/UI'
import ProductCard from '@/components/ProductCard'
import ProductCardSkeleton from '@/components/ProductCard/ProductCardSkeleton.vue'
import { TrashSvg } from '@/assets/icons'
import type { ProductCardData } from '@/components/ProductCard/types'
import type { Loading } from '@/types'

const { userLists, setUserListsValue, deleteItemFromUserList } = useUserStore()
const { clearUserLists } = useUserStore()

const favourites = ref<ProductCardData[]>([])
const loading = ref<Loading>('success')

const setFavourites = async () => {
  loading.value = 'loading'
  await setUserListsValue()

  const { data, error } = await supabase
    .from('products')
    .select('*, categories(id, enTitle), product_quantity_in_stores(quantity)')
    .in('id', userLists.favourites)

  if (error) {
    loading.value = 'error'
    return
  }
  favourites.value = data.map((p) => ({
    ...p,
    quantity: getProductQuantity(p.product_quantity_in_stores)
  }))

  loading.value = favourites.value.length ? 'success' : 'empty'
}

onBeforeMount(setFavourites)
useLocalStorage('favourites', { onChange: setFavourites })

const clear = async () => {
  loading.value = 'loading'
  const { error } = await clearUserLists('favourites', [])
  if (error) {
    loading.value = 'error'
  }
  favourites.value = []
  loading.value = 'empty'
}

const deleteItem = async (id: number) => {
  const { error } = await deleteItemFromUserList('favourites', id)
  if (error) {
    loading.value = 'error'
    return
  }
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
        <v-button
          v-if="loading === 'success'"
          class="noactive"
          @click="clear"
        >
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
            :favourites="false"
            @delete="deleteItem"
          />
        </template>
        <template v-else-if="loading === 'loading'">
          <product-card-skeleton
            v-for="i in 8"
            :key="i"
          />
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
