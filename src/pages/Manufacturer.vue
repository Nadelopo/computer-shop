<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { supabase } from '@/db/supabase'
import { getAll } from '@/db/queries/tables'
import { useManufacturersStore } from '@/stores/manufacturersStore'
import CategoriesList from '@/components/Manufacturer/CategoriesList.vue'
import BestProductsList from '@/components/Manufacturer/BestProductsList.vue'
import { VLoader } from '@/components/UI'
import type { View } from '@/types/database.types'
import type { Loading } from '@/types'
import type { ProductCardData } from '@/components/ProductCard/types'

const { manufacturers } = storeToRefs(useManufacturersStore())
const route = useRoute()
const manufacturerId = Number(route.params.id)
const manufacturer = computed(() =>
  manufacturers.value.find((m) => m.id === manufacturerId)
)

const loading = ref<Loading>('loading')
const categories = ref<View<'distinct_categories'>[]>()
const bestProducts = ref<ProductCardData[]>([])
onBeforeMount(async () => {
  const data = await Promise.all([
    supabase.from('distinct_categories').select().match({ manufacturerId }),
    getAll('products', {
      match: {
        manufacturerId
      },
      select:
        'id, img, discount, price, priceWithoutDiscount, title, rating, quantity, categories(id, enTitle)',
      gt: ['discount', 0]
    })
  ])
  if (data[0].error || data[1].error) {
    loading.value = 'error'
    return
  }

  categories.value = data[0].data
  bestProducts.value = data[1].data
  loading.value = 'success'
})
</script>

<template>
  <div class="container">
    <template v-if="manufacturer">
      <div class="flex justify-center mt-4 h-10">
        <img
          class="max-h-10"
          :src="manufacturer.img"
          alt="..."
        />
      </div>
      <div class="my-8 text-lg bg-white rounded-lg p-4 shadow text-justify">
        {{ manufacturer.description }}
      </div>
    </template>
    <div
      v-else
      class="h-40 flex"
    >
      <v-loader />
    </div>
    <categories-list
      :categories="categories"
      :loading="loading"
      class="mb-8"
    />
    <best-products-list
      :products="bestProducts"
      :loading="loading"
    />
  </div>
</template>
