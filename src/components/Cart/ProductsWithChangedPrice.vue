<script setup lang="ts">
import { supabase } from '@/db/supabase'
import { formatPrice } from '@/utils/formatPrice'
import { VButton } from '../UI'
import type { ProductCart } from '@/stores/cartStore'

const props = defineProps<{
  products: ProductCart[]
}>()

const emit = defineEmits<{
  close: []
}>()

const markNotice = () => {
  supabase
    .from('cart')
    .update({ isPriceChanged: false })
    .in(
      'id',
      props.products.map((e) => e.cartItemId)
    )
    .select()
    .then()
  emit('close')
}
</script>

<template>
  <div
    class="rounded-lg border bg-card text-card-foreground shadow-sm w-full max-w-md p-4"
    data-v0-t="card"
  >
    <div class="px-2">
      <div class="text-3xl font-bold mb-10">
        Цены следующих товаров была изменена:
      </div>
      <div class="grid gap-8">
        <div
          v-for="product in products"
          :key="product.id"
          class="grid gap-2.5 md:gap-3 relative group"
        >
          <div class="grid gap-2 text-base leading-none">
            <div class="flex items-center gap-4">
              <h3 class="font-semibold">{{ product.title }}</h3>
              <h4 class="font-semibold ml-auto">
                {{ formatPrice(product.price) }}
              </h4>
            </div>
          </div>
          <img
            :src="product.img[0]"
            alt="Autumn Mug"
            width="120"
            height="120"
            class="rounded-[4px] object-cover w-24 aspect-square"
          />
        </div>
      </div>
      <div class="flex justify-end gap-4 mt-4">
        <v-button @click="markNotice">ок</v-button>
        <v-button
          variant="danger"
          @click="emit('close')"
        >
          закрыть
        </v-button>
      </div>
    </div>
  </div>
</template>
