<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useProductsStore } from '@/stores/productsStore'
import { debounce } from '@/utils/debounce'
import VInputText from '../UI/VInputText.vue'
import { getAll } from '@/utils/queries/db'
import type { ProductRead } from '@/types/tables/products.types'

const { setProducts } = useProductsStore()

const route = useRoute()
const search = ref('')

const categoryId = Number(route.params.id)
const names = ref<string[]>([])

onBeforeMount(async () => {
  const data = await getAll<ProductRead, { name: string }>('products', {
    select: 'name'
  })
  if (data) {
    names.value = data.map((e) => e.name)
  }
})

const setSearch = debounce(500, async () => {
  let searchQueryValue = ''
  if (!search.value) return setProducts(categoryId, '')
  names.value.every((n) => {
    let arr = n.split(' ')
    for (let value of arr) {
      const condition = value.toLowerCase().includes(search.value.toLowerCase())
      if (condition) {
        searchQueryValue = value
        return false
      } else {
        searchQueryValue = '34jkfvm34'
      }
    }
    return true
  })
  setProducts(categoryId, searchQueryValue)
})
</script>

<template>
  <div>
    <v-input-text v-model="search" placeholder="поиск..." @input="setSearch" />
  </div>
</template>
