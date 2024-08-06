<script setup lang="ts">
import { computed, nextTick, ref, watch, watchEffect } from 'vue'
import { storeToRefs } from 'pinia'
import { supabase } from '@/db/supabase'
import { getAll, updateManyById } from '@/db/queries/tables'
import { getOrFilterForSearch } from '@/utils/getOrFilterForSearch'
import { useCustomRoute } from '@/utils/customRouter'
import { useLocalStorage } from '@/utils/localStorage'
import { useCategoriesStore } from '@/stores/categoriesStore'
import {
  VButton,
  VButtons,
  VCheckbox,
  VInputText,
  VPopup
} from '@/components/UI'
import type { Loading } from '@/types'
import type { ProductQuantityInStoreCreate } from '@/types/tables/ProductQuantityInStores'

type Product = {
  title: string
  value: number
  endIndex?: number
  startIndex?: number
}

const emit = defineEmits<{
  loadProducts: []
}>()

const { categories } = storeToRefs(useCategoriesStore())

const open = ref(true)
const add = async () => {
  open.value = !open.value
}

const selectedCategories = ref<number[]>([])
const categoriesOptions = computed(() =>
  categories.value.map(({ id, title }) => ({ value: id, title }))
)

const searchValue = ref('')
const products = ref<Product[]>([])
const loadignProducts = ref<Loading>('success')

const loadProducts = async () => {
  loadignProducts.value = 'loading'
  const { data, error } = await getAll('products', {
    select: 'id, title',
    in: { categoryId: selectedCategories.value },
    or: isOnlyMatchingValues.value
      ? undefined
      : [getOrFilterForSearch(searchValue.value, 'title')],
    order: ['categoryId']
  })
  if (error) return
  products.value = data.map((e) => ({ title: e.title, value: e.id }))
  loadignProducts.value = data.length ? 'success' : 'empty'
}
watch(() => selectedCategories.value, loadProducts)

const highlightSearchTerm = async () => {
  await nextTick()
  if (!isOnlyMatchingValues.value) return
  products.value = products.value.map(({ value, title }) => {
    const startIndex = title
      .toLocaleLowerCase()
      .indexOf(searchValue.value.toLocaleLowerCase())
    const endIndex = startIndex + searchValue.value.length
    return { title, value, endIndex, startIndex }
  })
}

const selectedProducts = ref<number[]>([])
const storage = useLocalStorage<boolean>('admin.shop.matchingValues', {})
const isOnlyMatchingValues = ref(storage.get() ?? false)
watchEffect(() => {
  storage.set(isOnlyMatchingValues.value)
})

const search = () => {
  if (isOnlyMatchingValues.value) return
  loadProducts()
}

const route = useCustomRoute('AdminShopDetails')
const productsInShop = ref<
  (ProductQuantityInStoreCreate & { title?: string })[]
>([])
const setProductsInStore = () => {
  productsInShop.value = selectedProducts.value.map((id) => {
    return {
      productId: id,
      quantity: 0,
      shopId: Number(route.params.id),
      title: products.value.find((product) => product.value === id)?.title
    }
  })
}

const loadingCrete = ref<Loading>('success')
const setQuantityProductsInShops = async () => {
  if (!productsInShop.value.length) return
  loadingCrete.value = 'loading'
  const { data: products } = await getAll('product_quantity_in_stores', {
    in: { shopId: productsInShop.value.map((e) => e.shopId) }
  })
  console.log(products, productsInShop.value)
  const forUpdate: { id: number; quantity: number }[] = []
  const forCreate: ProductQuantityInStoreCreate[] = []
  for (const product of productsInShop.value) {
    const foundProduct = products?.find(
      (e) => e.productId === product.productId
    )
    if (foundProduct) {
      forUpdate.push({
        id: foundProduct.id,
        quantity: foundProduct.quantity + product.quantity
      })
    } else {
      // eslint-disable-next-line
      const { title, ...v } = product
      forCreate.push(v)
    }
  }
  await Promise.all([
    updateManyById('product_quantity_in_stores', forUpdate),
    supabase.from('product_quantity_in_stores').insert(forCreate)
  ])

  productsInShop.value = []
  loadingCrete.value = 'success'
  emit('loadProducts')
}
</script>

<template>
  <div>
    <v-button @click="add">{{ open ? 'Закрыть' : 'Добавить товар' }}</v-button>
  </div>
  <template v-if="open">
    <v-buttons
      v-model="selectedCategories"
      :options="categoriesOptions"
      :loading="loadignProducts === 'loading'"
      width="170px"
    />
    <div class="flex gap-4">
      <v-input-text
        v-model="searchValue"
        class="mb-4 w-full"
        @keyup.enter="search"
        @search="search"
        @clear=";(searchValue = ''), loadProducts()"
        @input="highlightSearchTerm"
      />
      <v-popup float="start">
        <template #active>
          <button class="dots">
            <div class="dot" />
            <div class="dot" />
            <div class="dot" />
          </button>
        </template>
        <template #content>
          <v-checkbox
            v-model="isOnlyMatchingValues"
            title="Только посдветка совподающих значений"
          />
        </template>
      </v-popup>
    </div>
    <v-buttons
      v-if="products.length"
      v-model="selectedProducts"
      :options="products"
    >
      <template #default="{ title, startIndex, endIndex }">
        <div>
          <template
            v-if="
              isOnlyMatchingValues &&
              searchValue &&
              startIndex &&
              startIndex !== -1
            "
          >
            <span>
              {{ title.slice(0, startIndex) }}
            </span>
            <span class="coloured">
              {{ title.slice(startIndex, endIndex) }}
            </span>
            <span>{{ title.slice(endIndex) }}</span>
          </template>
          <template v-else>
            {{ title }}
          </template>
        </div>
      </template>
    </v-buttons>
    <div @click="setProductsInStore">
      <v-button>Выбрать</v-button>
    </div>
    <div
      v-if="productsInShop.length"
      class="flex flex-col gap-2"
    >
      <div
        v-for="product in productsInShop"
        :key="product.productId"
        class="flex gap-2 items-end"
      >
        <v-input-text
          v-model="product.quantity"
          min="0"
          type="number"
          class="w-14"
        />
        <div>{{ product.title }}</div>
      </div>
    </div>
    <div>
      <v-button
        :loading="loadingCrete === 'loading'"
        @click="setQuantityProductsInShops"
      >
        Создать
      </v-button>
    </div>
  </template>
</template>

<style scoped lang="sass">

.dots
  display: flex
  flex-direction: column
  gap: 4px
  transition: .2s
  padding: 6px
  border-radius: 4px
  &:hover
    background: var(--gray)
  .dot
    border: 2px solid var(--back-sec)
    border-radius: 100%


.coloured
  color: var(--danger)
</style>
