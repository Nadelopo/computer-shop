<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { FavouriteSvg, ComparisonSvg } from '@/assets/icons'

const props = defineProps<{
  productId: number
  listTitle: 'favourites' | 'comparison'
}>()

const { userLists, changeUserListValueOnClick } = useUserStore()

const fill = computed(() =>
  userLists[props.listTitle].includes(props.productId)
    ? 'var(--color-main)'
    : 'var(--gray)'
)

const Icon = props.listTitle === 'favourites' ? FavouriteSvg : ComparisonSvg
</script>

<template>
  <button
    class="favourite-comparison__btn"
    @click.prevent="
      changeUserListValueOnClick(props.listTitle, props.productId)
    "
  >
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
