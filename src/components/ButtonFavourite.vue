<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/userStore'
import { useAddToFavourites } from '@/utils/useAddToFavourites'
import FavouriteSVG from '@/assets/icons/favourites.svg?component'

const props = defineProps<{
  productId: number
}>()

const { user } = storeToRefs(useUserStore())

const productId = user.value?.favourites.find((e) => e === props.productId)

const state = ref(productId ? true : false)

const fill = computed(() => (state.value ? 'var(--color-main)' : 'var(--gray)'))

const add = () => {
  useAddToFavourites(props.productId, state.value, () => {
    state.value = !state.value
  })
}
</script>

<template>
  <FavouriteSVG class="favourite__btn" width="30" @click.prevent="add" />
</template>

<style scoped lang="sass">
.favourite__btn
  fill: v-bind(fill)
  transition: .2s
  &:hover
    fill: var(--color-main)
</style>
