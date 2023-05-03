<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useProductsStore } from '@/stores/productsStore'
import { useManufacturersStore } from '@/stores/manufacturersStore'
import Rating from '@/components/Rating.vue'
import ButtonCart from '@/components/ButtonCart.vue'
import VButton from '@/components/UI/VButton.vue'
import FavouritesSVG from '@/assets/icons/favourites.svg?component'
import ComparisonSVG from '@/assets/icons/comparison.svg?component'
import type { ManufacturerRead } from '@/types/tables/manufacturers.types'
import type { ProductWithSpecifications } from '@/types/tables/products.types'

const { getProduct } = useProductsStore()
const { getManufacturer } = useManufacturersStore()

const id = Number(useRoute().params.productId)

const product = ref<ProductWithSpecifications>()
const productPrice = ref('')
const manufacturer = ref<ManufacturerRead>()

onBeforeMount(async () => {
  const data = await getProduct(id)
  if (data.value) {
    data.value.specifications = data.value.specifications.map((e) => {
      const title = e.categorySpecificationsId.title
      e.categorySpecificationsId.title =
        title.charAt(0).toUpperCase() + title.slice(1)
      return e
    })
    product.value = data.value

    const manufacturerData = await getManufacturer(data.value.manufacturerId.id)
    if (manufacturerData) {
      manufacturer.value = manufacturerData
    }

    const price = String(product.value.price).split('')
    const result = []
    for (let i = price.length - 1; i >= 0; i--) {
      if ((price.length - i - 1) % 3 === 0) {
        result.unshift(' ')
      }
      result.unshift(price[i])
    }
    productPrice.value = result.join('') + ' ₽'
  }
})
</script>

<template>
  <div v-if="product && manufacturer" class="container">
    <div class="product__top wrapper">
      <img class="align-middle max-h-80" :src="product.img" alt="..." />
      <div class="w-full">
        <div class="flex justify-between gap-4">
          <div class="text-3xl">{{ product.name }}</div>
          <div>
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
    <div class="wrapper grid">
      <div class="wrapper__title">Описание</div>
      <div class="text-xl leading-9">{{ product.description }}</div>
    </div>
    <div class="wrapper grid">
      <div class="wrapper__title">Характеристики</div>
      <div>
        <div
          v-for="specification in product.specifications"
          :key="specification.id"
          class="specification"
        >
          <div class="specification__title">
            {{ specification.categorySpecificationsId.title }}
          </div>
          <div class="flex items-end">
            {{ specification.valueNumber ?? specification.valueString }}
            {{ specification.categorySpecificationsId.units }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="sass">
.wrapper
  background: #fff
  border-radius: 8px
  border: 1px solid #d9d9d9
  padding: 30px
  margin-bottom: 20px
  &__title
    font-size: 30px
  &.grid
    display: grid
    grid-template-columns: 18% 1fr
.product__top
  display: grid
  grid-template-columns: 1fr 1fr
  justify-items: center
  min-height: 350px
  align-items: center


.list__btns
  margin-top: 6px
  max-width: 400px
  display: grid
  grid-template-columns: 1fr 1fr
  gap: 6px
  button
    display: flex
    gap: 8px

.specification
  font-size: 18px
  margin-bottom: 14px
  display: grid
  grid-template-columns: 60% auto
  gap: 20px
  .specification__title
    border-bottom: 1px dotted #5e5e5e
</style>
