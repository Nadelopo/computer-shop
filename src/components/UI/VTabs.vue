<script setup lang="ts">
import { nextTick, ref, watch, type ComponentPublicInstance } from 'vue'
import { useRoute } from 'vue-router'

type Option = {
  title: string
  value: string | number
  count?: number
}

const modelValue = defineModel<number | string | null>()

const props = defineProps<{
  options: Option[]
  onClick?: () => void
  queryParamName?: string
}>()

const tabsRefs = ref<ComponentPublicInstance[]>([])

const tabLineStyles = ref({
  width: '0px',
  marginLeft: '0px'
})

const setTab = async () => {
  await nextTick()
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
}
</script>

<template>
  <div class="tabs">
    <router-link
      v-for="option in options"
      :key="option.value"
      ref="tabsRefs"
      :to="{
        query: props.queryParamName
          ? { [props.queryParamName]: option.value }
          : { ...useRoute().query }
      }"
      :class="{ active: option.value === modelValue }"
      class="tab"
      @click="clickOnTab(option.value)"
    >
      <div class="link">
        {{ option.title }} <span class="ml-2">{{ option.count }}</span>
      </div>
    </router-link>
  </div>
</template>

<style scoped lang="sass">

.tabs
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
        color: var(--color-text)
      &.active
        color: var(--color-text)
        font-weight: 700
      .link
        margin-right: 20px
</style>
