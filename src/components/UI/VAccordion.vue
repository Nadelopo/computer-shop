<script setup lang="ts">
import { onMounted, onUpdated, ref, watch } from 'vue'

interface Ichildrens {
  element: HTMLElement
  height: number
}

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  paddingTop: {
    type: Number,
    default: 5,
  },
  paddingBottom: {
    type: Number,
    default: 5,
  },
  transition: {
    type: Number,
    default: 0.3,
  },
})

const parent = ref()
const childrenns = ref<Ichildrens[]>([])

const isUpdate = ref(true)

const setChildrens = () => {
  const childs: HTMLElement[] = [...parent.value.children]

  childs.forEach(async (el) => {
    el.style.paddingTop = '0'
    el.style.paddingBottom = '0'
    childrenns.value.push({ element: el, height: el.scrollHeight })
  })
}

onMounted(() => setChildrens())

onUpdated(async () => {
  if (isUpdate.value && !childrenns.value.length) {
    setChildrens()
  }
  isUpdate.value = false
})

watch(
  () => props.visible,
  (cur) => {
    childrenns.value.forEach((element) => {
      const el = element.element
      if (cur) {
        const height = element.height + props.paddingTop + props.paddingBottom
        el.style.cssText = `
          padding-bottom: ${props.paddingBottom}px;
          padding-top: ${props.paddingTop}px;
          height:  ${height}px;
        `
      } else {
        el.style.cssText = `
        padding-bottom: 0;
        padding-top: 0;
        `
      }
    })
  }
)

const transition = props.transition + 's'
</script>

<template>
  <div
    ref="parent"
    class="accordion__daskk231fas2"
    :class="{ active: visible }"
  >
    <slot></slot>
  </div>
</template>

<style lang="sass">

.accordion__daskk231fas2
  visibility: hidden
  opacity: 0
  transition: v-bind(transition)
  div, button, a
    display: block
    transition: v-bind(transition)
    height: 0px
  &.active
    visibility: visible
    opacity: 1
</style>
