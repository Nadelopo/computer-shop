<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useCartStore } from '@/stores/cartStore'
import VButton from './UI/VButton.vue'
import VLoader from './UI/Vloader.vue'
import CartSVG from '@/assets/icons/cartInButton.svg?component'

type Props = {
  productId: number
  width?: number
}

const props = defineProps<Props>()

const loader = ref(false)

const { addToCart } = useCartStore()
const { cartItems } = storeToRefs(useCartStore())

const width = computed(() => {
  return props.width ? props.width + 'px' : 'auto'
})

const product = cartItems.value.find((e) => e.productId === props.productId)

const state = ref(product ? true : false)

const add = async () => {
  loader.value = true
  await addToCart(props.productId)
  loader.value = false
  state.value = true
}
</script>

<template>
  <template v-if="loader">
    <v-button class="button">
      <v-loader color="#9fe7e0" height="24px" />
    </v-button>
  </template>
  <template v-else>
    <v-button
      v-if="state"
      class="button"
      @click.prevent="$router.push({ name: 'Cart' })"
    >
      в корзину
    </v-button>
    <v-button v-else class="button" @click.prevent="add">
      <CartSVG width="16" fill="#fff" class="mr-2" /> купить
    </v-button>
  </template>
</template>

<style scoped lang="sass">
.button
  width: v-bind(width)
</style>
