<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/userStore'
import { useAddToFavourites } from '@/utils/useAddToFavourites'
import VButton from '../UI/VButton.vue'
import VLoader from '../UI/Vloader.vue'
import FavouriteSVG from '@/assets/icons/favourites.svg?component'

const props = defineProps<{ productId: number }>()

const { user } = storeToRefs(useUserStore())

const productId = user.value?.favourites.find((e) => e === props.productId)

const state = ref(productId ? true : false)
const loading = ref(false)
const add = async () => {
  loading.value = true
  await useAddToFavourites(props.productId, state.value, () => {
    state.value = !state.value
  })
  loading.value = false
}
</script>

<template>
  <template v-if="loading">
    <v-button>
      <v-loader color="#9fe7e0" height="24px" />
    </v-button>
  </template>
  <template v-else>
    <v-button v-if="!state" @click="add">
      <FavouriteSVG /> в избранное
    </v-button>
    <v-button v-else @click="$router.push({ name: 'Favourites' })">
      <FavouriteSVG fill="#60efe1" /> в избранном
    </v-button>
  </template>
</template>

<style scoped lang="sass"></style>
