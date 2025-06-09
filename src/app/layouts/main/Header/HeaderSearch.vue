<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCustomRouter } from '@/shared/composables/customRouter'
import { getRouteToProduct } from '../../../../modules/products/utils/getRouteToProduct'
import { VInputText } from '@/components/UI'
import type { ProductSuggestion } from '@/modules/products/model/products.types'

const props = defineProps<{
  suggestions: ProductSuggestion[]
  mobile?: boolean
}>()

const emit = defineEmits<{
  navigateToProduct: []
  clear: []
}>()

const search = defineModel<string>({ required: true })

watch(
  () => props.suggestions,
  () => {
    if (!isNavigateImmediately.value) return
    navigateToProduct()
  },
  { deep: true }
)

const inputRef = ref<HTMLElement>()

const router = useRouter()
const customROuter = useCustomRouter()
const isNavigateImmediately = ref(false)
const navigateToProduct = () => {
  isNavigateImmediately.value = true
  const suggestionsValue = props.suggestions
  if (search.value.replaceAll(' ', '') === '') return
  if (search.value[0] === '#') {
    const idNotFound =
      suggestionsValue.find((s) => s.id === Number(search.value.slice(1))) === undefined

    if (search.value.length === 1 || idNotFound) return
    if (!suggestionsValue[0]?.categories) return
    router.push({
      name: 'Product',
      params: {
        productId: suggestionsValue[0].id,
        category: suggestionsValue[0].categories.enTitle,
        categoryId: suggestionsValue[0].categories.id
      }
    })
  } else {
    const findedSuggestion = suggestionsValue.find((s) => s.title === search.value)
    if (findedSuggestion) {
      router.push(getRouteToProduct(findedSuggestion))
    } else {
      if (!props.suggestions[0]) return
      const suggestion = props.suggestions[0]
      if (suggestion.type === 'product') {
        customROuter.push({
          name: 'ProductCatalog',
          params: {
            id: suggestion.categories!.id,
            category: suggestion.categories!.enTitle
          },
          query: { q: search.value }
        })
      } else {
        customROuter.push({
          name: 'ProductCatalog',
          params: { id: suggestion.id, category: suggestion.enTitle! }
        })
      }
    }
  }

  emit('navigateToProduct')
  search.value = ''
  ;(document.activeElement as HTMLInputElement).blur()
  isNavigateImmediately.value = false
}

defineExpose({ ref: inputRef })
</script>

<template>
  <VInputText
    ref="inputRef"
    v-model="search"
    placeholder="Поиск по товарам"
    @keyup.enter="navigateToProduct"
    @clear=";(search = ''), emit('clear')"
    @search="navigateToProduct"
  />
</template>
