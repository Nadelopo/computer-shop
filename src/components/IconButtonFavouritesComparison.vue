<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/userStore'
import { useAddFavouritesAndComparison } from '@/utils/useAddFavouritesAndComparison'
import { localStorageGet } from '@/utils/localStorage'
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

const fill = computed(() => (state.value ? 'var(--color-main)' : 'var(--gray)'))

const add = () => {
  useAddFavouritesAndComparison(
    props.listTitle,
    props.productId,
    state.value,
    () => {
      state.value = !state.value
    }
  )
}
const Icon = props.listTitle === 'favourites' ? FavouriteSVG : ComparisonSVG
</script>

<template>
  <button class="favourite-comparison__btn" @click.prevent="add">
    <Icon width="24" />
  </button>
</template>

<style scoped lang="sass">
.favourite-comparison__btn
  svg
    fill: v-bind(fill)
    transition: .2s
  &:hover
    svg
      fill: var(--color-main)
</style>
