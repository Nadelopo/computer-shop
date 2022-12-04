<script setup lang="ts">
import InputText from '../UI/InputText.vue'
import { useProductsStore } from '@/stores/productsStore'
import { onBeforeMount, ref } from 'vue'
import { debounce } from '@/utils/debounce'
import { useRoute } from 'vue-router'
import { getAll } from '@/utils/dbQueries'

const { getProducts } = useProductsStore()

const route = useRoute()
const search = ref('')

const categoryId = Number(route.params.id)
const names = ref<string[]>([])

const setSearch = debounce(500, async () => {
  let searchQueryValue = ''
  if (!search.value) return getProducts(categoryId, '')
  names.value.every((n) => {
    let arr = n.split(' ')
    for (let value of arr) {
      const condition = value
        .toLowerCase()
        .includes(search.value.toLowerCase().slice(0, -1))
      if (condition) {
        searchQueryValue = value
        return false
      } else {
        searchQueryValue = '34jkfvm34'
      }
    }
    return true
  })
  getProducts(categoryId, searchQueryValue)
})

onBeforeMount(async () => {
  const { data } = await getAll<{ name: string }>('products', 'id', 'name')
  if (data) {
    names.value = data.map((e) => e.name)
  }
})
</script>

<template>
  <div>
    <InputText v-model="search" placeholder="поиск..." @input="setSearch" />
  </div>
</template>
