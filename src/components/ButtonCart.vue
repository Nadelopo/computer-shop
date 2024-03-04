<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useCartStore } from '@/stores/cartStore'
import { VButton } from '@/components/UI'
import { CartInButtonSvg, InCartSvg, AbsentForCart } from '@/assets/icons'

type Props = {
  productId: number
  quantity: number
  width?: string
  size?: 'normal' | 'small'
}

const props = withDefaults(defineProps<Props>(), {
  width: '128px',
  size: 'normal'
})

const loading = ref(false)

const { addToCart } = useCartStore()
const { cartItems } = storeToRefs(useCartStore())

const productStatus = computed((): 'in' | 'outside' | 'absent' => {
  if (props.quantity <= 0) return 'absent'
  return cartItems.value.find((e) => e.productId === props.productId)
    ? 'in'
    : 'outside'
})

const add = async () => {
  if (productStatus.value === 'absent') return
  loading.value = true
  await addToCart(props.productId)
  loading.value = false
}

const width = computed(() => {
  return props.size === 'small' ? 'auto' : props.width
})

const icon = computed(() => {
  if (productStatus.value === 'in') return CartInButtonSvg
  if (productStatus.value === 'outside') return InCartSvg
  return AbsentForCart
})

const buttonText = computed(() => {
  if (productStatus.value === 'in') return 'в корзине'
  if (productStatus.value === 'outside') return 'купить'
  return 'отсутсвует'
})
</script>

<template>
  <v-button
    :width="width"
    :loading="loading"
    :size="size"
    :variant="productStatus === 'absent' ? 'noactive' : 'primary'"
    @click.prevent="
      productStatus === 'in' ? $router.push({ name: 'Cart' }) : add()
    "
  >
    <component
      :is="icon"
      width="16"
      fill="#fff"
      :class="{ 'mr-2': size === 'normal' }"
    />
    <template v-if="size === 'normal'">
      {{ buttonText }}
    </template>
  </v-button>
</template>
