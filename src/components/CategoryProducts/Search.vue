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
  names.value.forEach((n) => {
    const arr = n.split(' ')
    for (let i = 0; i < arr.length; i++) {
      if (
        arr[i].toLowerCase().includes(search.value.toLowerCase()) &&
        search.value.length < arr[i].length + 2
      ) {
        console.log(arr[i])
        searchQueryValue = arr[i]
        break
      } else {
        searchQueryValue = '34jkfvm34'
      }
    }
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
