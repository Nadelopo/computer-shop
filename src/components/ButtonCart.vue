<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useCartStore } from '@/stores/cartStore'
import { VButton } from '@/components/UI'
import { CartInButtonSvg, InCartSvg } from '@/assets/icons'

type Props = {
  productId: number
  width?: string
  watch?: boolean
  size?: 'normal' | 'small'
}

const props = withDefaults(defineProps<Props>(), {
  width: '122px',
  size: 'normal'
})

const loading = ref(false)

const { addToCart } = useCartStore()
const { cartItems } = storeToRefs(useCartStore())

const product = cartItems.value.find((e) => e.productId === props.productId)

const isProductInCart = ref(product ? true : false)
if (props.watch) {
  watch(
    () => props.productId,
    (productId) => {
      isProductInCart.value = Boolean(
        cartItems.value.find((e) => e.productId === productId)
      )
    }
  )
}

const add = async () => {
  loading.value = true
  await addToCart(props.productId)
  loading.value = false
  isProductInCart.value = true
}

const width = computed(() => {
  return props.size === 'small' ? 'auto' : props.width
})

const icon = computed(() =>
  isProductInCart.value ? InCartSvg : CartInButtonSvg
)
</script>

<template>
  <v-button
    :width="width"
    :loading="isProductInCart ? false : loading"
    :size="size"
    @click.prevent="isProductInCart ? $router.push({ name: 'Cart' }) : add()"
  >
    <component
      :is="icon"
      width="16"
      fill="#fff"
      :class="{ 'mr-2': size === 'normal' }"
    />
    <template v-if="size === 'normal'">
      {{ isProductInCart ? 'в корзине' : 'купить' }}
    </template>
  </v-button>
</template>
