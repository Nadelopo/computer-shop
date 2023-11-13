<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { useManufacturersStore } from '@/stores/manufacturersStore'
import { formatPrice } from '@/utils/formatPrice'
import ButtonCart from '@/components/ButtonCart.vue'
import RatingStars from '../RatingStars.vue'
import ButtonFavouritesComparison from './ButtonFavouritesComparison.vue'
import type { ManufacturerRead } from '@/types/tables/manufacturers.types'
import type { ProductWithSpecifications } from '@/types/tables/products.types'
import type { Loading } from '@/types'

const props = defineProps<{
  product: ProductWithSpecifications
}>()

const { getManufacturer } = useManufacturersStore()
const manufacturer = ref<ManufacturerRead>()

const loading = ref<Loading>('loading')
onBeforeMount(async () => {
  const { data, error } = await getManufacturer(props.product.manufacturers.id)
  if (error) {
    loading.value = 'error'
    return
  }
  manufacturer.value = data
})

const productPrice = computed(() => {
  return formatPrice(props.product.price)
})

const isLargeScreen = useMediaQuery('(width >= 1024px)')

const buttonCartWidth = computed(() => {
  return isLargeScreen.value ? '400px' : '100%'
})
</script>

<template>
  <div class="product__top wrapper">
    <img
      class="align-middle sm:max-h-80 max-h-64"
      :src="product.img[0]"
      alt="..."
    />
    <div class="w-full">
      <div class="product__title">
        <div class="text-3xl font-medium">{{ product.name }}</div>
        <div class="ml-auto hidden sm:block">
          <img
            class="max-h-14"
            :src="manufacturer?.img"
          />
        </div>
      </div>

      <div class="text-4xl my-1 mb-4 font-medium">{{ productPrice }}</div>
      <rating-stars
        class="mb-4"
        :model-value="product.rating"
      />
      <div>
        <button-cart
          :width="buttonCartWidth"
          :product-id="product.id"
        />
        <div class="list__btns">
          <button-favourites-comparison
            list-title="favourites"
            :product-id="product.id"
          />
          <button-favourites-comparison
            list-title="comparison"
            :product-id="product.id"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="sass">

.product__top
  display: grid
  grid-template-columns: 1fr 1fr
  justify-items: center
  min-height: 350px
  align-items: center
  @media (width <1024px)
    grid-template-columns: 1fr
    grid-template-rows: 1fr 1fr
  .product__title
    display: grid
    grid-template-columns: 1fr 120px
    justify-content: space-between
    gap: 16px
    min-height: 56px
    @media (width < 640px)
      grid-template-columns: 1fr
      grid-template-rows: auto auto
  .list__btns
    margin-top: 6px
    max-width: 400px
    display: grid
    grid-template-columns: 1fr 1fr
    gap: 6px
    @media (width <1024px)
      max-width: 100%
    button
      display: flex
      gap: 8px
</style>
