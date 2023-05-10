<script setup lang="ts">
import { reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductsStore } from '@/stores/productsStore'
import VButton from '../UI/VButton.vue'
import ArrowSVG from '@/assets/icons/arrow.svg'

const route = useRoute()
const router = useRouter()

type SortType = keyof typeof sortAscents

const { setProducts } = useProductsStore()

const categoryId = Number(route.params.id)

const sortAscents = reactive({
  price: true,
  countReviews: false,
  discount: true,
  popularity: false,
  rating: false
})

const querySort =
  typeof route.query.sort === 'string' ? route.query.sort.split('_') : null

if (querySort) {
  const querySortTitle = querySort[0] as SortType
  const querySortValue = JSON.parse(querySort[1])

  if (querySortTitle in sortAscents) {
    sortAscents[querySortTitle] = querySortValue
    setProducts(categoryId, {
      order: {
        value: querySortTitle,
        ascending: !querySortValue
      }
    })
  }
} else {
  setProducts(categoryId)
}

const sort = async (type: SortType) => {
  setProducts(categoryId, {
    order: {
      value: type,
      ascending: sortAscents[type]
    }
  })
  sortAscents[type] = !sortAscents[type]
  router.push({
    ...route.query,
    query: {
      sort: type + '_' + sortAscents[type]
    }
  })
}
</script>

<template>
  <div class="sort">
    <div>соритровка по:</div>
    <v-button @click="sort('price')">
      <span class="mr-3">цене</span>
      <ArrowSVG :class="!sortAscents.price && 'down'" />
    </v-button>
    <v-button @click="sort('countReviews')">
      <span class="mr-3">отзывам</span>
      <ArrowSVG :class="!sortAscents.countReviews && 'down'" />
    </v-button>
    <v-button @click="sort('discount')">
      <span class="mr-3"> скидке</span>
      <ArrowSVG :class="!sortAscents.discount && 'down'" />
    </v-button>
    <v-button @click="sort('popularity')">
      <span class="mr-3"> популярности</span>
      <ArrowSVG :class="!sortAscents.popularity && 'down'" />
    </v-button>
    <v-button @click="sort('rating')">
      <span class="mr-3"> оценке</span>
      <ArrowSVG :class="!sortAscents.rating && 'down'" />
    </v-button>
  </div>
</template>

<style scoped lang="sass">
.sort
  display: flex
  gap: 16px
  margin-top: 32px
  align-items: center
  svg
    fill: #60efe1
    transition: .2s
    &.down
      transform: rotate(180deg)
</style>
