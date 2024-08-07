<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCustomRouter } from '@/utils/customRouter'
import { useUserStore } from '@/stores/userStore'
import { VButton } from '@/components/UI'
import { FavouriteSvg, ComparisonSvg } from '@/assets/icons'

const props = defineProps<{
  productId: number
  listTitle: 'favourites' | 'comparison'
}>()

const { userLists, changeUserListsValueOnToggle } = useUserStore()

const state = computed(() =>
  userLists[props.listTitle].includes(props.productId)
)
const loading = ref(false)
const add = async () => {
  loading.value = true
  await changeUserListsValueOnToggle(props.listTitle, props.productId)
  loading.value = false
}
const ListIcon = props.listTitle === 'favourites' ? FavouriteSvg : ComparisonSvg
const notInListTitle =
  props.listTitle === 'favourites' ? 'в избранное' : 'в сравнение'
const inListTitle =
  props.listTitle === 'favourites' ? 'в избранном' : 'в сравнении'

const routerTitle =
  props.listTitle === 'favourites' ? 'Favourites' : 'Comparison'

const router = useCustomRouter()
</script>

<template>
  <v-button
    v-if="!state"
    class="product__button"
    :loading="loading"
    @click="add"
  >
    <list-icon />
    {{ notInListTitle }}
  </v-button>
  <v-button
    v-else
    class="product__button"
    @click="router.push({ name: routerTitle })"
  >
    <list-icon fill="#60efe1" />
    {{ inListTitle }}
  </v-button>
</template>

<style scoped lang="sass">
.product__button
  display: flex
  gap: 8px
</style>
