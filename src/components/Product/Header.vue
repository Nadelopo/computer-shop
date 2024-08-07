<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
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
const { manufacturers } = storeToRefs(useManufacturersStore())
const manufacturer = ref<ManufacturerRead>()

const loading = ref<Loading>('loading')
onBeforeMount(async () => {
  const item = manufacturers.value.find(
    (m) => m.id === props.product.manufacturers.id
  )
  if (item) {
    manufacturer.value = item
    return
  }
  const { data, error } = await getManufacturer(props.product.manufacturers.id)
  if (error) {
    loading.value = 'error'
    return
  }
  manufacturer.value = data
})

const isLargeScreen = useMediaQuery('(width >= 1024px)')

const buttonCartWidth = computed(() => {
  return isLargeScreen.value ? '400px' : '100%'
})

const copyProductCode = (id: number) => {
  navigator.clipboard.writeText(`#${id}`)
  useToast().success('Код скопирован')
}
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
        <div class="text-3xl font-medium">
          <div> {{ product.title }}</div>
          <span
            class="product__code"
            @click="copyProductCode(product.id)"
          >
            Код товара: #{{ product.id }}
          </span>
        </div>
        <div class="ml-auto hidden sm:block">
          <img
            class="max-h-14"
            :src="manufacturer?.img"
            alt="..."
          />
        </div>
      </div>

      <div
        class="mt-2 price"
        :class="{ discounted: product.discount }"
        :style="{ fontSize: product.discount ? '' : '36px' }"
      >
        {{ formatPrice(product.priceWithoutDiscount) }}
      </div>
      <div
        v-if="product.discount"
        class="price coloured"
        style="font-size: 36px"
      >
        {{ formatPrice(product.price) }}
      </div>
      <rating-stars
        class="mb-4"
        :model-value="product.rating"
      />
      <div>
        <button-cart
          :width="buttonCartWidth"
          :quantity="product.quantity"
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
  gap: 20px
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
  .product__code
    font-size: 14px
    font-weight: 300
    margin-top: 4px
    color: #444
    cursor: pointer
    &:hover
      color: #000

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
