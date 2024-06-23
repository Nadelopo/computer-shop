<script setup lang="ts">
import { ref } from 'vue'
import { ProductCart, useCartStore } from '@/stores/cartStore'
import { TrashSvg } from '@/assets/icons'
import { VInputText } from '../UI'

type Action = 'increase' | 'reduce' | 'delete'

const props = defineProps<{
  product: ProductCart
  productCount: number
}>()
const loading = ref(false)

const { setItemCount, deleteItem } = useCartStore()

const action = async (action: Action) => {
  loading.value = true
  const id = props.product.id
  if (action === 'reduce') {
    await setItemCount(id, props.product.count - 1, props.product.cartItemId)
  }
  if (action === 'increase') {
    await setItemCount(id, props.product.count + 1, props.product.cartItemId)
  }
  if (action === 'delete') {
    await deleteItem(id)
  }
  loading.value = false
}

const onChange = async (e: Event) => {
  loading.value = true
  const target = e.target as HTMLInputElement
  await setItemCount(
    props.product.id,
    target.valueAsNumber,
    props.product.cartItemId
  )
  loading.value = false
}
</script>

<template>
  <div class="actions">
    <div class="flex items-center gap-3">
      <button
        :disabled="loading"
        @click="action('reduce')"
      >
        <div class="quantity__control">
          <div class="horizontal" />
        </div>
      </button>
      <div class="w-7">
        <v-input-text
          class="text-center"
          text-placement="center"
          type="number"
          :show-spin-buttons="false"
          :max="product.quantity"
          min="0"
          :disabled="loading"
          :model-value="productCount"
          @focusout="onChange"
        />
      </div>
      <button
        :disabled="loading"
        @click="action('increase')"
      >
        <div class="quantity__control">
          <div class="vertical" />
          <div class="horizontal" />
        </div>
      </button>
    </div>
  </div>
  <div>
    <button
      :disabled="loading"
      class="disabled:opacity-50"
      @click="action('delete')"
    >
      <trash-svg fill="var(--gray)" />
    </button>
  </div>
</template>

<style scoped lang="sass">
.actions
  .vertical
    left: 6px
    height: 14px
    width: 2px
  .quantity__control
    position: relative
    height: 14px
    width: 14px
    overflow: hidden
    div
      position: absolute
      background: var(--gray)
      border-radius: 100px
    .horizontal
      top: 6px
      height: 2px
      width: 14px
</style>
