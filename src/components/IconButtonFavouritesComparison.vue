<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { FavouriteSvg, ComparisonSvg } from '@/assets/icons'

const props = defineProps<{
  productId: number
  listTitle: 'favourites' | 'comparison'
}>()

const { userLists, changeUserListsValueOnToggle } = useUserStore()

const fill = computed(() =>
  userLists[props.listTitle].includes(props.productId)
    ? 'var(--main)'
    : 'var(--gray)'
)

const ListIcon = props.listTitle === 'favourites' ? FavouriteSvg : ComparisonSvg
</script>

<template>
  <button
    class="favourite-comparison__btn"
    @click.prevent="
      changeUserListsValueOnToggle(props.listTitle, props.productId)
    "
  >
    <list-icon width="24" />
  </button>
</template>

<style scoped lang="sass">
.favourite-comparison__btn
  svg
    fill: v-bind(fill)
    transition: .2s
  &:hover
    svg
      fill: var(--main)
</style>
