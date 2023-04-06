<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useCartStore } from '@/stores/cartStore'
import VButton from './UI/VButton.vue'
import VLoader from './UI/Vloader.vue'
import CartSVG from '@/assets/icons/cartInButton.svg?component'

type Props = {
  productId: number
}

const loader = ref(false)

const { addToCart } = useCartStore()
const { cartItems } = storeToRefs(useCartStore())

const props = defineProps<Props>()

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
    <v-button>
      <v-loader height="24px" />
    </v-button>
  </template>
  <template v-else>
    <v-button v-if="state" @click="$router.push({ name: 'Cart' })">
      в корзину
    </v-button>
    <v-button v-else @click="add">
      <CartSVG width="16" fill="#fff" class="mr-2" /> купить
    </v-button>
  </template>
</template>

<style scoped lang="sass"></style>
