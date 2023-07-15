<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useCartStore } from '@/stores/cartStore'
import VButton from './UI/VButton.vue'
// import VLoader from './UI/VLoader.vue'
import CartSVG from '@/assets/icons/cartInButton.svg?component'

type Props = {
  productId: number
  width?: number
}

const props = defineProps<Props>()

const loading = ref(false)

const { addToCart } = useCartStore()
const { cartItems } = storeToRefs(useCartStore())

const product = cartItems.value.find((e) => e.productId === props.productId)

const state = ref(product ? true : false)

const add = async () => {
  loading.value = true
  await addToCart(props.productId)
  loading.value = false
  state.value = true
}

const width = computed(() => props.width + 'px')
</script>

<template>
  <template v-if="loading">
    <v-button :width="width">
      <!-- <v-loader color="#9fe7e0" height="24px" /> -->
    </v-button>
  </template>
  <template v-else>
    <v-button
      v-if="state"
      :width="width"
      @click.prevent="$router.push({ name: 'Cart' })"
    >
      в корзину
    </v-button>
    <v-button v-else :width="width" @click.prevent="add">
      <CartSVG width="16" fill="#fff" class="mr-2" /> купить
    </v-button>
  </template>
</template>
