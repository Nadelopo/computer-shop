<script setup lang="ts">
import { nextTick, ref, watch, type ComponentPublicInstance } from 'vue'
import type { Category, CurrentCategory } from './types'

const props = defineProps<{
  categories: Category[]
  currentCategory: CurrentCategory
}>()

const categoriesRefs = ref<ComponentPublicInstance[]>([])

const categoryLineStyles = ref({
  width: '0px',
  marginLeft: '0px'
})

const setCategory = async () => {
  await nextTick()
  const categoryIndex = props.categories.findIndex(
    (e) => e.id === props.currentCategory.id
  )
  const el = categoriesRefs.value[categoryIndex].$el
  if (el.offsetLeft > parseInt(categoryLineStyles.value.marginLeft)) {
    categoryLineStyles.value.width = `${
      el.scrollWidth +
      el.offsetLeft -
      parseInt(categoryLineStyles.value.marginLeft)
    }px`
  } else {
    categoryLineStyles.value.width = `${
      parseInt(categoryLineStyles.value.width) +
      parseInt(categoryLineStyles.value.marginLeft) -
      el.offsetLeft
    }px`
    categoryLineStyles.value.marginLeft = `${el.offsetLeft}px`
  }
  setTimeout(() => {
    categoryLineStyles.value.marginLeft = `${el.offsetLeft}px`
    categoryLineStyles.value.width = `${el.scrollWidth}px`
  }, 200)
}

watch(() => props.currentCategory, setCategory, {
  immediate: true
})
</script>

<template>
  <div class="categories">
    <router-link
      v-for="category in categories"
      :key="category.id"
      ref="categoriesRefs"
      :to="{ query: { category_id: category.id } }"
      class="tab"
      :class="{ active: category.id === currentCategory.id }"
    >
      <div class="link">
        {{ category.title }} <span class="ml-2">{{ category.count }}</span>
      </div>
    </router-link>
  </div>
</template>

<style scoped lang="sass">

.categories
  display: flex
  position: relative
  margin-bottom: 20px
  &::before, &::after
    border-bottom: 2px solid #dfdfe1
    bottom: 0
    content: ""
    left: 0
    position: absolute
    width: 100%
    z-index: 1
  &::after
    transition: .2s
    border-bottom: 2px solid var(--color-text)
    width: v-bind('categoryLineStyles.width')
    margin-left: v-bind('categoryLineStyles.marginLeft')
  .tab
      font-size: 18px
      text-transform: capitalize
      position: relative
      padding-bottom: 12px
      cursor: pointer
      z-index: 1
      &.active
        color: var(--color-text)
        font-weight: 700
      .link
        margin-right: 20px
</style>
