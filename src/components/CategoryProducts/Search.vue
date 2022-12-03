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
    let stop = false
    let arr = n.split(' ')
    for (let i = 0; i < arr.length; i++) {
      console.log(
        arr[i],
        arr[i].toLowerCase().includes(search.value.toLowerCase())
      )
      if (
        arr[i].toLowerCase().includes(search.value.toLowerCase()) &&
        search.value.length < arr[i].length + 2
      ) {
        searchQueryValue = arr[i]
        stop = true
        break
      } else {
        searchQueryValue = '34jkfvm34'
      }
    }
    if (stop) return false
    else return true
  })
  console.log(searchQueryValue)
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
