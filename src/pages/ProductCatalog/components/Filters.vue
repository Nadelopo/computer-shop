<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useProductCatalogContext } from '../composables/useProductCatalogContext'
import { VButton } from '@/shared/components/UI'
import InputFilter from './InputFilter.vue'
import CheckboxFilter from './CheckboxFilter.vue'
import FilterListSkeleton from './FiltersSkeleton.vue'
import type { Loading } from '@/shared/types'

type Props = {
  loadingProperties: Loading
  type?: 'mobile' | 'desktop'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'desktop'
})

const emit = defineEmits<{
  apply: []
}>()

const {
  setQueryParams,
  productsPrice,
  warranty,
  manufacturer,
  specificationsValues,
  manufacturersVariants,
  clearFilters
} = useProductCatalogContext()

const visibilityFilters = ref<boolean[]>([])
const watcher = watch(
  () => specificationsValues.value.length,
  async () => {
    if (!specificationsValues.value.length) return
    visibilityFilters.value = Array(specificationsValues.value.length)
      .fill(null)
      .map((_, i) => specificationsValues.value[i].visible)
    await nextTick()
    watcher()
  },
  { immediate: true }
)

const filtersRef = ref<HTMLFormElement>()

let isScrollingDown = false
let prevSCrollY = window.scrollY
const setScrollPosition = () => {
  const currentScrollY = window.scrollY
  if (currentScrollY > prevSCrollY) {
    isScrollingDown = true
  } else {
    isScrollingDown = false
  }
  prevSCrollY = currentScrollY
}

// FIX refactor
const classes = ref('')
const onScroll = () => {
  if (props.type === 'mobile') return
  const filtersRefValue = filtersRef.value
  if (!filtersRefValue) return
  setScrollPosition()
  let isFiltersBottomVisible = false
  if (window.innerHeight > filtersRefValue.scrollHeight) {
    classes.value = 'sticky top-5'
    return
  }
  const isFiltersTopVisible = window.scrollY < filtersRefValue.offsetTop
  if (filtersRefValue.parentElement!.getBoundingClientRect().top > 0) {
    classes.value = 'relative'
    filtersRefValue.removeAttribute('style')
    return
  }
  const filtersBoundingRect = filtersRefValue.getBoundingClientRect()
  if (
    window.innerHeight + Math.abs(filtersBoundingRect.y) >
    filtersRefValue.scrollHeight
  ) {
    isFiltersBottomVisible = true
  } else {
    isFiltersBottomVisible = false
  }

  if (isScrollingDown) {
    if (
      isFiltersBottomVisible &&
      !isFiltersTopVisible &&
      !filtersRefValue.classList.contains('fixed')
    ) {
      filtersRefValue.removeAttribute('style')
      classes.value = 'fixed bottom-5'
    } else if (
      !filtersRefValue.classList.contains('absolute') &&
      !isFiltersBottomVisible
    ) {
      classes.value = 'absolute'
      filtersRefValue.style.top = `${window.scrollY + filtersBoundingRect.top}px`
    }
  } else {
    if (isFiltersTopVisible && !isFiltersBottomVisible) {
      filtersRefValue.removeAttribute('style')
      classes.value = 'fixed top-5'
    }
    if (
      isFiltersBottomVisible &&
      !isFiltersTopVisible &&
      !filtersRefValue.classList.contains('absolute')
    ) {
      classes.value = 'absolute'
      filtersRefValue.style.top = `${filtersBoundingRect.top + window.scrollY}px`
    }
  }
}

onMounted(() => {
  if (props.type === 'desktop') {
    window.addEventListener('scroll', onScroll)
  }
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <div class="lg:pb-[100px]">
    <form
      v-if="loadingProperties === 'success'"
      ref="filtersRef"
      class="filters"
      :class="[classes, type]"
      @submit.prevent="setQueryParams"
    >
      <InputFilter
        v-model:min-value="productsPrice.min.value"
        v-model:max-value="productsPrice.max.value"
        v-model:visibility="productsPrice.visibility.value"
        :max="productsPrice.maxStatic"
        :step="500"
        title="Цена"
      />

      <template
        v-for="(value, i) in specificationsValues"
        :key="value.id"
      >
        <InputFilter
          v-if="value.type === 'number'"
          v-model:min-value="value.minValue"
          v-model:max-value="value.maxValue"
          v-model:visibility="visibilityFilters[i]"
          :max="value.max"
          :min="value.min"
          :step="value.step"
          :title="value.title"
        />
        <CheckboxFilter
          v-else
          v-model="visibilityFilters[i]"
          v-model:values="value.values"
          :variants-values="value.variantsValues"
          :title="value.title"
        />
      </template>
      <CheckboxFilter
        v-model="manufacturer.visibility.value"
        v-model:values="manufacturer.values.value"
        :variants-values="manufacturersVariants"
        title="Производитель"
      />
      <InputFilter
        v-model:min-value="warranty.min.value"
        v-model:max-value="warranty.max.value"
        v-model:visibility="warranty.visibility.value"
        :max="warranty.maxStatic"
        :step="1"
        title="Гарантия"
      />
      <div class="py-2 px-4">
        <VButton
          class="mb-4"
          width="100%"
          type="submit"
          @click="emit('apply')"
        >
          применить
        </VButton>
        <VButton
          width="100%"
          @click="clearFilters"
        >
          сбросить
        </VButton>
      </div>
    </form>
    <div v-else-if="loadingProperties === 'loading'">
      <FilterListSkeleton />
    </div>
    <div v-else-if="loadingProperties === 'error'">ошибка</div>
  </div>
</template>

<style scoped lang="sass">
.filters
  width: 290px
  background-color: #fff
  overflow: hidden
  border-radius: 12px
  color: #000
  @media (width < 1280px)
    width: 260px
  &.mobile
    width: 100%
    overflow: visible
  :deep(.filter__head)
    @apply flex justify-between font-medium cursor-pointer select-none
    padding: 8px 16px
    transition: .2s
    border-radius: 4px
    &:hover, &.active
      color: var(--main-semi-light)
      svg
        fill: var(--main-semi-light)
    &:hover
      background: var(--main-light)
  :deep(.filter__content)
    padding: 0 16px
    > div
      margin: 12px 0
</style>
