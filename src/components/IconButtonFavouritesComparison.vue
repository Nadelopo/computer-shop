<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUserStore } from '@/stores/userStore'
import ActionIcon from './ActionIcon.vue'
import { FavouriteSvg, ComparisonSvg } from '@/assets/icons'

const props = defineProps<{
  productId: number
  listTitle: 'favourites' | 'comparison'
}>()

const { userLists, changeUserListsValueOnToggle } = useUserStore()

const isActive = computed(() =>
  userLists[props.listTitle].includes(props.productId)
)

const ListIcon = props.listTitle === 'favourites' ? FavouriteSvg : ComparisonSvg

const loading = ref(false)
const onIcon = async () => {
  loading.value = true
  await changeUserListsValueOnToggle(props.listTitle, props.productId)
  loading.value = false
}
</script>

<template>
  <action-icon
    :svg="ListIcon"
    :svg-attrs="{ width: 24 }"
    :is-active
    :loading
    @click.prevent="onIcon"
  />
</template>
