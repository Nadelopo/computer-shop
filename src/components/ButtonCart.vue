<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useCartStore } from '@/stores/cartStore'
import { VButton } from '@/components/UI'
import CartSVG from '@/assets/icons/cartInButton.svg?component'

const props = defineProps<{
  productId: number
  width?: number
}>()

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
  <v-button
    v-if="state"
    :width="width"
    @click.prevent="$router.push({ name: 'Cart' })"
  >
    в корзину
  </v-button>
  <v-button v-else :width="width" :loading="loading" @click.prevent="add">
    <CartSVG width="16" fill="#fff" class="mr-2" /> купить
  </v-button>
</template>
