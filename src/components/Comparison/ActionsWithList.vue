<script setup lang="ts">
import { nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/userStore'
import { updateOneById } from '@/db/queries/tables'
import { useLocalStorage } from '@/utils/localStorage'
import { VButton, VCheckbox } from '../UI'
import { TrashSvg, ShareSvg } from '@/assets/icons'
import type { Category, ComparisonProduct } from './types'
import type { Loading } from '@/types'

const { userLists } = useUserStore()
const { user } = storeToRefs(useUserStore())

const showDifferences = defineModel<boolean>({ required: true })
const products = defineModel<ComparisonProduct[]>('products', {
  required: true
})
const currentCategoryId = defineModel<number | null>('currentCategoryId', {
  required: true
})
const categories = defineModel<Category[]>('categories', { required: true })

const emit = defineEmits<{
  updateLoading: [Loading]
}>()

const router = useRouter()
const clearList = async () => {
  const remainProducts = products.value.filter(
    (e) => e.categoryId !== currentCategoryId.value
  )
  const remainProductIds = remainProducts.map((e) => e.id)

  if (user.value) {
    const { data, error } = await updateOneById('users', user.value.id, {
      comparison: remainProductIds
    })
    if (error) {
      emit('updateLoading', 'error')
      return
    }
    userLists.comparison = data.comparison
  } else {
    useLocalStorage('compareList').set(remainProductIds)
    userLists.comparison = remainProductIds
  }

  products.value = remainProducts
  categories.value = categories.value.filter(
    (e) => e.id !== currentCategoryId.value
  )
  await nextTick()

  currentCategoryId.value = remainProducts.length
    ? categories.value[0].id
    : null
  await nextTick()

  let query = {}
  if (currentCategoryId.value) {
    query = { category_id: String(currentCategoryId.value) }
  }
  router.push({ query })
  emit('updateLoading', products.value.length ? 'success' : 'empty')
}

const route = useRoute()
const share = () => {
  let href = window.location.origin + route.path
  const categoryProducts = products.value.filter(
    (e) => e.categoryId === currentCategoryId.value
  )
  href = href + '?ids=' + categoryProducts.map((e) => e.id).join(' ')
  navigator.clipboard.writeText(encodeURI(href))
}
</script>

<template>
  <div class="compare__actions">
    <div class="clear">
      <v-button
        variant="noactive"
        @click="clearList"
      >
        <trash-svg />
        очистить список
      </v-button>
    </div>
    <div>
      <v-checkbox
        :id="1"
        v-model="showDifferences"
        value="Показывать только отличия"
      />
    </div>
    <div class="share">
      <v-button
        variant="noactive"
        @click="share"
      >
        <share-svg
          fill="#fff"
          class="mr-2"
        />
        поделиться списком
      </v-button>
    </div>
  </div>
</template>

<style scoped lang="sass">
.compare__actions
  display: grid
  grid-template-columns: auto auto 1fr
  grid-template-areas: "clear . share"
  gap: 16px
  align-items: center
  margin-bottom: 16px
  @media (width < 768px)
    grid-template-columns: none
    grid-template-rows: repeat(3, auto)
    grid-template-areas:  "." "clear" "share"
  .clear
    grid-area: clear
  .share
    grid-area: share
    margin-left: auto
    @media (width < 768px)
      margin-right: auto
      margin-left: 0
</style>
