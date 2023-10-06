<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useCartStore } from '@/stores/cartStore'
import { VButton } from '@/components/UI'
import { CartInButtonSvg } from '@/assets/icons'

type Props = {
  productId: number
  width?: string
}

const props = withDefaults(defineProps<Props>(), {
  width: '122px'
})

const loading = ref(false)

const { addToCart } = useCartStore()
const { cartItems } = storeToRefs(useCartStore())

const product = cartItems.value.find((e) => e.productId === props.productId)

const isProductInCart = ref(product ? true : false)

const add = async () => {
  loading.value = true
  await addToCart(props.productId)
  loading.value = false
  isProductInCart.value = true
}
</script>

<template>
  <v-button
    :width="width"
    :loading="isProductInCart ? false : loading"
    @click.prevent="isProductInCart ? $router.push({ name: 'Cart' }) : add()"
  >
    <cart-in-button-svg width="16" fill="#fff" class="mr-2" />
    {{ isProductInCart ? 'в корзине' : 'купить' }}
  </v-button>
</template>
