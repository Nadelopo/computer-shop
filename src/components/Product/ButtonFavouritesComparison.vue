<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { VButton } from '@/components/UI'
import { FavouriteSvg, ComparisonSvg } from '@/assets/icons'

const props = defineProps<{
  productId: number
  listTitle: 'favourites' | 'comparison'
}>()

const { userLists, changeUserListValueOnClick } = useUserStore()

const state = computed(() =>
  userLists[props.listTitle].includes(props.productId)
)
const loading = ref(false)
const add = async () => {
  loading.value = true
  await changeUserListValueOnClick(props.listTitle, props.productId)
  loading.value = false
}
const Icon = props.listTitle === 'favourites' ? FavouriteSvg : ComparisonSvg
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
