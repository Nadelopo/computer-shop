<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import { formatPrice } from '@/utils/formatPrice'
import { getSpecificationValue } from '@/utils/getSpecificationValue'
import ButtonCart from '../ButtonCart.vue'
import RatingStars from '../RatingStars.vue'
import IconBtnFavouritesComparison from '../IconButtonFavouritesComparison.vue'
import AppLink from '../AppLink.vue'
import type { ProductWithSpecifications } from '@/types/tables/products.types'

defineProps<{
  item: ProductWithSpecifications
}>()

const isSmall = useMediaQuery('(width < 520px)')
</script>

<template>
  <app-link
    :to="{
      name: 'Product',
      params: {
        categoryId: item.categories.id,
        category: item.categories.enTitle,
        productId: item.id
      }
    }"
  >
    <div class="card__wrapper">
      <div class="img__wrapper">
        <img
          :src="item.img[0]"
          alt=""
        />
      </div>
      <div>
        <div class="card__link">
          <div class="card__head">
            <div class="card__head__title">{{ item.title }}</div>
            <div>
              <rating-stars
                :model-value="item.rating"
                :size="isSmall ? 'small' : 'normal'"
              />
            </div>
          </div>
          <div
            v-for="specification in item.specifications"
            :key="specification.category_specifications.id"
            class="flex gap-x-1"
          >
            <div>{{ specification.category_specifications.title }}:</div>
            <div class="text-end">
              {{ getSpecificationValue(specification) }}
              {{ specification.category_specifications.units }}
            </div>
          </div>
        </div>
      </div>
      <div class="actions">
        <div class="flex gap-4 justify-center md:mb-auto">
          <icon-btn-favourites-comparison
            list-title="comparison"
            :product-id="item.id"
          />
          <icon-btn-favourites-comparison
            list-title="favourites"
            :product-id="item.id"
          />
        </div>
        <div class="price__wrapper">
          <div
            class="text-end lg:mb-2 price"
            :class="{
              discounted: item.discount
            }"
          >
            {{ formatPrice(item.priceWithoutDiscount) }}
          </div>
          <div
            v-if="item.discount"
            class="text-end lg:mb-2 price coloured"
          >
            {{ formatPrice(item.price) }}
          </div>
        </div>
        <div>
          <button-cart
            :size="isSmall ? 'small' : 'normal'"
            :product-id="item.id"
            :quantity="item.quantity"
            class="ml-auto"
          />
        </div>
      </div>
    </div>
  </app-link>
</template>

<style scoped lang="sass">
.card__wrapper
  background-color: #fff
  transition: box-shadow 0.4s
  padding: 20px 20px 20px 0
  border-radius: 8px
  padding: 20px 40px
  display: grid
  grid-template-columns: 20% auto 1fr
  gap: 10px 40px
  align-items: center
  box-shadow: 0px 0px 10px 4px rgba(0,0,0, 0.1 )
  min-height: 250px
  grid-template-areas: '. . actions'
  &:hover
    transition: box-shadow 0.5s
    box-shadow: rgb(0, 0, 0 , .25) 0px 0px 15px 5px
  @media (width < 768px)
    font-size: 12px
    grid-template-areas: '. .' 'actions actions'
    grid-template-columns:  minmax(20%, 80px) 1fr
    height: auto
    padding: 20px
  @media (width < 520px)
    gap: 10px
    padding: 10px
  .img__wrapper
    display: flex
    justify-content: center
    img
      max-height: 210px
  .actions
    grid-area: actions
    display: flex
    justify-content: flex-end
    align-items: flex-end
    flex-direction: column
    height: 100%
    @media (width < 768px)
      display: grid
      grid-template-columns: minmax(20%, 80px) auto 1fr
      gap: 40px
      & > :last-child
        justify-self: end
    @media (width < 520px)
      gap: 0
    .price__wrapper
      @media (width < 768px)
        div
          font-size: 18px
        display: flex
        flex-direction: row-reverse
        align-items: center
        gap: 8px
        .discounted
          font-size: 12px
      @media (width < 520px)
        gap: 2px
        margin-left: 10px

.card__link
  cursor: pointer
  transition: color 1s
  &:hover
    transition: color .3s
    color: var(--main-semi-light)
  .card__head
    display: grid
    grid-template-columns: auto 1fr
    gap: 16px
    margin-bottom: 16px
    font-size: 18px
    @media (width < 1536px)
      grid-template-columns: 1fr
      gap: 4px
    @media (width < 1280px)
      grid-template-columns: 1fr
      gap: 4px
    &__title
      max-width: 370px
      @media (width < 768px)
        font-size: 16px
</style>
