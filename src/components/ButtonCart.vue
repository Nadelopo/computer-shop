<script setup lang="ts">
import { computed, ref, type ButtonHTMLAttributes } from 'vue'
import { storeToRefs } from 'pinia'
import { useCartStore } from '@/stores/cartStore'
import { VButton } from '@/components/UI'
import { CartInButtonSvg, InCartSvg, AbsentForCartSvg } from '@/assets/icons'

interface Props extends /* @vue-ignore */ ButtonHTMLAttributes {
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

const quantity = ref(props.quantity)

const productStatus = computed((): 'in' | 'outside' | 'absent' => {
  if (quantity.value <= 0) return 'absent'
  return cartItems.value.find((e) => e.productId === props.productId)
    ? 'in'
    : 'outside'
})

const add = async () => {
  if (productStatus.value === 'absent') return
  loading.value = true
  const { error } = await addToCart(props.productId)
  if (error === 'OutOfStock') {
    quantity.value = 0
  }
  loading.value = false
}

const width = computed(() => {
  return props.size === 'small' ? 'auto' : props.width
})

const icon = computed(() => {
  if (productStatus.value === 'in') return InCartSvg
  if (productStatus.value === 'outside') return CartInButtonSvg
  return AbsentForCartSvg
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
