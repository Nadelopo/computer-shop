<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useFavoritesStore, useComparisonStore } from '@/modules/users'
import { useCustomRouter } from '@/shared/composables/customRouter'
import { VButton } from '@/shared/components/UI'
import { FavouriteSvg, ComparisonSvg } from '@/shared/assets/icons'

const props = defineProps<{
  productId: number
  listTitle: 'favourites' | 'comparison'
}>()

const { favorites } = storeToRefs(useFavoritesStore())
const { toggleFavorite } = useFavoritesStore()

const { comparison } = storeToRefs(useComparisonStore())
const { toggleComparison } = useComparisonStore()

const state = computed(() => {
  if (props.listTitle === 'favourites') {
    return favorites.value.includes(props.productId)
  }
  return comparison.value.includes(props.productId)
})
const loading = ref(false)
const add = async () => {
  loading.value = true
  if (props.listTitle === 'favourites') {
    await toggleFavorite(props.productId)
  } else {
    await toggleComparison(props.productId)
  }
  loading.value = false
}
const ListIcon = props.listTitle === 'favourites' ? FavouriteSvg : ComparisonSvg
const notInListTitle = props.listTitle === 'favourites' ? 'в избранное' : 'в сравнение'
const inListTitle = props.listTitle === 'favourites' ? 'в избранном' : 'в сравнении'

const routerTitle = props.listTitle === 'favourites' ? 'Favourites' : 'Comparison'

const router = useCustomRouter()
</script>

<template>
  <VButton
    v-if="!state"
    class="product__button"
    :loading="loading"
    @click="add"
  >
    <ListIcon />
    {{ notInListTitle }}
  </VButton>
  <VButton
    v-else
    class="product__button"
    @click="router.push({ name: routerTitle })"
  >
    <ListIcon fill="#60efe1" />
    {{ inListTitle }}
  </VButton>
</template>

<style scoped lang="sass">
.product__button
  display: flex
  gap: 8px
</style>
