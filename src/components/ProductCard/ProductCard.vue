<script setup lang="ts">
import { ref } from 'vue'
import { formatPrice } from '@/utils/formatPrice'
import IconButtonFavouritesComparison from '../IconButtonFavouritesComparison.vue'
import ButtonCart from '@/components/ButtonCart.vue'
import { CrossSvg } from '@/assets/icons'
import type { ProductCardData } from './types'

type Props = {
  item: ProductCardData
  delete?: boolean
  favourites?: boolean
  comparison?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  delete: false,
  favourites: true,
  comparison: true
})

const emit = defineEmits<{
  onDelete: [id: number]
}>()

const titleActive = ref(true)
</script>

<template>
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
    <div class="flex">
      <button class="cross">
        <cross-svg
          v-if="props.delete"
          @mouseenter="titleActive = false"
          @mouseleave="titleActive = true"
          @click.prevent="emit('onDelete', item.id)"
        />
      </button>
    </div>
    <div class="justify-self-center self-center">
      <img
        :src="item.img[0]"
        alt=""
      />
    </div>
    <div :class="{ title__active: titleActive }">{{ item.name }}</div>
    <div class="flex gap-x-4">
      <icon-button-favourites-comparison
        v-if="props.favourites"
        list-title="favourites"
        :product-id="props.item.id"
      />
      <icon-button-favourites-comparison
        v-if="props.comparison"
        list-title="comparison"
        :product-id="props.item.id"
      />
    </div>
    <div class="flex justify-between">
      <b class="text-xl self-center">{{ formatPrice(item.price) }}</b>
      <div>
        <button-cart :product-id="item.id" />
      </div>
    </div>
  </router-link>
</template>

<style scoped lang="sass">
.card
  display: grid
  grid-template-rows: auto 200px 50px 40px
  gap: 6px
  border-radius: 8px
  box-shadow: rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px
  padding: 15px
  background: #fff
  transition: .3s
  cursor: pointer
  width: 100%
  max-width: 280px
  min-width: 240px
  &:hover
    box-shadow: rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px
    .title__active
      color: var(--color-text)
  .title__active
    transition: .3s
  img
    max-width: 190px
    max-height: 190px
  .cross
    margin-left: auto
    transition: .2s
    &:hover
      transform: scale(1.3)
</style>
@/components/ProductCard/types