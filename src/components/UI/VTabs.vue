<script setup lang="ts">
import { nextTick, ref, watch, type ComponentPublicInstance } from 'vue'
import { useRoute } from 'vue-router'
import AppLink from '../AppLink.vue'

type Option = {
  title: string
  value: string | number
  count?: number
}

const props = defineProps<{
  options: Option[]
  onClick?: () => void
  queryParamName?: string
}>()

const modelValue = defineModel<number | string | null>({ required: true })

const route = useRoute()

const tabsRefs = ref<ComponentPublicInstance[]>([])
const tabLineStyles = ref({
  width: '0px',
  marginLeft: '0px'
})

const setTab = async () => {
  await nextTick()
  if (!props.options.length) {
    tabLineStyles.value.width = '0px'
    return
  }
  const tabIndex = props.options.findIndex((e) => e.value === modelValue.value)
  const el = tabsRefs.value[tabIndex].$el
  if (el.offsetLeft > parseInt(tabLineStyles.value.marginLeft)) {
    tabLineStyles.value.width = `${
      el.scrollWidth + el.offsetLeft - parseInt(tabLineStyles.value.marginLeft)
    }px`
  } else {
    tabLineStyles.value.width = `${
      parseInt(tabLineStyles.value.width) +
      parseInt(tabLineStyles.value.marginLeft) -
      el.offsetLeft
    }px`
    tabLineStyles.value.marginLeft = `${el.offsetLeft}px`
  }
  setTimeout(() => {
    tabLineStyles.value.marginLeft = `${el.offsetLeft}px`
    tabLineStyles.value.width = `${el.scrollWidth}px`
  }, 200)
}

watch(modelValue, setTab, {
  immediate: true
})

const clickOnTab = (value: number | string) => {
  modelValue.value = value
  props.onClick?.()
}
</script>

<template>
  <div class="tabs">
    <app-link
      v-for="option in options"
      :key="option.value"
      ref="tabsRefs"
      :to="{
        query: props.queryParamName
          ? { [props.queryParamName]: option.value }
          : { ...route.query }
      }"
      :class="{ active: option.value === modelValue }"
      class="tab"
      @click="clickOnTab(option.value)"
    >
      <div class="link">
        {{ option.title }} <span class="ml-2">{{ option.count }}</span>
      </div>
    </app-link>
  </div>
</template>

<style scoped lang="sass">

.tabs
  display: flex
  position: relative
  margin-bottom: 20px
  overflow-y: auto
  &::-webkit-scrollbar
    height: 6px
    opacity: 0
  &::-webkit-scrollbar-track
    border-radius: 0 0 8px 0
    opacity: 0
  &::-webkit-scrollbar-thumb
    background: #7b7b7b
    border-radius: 10px
    opacity: 0
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
    border-bottom: 2px solid var(--main-semi-light)
    width: v-bind('tabLineStyles.width')
    margin-left: v-bind('tabLineStyles.marginLeft')
  .tab
      font-size: 18px
      text-transform: capitalize
      position: relative
      padding-bottom: 12px
      cursor: pointer
      z-index: 1
      transition: color .3s
      &:hover
        color: var(--main-semi-light)
      &.active
        color: var(--main-semi-light)
        font-weight: 700
      .link
        white-space: nowrap
        margin-right: 20px
</style>
