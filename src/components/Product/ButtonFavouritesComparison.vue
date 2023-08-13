<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/userStore'
import { useAddFavouritesAndComparison } from '@/utils/useAddFavouritesAndComparison'
import { localStorageGet } from '@/utils/localStorage'
import { VButton } from '@/components/UI'
import FavouriteSVG from '@/assets/icons/favourites.svg?component'
import ComparisonSVG from '@/assets/icons/comparison.svg?component'

const props = defineProps<{
  productId: number
  listTitle: 'favourites' | 'comparison'
}>()

const { user } = storeToRefs(useUserStore())

let productId

if (user.value) {
  productId = user.value?.[props.listTitle].find((e) => e === props.productId)
} else if (props.listTitle === 'comparison') {
  const storageProductids = localStorageGet<number[]>('compareList')
  productId = storageProductids?.find((e) => e === props.productId)
}

const state = ref(productId ? true : false)
const loading = ref(false)
const add = async () => {
  loading.value = true
  await useAddFavouritesAndComparison(
    props.listTitle,
    props.productId,
    state.value,
    () => {
      state.value = !state.value
    }
  )
  loading.value = false
}
const Icon = props.listTitle === 'favourites' ? FavouriteSVG : ComparisonSVG
const notInListTitle =
  props.listTitle === 'favourites' ? 'в избранное' : 'в сравнение'
const inListTitle =
  props.listTitle === 'favourites' ? 'в избранном' : 'в сравнении'

const routerTitle =
  props.listTitle === 'favourites' ? 'Favourites' : 'Comparison'
</script>

<template>
  <v-button
    v-if="!state"
    class="product__button"
    :loading="loading"
    @click="add"
  >
    <Icon />
    {{ notInListTitle }}
  </v-button>
  <v-button
    v-else
    class="product__button"
    @click="$router.push({ name: routerTitle })"
  >
    <Icon fill="#60efe1" />
    {{ inListTitle }}
  </v-button>
</template>

<style scoped lang="sass">
.product__button
  display: flex
  gap: 8px
</style>
