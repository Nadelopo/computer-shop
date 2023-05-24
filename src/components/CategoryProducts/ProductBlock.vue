<script setup lang="ts">
import { formatPrice } from '@/utils/formatPrice'
import ButtonCart from '../ButtonCart.vue'
import RatingStars from '../RatingStars.vue'
import IconBtnFavouritesComparison from '../IconButtonFavouritesComparison.vue'
import type { ProductWithSpecifications } from '@/types/tables/products.types'

defineProps<{
  item: ProductWithSpecifications
}>()
</script>

<template>
  <router-link
    :to="{
      name: 'Product',
      params: {
        categoryId: item.categoryId.id,
        category: item.categoryId.enTitle,
        productId: item.id
      }
    }"
  >
    <div class="card__wrapper">
      <div class="img__wrapper">
        <img :src="item.img" alt="" />
      </div>
      <div>
        <div class="card__link">
          <div class="card__head">
            <div class="card__title">{{ item.name }}</div>
            <div>
              <RatingStars :model-value="item.rating" />
            </div>
          </div>
          <div
            v-for="specification in item.specifications"
            :key="specification.categorySpecificationsId.id"
            class="flex flex-col gap-2"
          >
            <div
              v-if="specification.categorySpecificationsId.visible"
              class="flex gap-2"
            >
              <div>{{ specification.categorySpecificationsId.title }}:</div>
              <div>
                {{ specification.valueNumber ?? specification.valueString }}
                {{ specification.categorySpecificationsId.units }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex justify-around items-end flex-col h-full">
        <div class="flex gap-4">
          <icon-btn-favourites-comparison
            list-title="comparison"
            :product-id="item.id"
          />
          <icon-btn-favourites-comparison
            list-title="favourites"
            :product-id="item.id"
          />
        </div>
        <div>
          <div class="text-end mb-2 text-xl font-medium">
            {{ formatPrice(item.price) }}
          </div>
          <div>
            <button-cart :product-id="item.id" />
          </div>
        </div>
      </div>
    </div>
  </router-link>
</template>

<style scoped lang="sass">
.card__wrapper
  background-color: #fff
  transition: 0.4s
  padding: 20px 20px 20px 0
  border-radius: 8px
  padding: 20px 40px
  display: grid
  grid-template-columns: 20% auto 10%
  grid-gap: 40px
  align-items: center
  box-shadow: 0px 0px 10px 4px rgba(0,0,0, 0.1 )
  &:hover
    transition: 0.5s
    box-shadow: rgb(0, 0, 0 , .25) 0px 0px 15px 5px
  .img__wrapper
    display: flex
    justify-content: center
    img
      max-height: 220px

.card__link
  cursor: pointer
  transition: 1s
  &:hover
    transition: .3s
    color: var(--color-text)
  .card__head
    display: grid
    grid-template-columns: auto 1fr
    gap: 16px
    align-items: center
    margin-bottom: 16px
    font-size: 18px
    .card__title
      max-width: 370px
</style>
