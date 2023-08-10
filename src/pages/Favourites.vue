<script setup lang="ts">
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { getAll, updateOne } from '@/utils/queries/db'
import { useUserStore } from '@/stores/userStore'
import { formatPrice } from '@/utils/formatPrice'
import ButtonCart from '@/components/ButtonCart.vue'
import VButton from '@/components/UI/VButton.vue'
import VLoader from '@/components/UI/VLoader.vue'
import CrossSVG from '@/assets/icons/cross.svg?component'
import TrashSVG from '@/assets/icons/trash.svg?component'
import type { ProductRead } from '@/types/tables/products.types'

type ProductCard = ProductRead & {
  categories: {
    id: number
    enTitle: string
  }
}

const { user } = storeToRefs(useUserStore())

const favourites = ref<ProductCard[]>([])

const lodaing = ref<'loading' | 'empty' | 'success'>('loading')

const watcher = watch(
  () => user.value?.favourites.length,
  async () => {
    if (user.value) {
      lodaing.value = 'loading'
      const { data } = await getAll<ProductCard>('products', {
        select: '*, categories(id, enTitle)',
        in: ['id', user.value.favourites]
      })
      favourites.value = data || []
      lodaing.value = favourites.value.length ? 'success' : 'empty'
      watcher()
    }
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
      lodaing.value = 'empty'
    }
  }
}

const titleActive = ref(true)

const deleteItem = async (id: number) => {
  if (user.value) {
    const data = await updateOne('users', user.value.id, {
      favourites: user.value.favourites.filter((e) => e !== id)
    })
    if (data) {
      user.value.favourites = data.favourites
      favourites.value = favourites.value.filter((e) => e.id !== id)
      if (favourites.value.length === 0) {
        lodaing.value = 'empty'
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
        <div v-if="lodaing === 'loading'" />
        <v-button
          v-else-if="lodaing === 'success'"
          class="noactive"
          @click="clear"
        >
          <TrashSVG />
          очистить список
        </v-button>
        <div v-else-if="lodaing === 'empty'">
          В списке желаемых покупок нет товаров
        </div>
      </div>
      <div>
        <div v-if="lodaing === 'loading'" class="mt-40">
          <v-loader />
        </div>
        <div v-else class="cards">
          <div v-for="item in favourites" :key="item.id">
            <router-link
              :to="{
                name: 'Product',
                params: {
                  category: item.categories.enTitle,
                  categoryId: item.categories.id,
                  productId: item.id
                }
              }"
              class="card"
            >
              <div>
                <CrossSVG
                  class="cursor-pointer ml-auto"
                  @mouseenter="titleActive = false"
                  @mouseleave="titleActive = true"
                  @click.prevent="deleteItem(item.id)"
                />
              </div>
              <div class="justify-self-center self-center">
                <img :src="item.img" alt="" />
              </div>
              <div :class="{ title__active: titleActive }">{{ item.name }}</div>
              <div class="flex justify-between">
                <div>{{ formatPrice(item.price) }}</div>
                <div>
                  <button-cart :product-id="item.id" />
                </div>
              </div>
            </router-link>
          </div>
        </div>
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
    .card
      display: grid
      grid-template-rows: auto 200px 70px 40px
      gap: 10px
      border-radius: 8px
      box-shadow: rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px
      padding: 15px
      background: #fff
      transition: .3s
      cursor: pointer
      &:hover
        box-shadow: rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px
        .title__active
          color: var(--color-text)
      .title__active
        transition: .3s
      img
        max-width: 190px
        max-height: 190px
      svg
        transition: .2s
        &:hover
          transform: scale(1.3)
</style>
