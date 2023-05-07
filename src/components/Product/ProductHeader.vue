<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useManufacturersStore } from '@/stores/manufacturersStore'
import { formatPrice } from '@/utils/formatPrice'
import Rating from '@/components/Rating.vue'
import VButton from '@/components/UI/VButton.vue'
import ButtonCart from '@/components/ButtonCart.vue'
import FavouritesSVG from '@/assets/icons/favourites.svg?component'
import ComparisonSVG from '@/assets/icons/comparison.svg?component'
import type { ManufacturerRead } from '@/types/tables/manufacturers.types'
import type { ProductWithSpecifications } from '@/types/tables/products.types'

const props = defineProps<{
  product: ProductWithSpecifications
}>()

const { getManufacturer } = useManufacturersStore()

const manufacturer = ref<ManufacturerRead>()

const loadManufacturer = async () => {
  const data = await getManufacturer(props.product.manufacturerId.id)
  if (data) {
    manufacturer.value = data
  }
}

const productPrice = computed(() => {
  return formatPrice(props.product.price)
})

loadManufacturer()
watch(() => props.product.id, loadManufacturer)
</script>

<template>
  <div class="product__top wrapper">
    <img class="align-middle max-h-80" :src="product.img" alt="..." />
    <div class="w-full">
      <div class="product__title">
        <div class="text-3xl">{{ product.name }}</div>
        <div class="ml-auto">
          <img class="max-h-14" :src="manufacturer?.img" />
        </div>
      </div>
      <Rating :rating="product.rating" />
      <div class="text-4xl mb-4 mt-6">{{ productPrice }}</div>
      <div>
        <button-cart :width="400" :product-id="product.id" />
        <div class="list__btns">
          <v-button>
            <FavouritesSVG fill="#60efe1" />
            <span>в избранное</span>
          </v-button>
          <v-button>
            <ComparisonSVG fill="#60efe1" />
            <span>в сравнение</span>
          </v-button>
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
  .product__title
    display: grid
    grid-template-columns: 1fr 120px
    justify-content: space-between
    gap: 16px
    min-height: 56px
  .list__btns
    margin-top: 6px
    max-width: 400px
    display: grid
    grid-template-columns: 1fr 1fr
    gap: 6px
    button
      display: flex
      gap: 8px
</style>
