<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useFavoritesStore, useComparisonStore } from '@/modules/users'
import ActionIcon from '@/components/ActionIcon.vue'
import { FavouriteSvg, ComparisonSvg } from '@/assets/icons'

const props = defineProps<{
  productId: number
  listTitle: 'favourites' | 'comparison'
}>()

const { comparison } = storeToRefs(useComparisonStore())
const { toggleComparison } = useComparisonStore()

const { favorites } = storeToRefs(useFavoritesStore())
const { toggleFavorite } = useFavoritesStore()

const isActive = computed(() => {
  if (props.listTitle === 'favourites') {
    return favorites.value.includes(props.productId)
  }
  return comparison.value.includes(props.productId)
})

const ListIcon = props.listTitle === 'favourites' ? FavouriteSvg : ComparisonSvg

const loading = ref(false)
const onIcon = async () => {
  loading.value = true
  if (props.listTitle === 'favourites') {
    await toggleFavorite(props.productId)
  } else {
    await toggleComparison(props.productId)
  }
  loading.value = false
}
</script>

<template>
  <ActionIcon
    :svg="ListIcon"
    :is-active
    :loading
    @click.prevent="onIcon"
  />
</template>
