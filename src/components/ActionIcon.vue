<script
  setup
  lang="ts"
  generic="To extends RouteName, Tag extends 'button' | 'a' = 'button'"
>
import { computed, type FunctionalComponent, type SVGAttributes } from 'vue'
import AppLink from './AppLink.vue'
import { VLoader } from './UI'
import type { RouteName } from '@/router/types'
import type { RouterTo } from '@/utils/customRouter'

type Props = {
  variant?: 'primary' | 'danger' | 'default'
  svg: FunctionalComponent<SVGAttributes>
  paintType?: 'stroke' | 'fill'
  tooltip?: string
  svgAttrs?: SVGAttributes
  isActive?: boolean
  loading?: boolean
  tag?: Tag
  to?: Tag extends 'a' ? RouterTo<To> : undefined
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  svgType: 'fill',
  tag: 'button' as any
})

const variantLoader = computed(() => {
  if (props.variant === 'primary') {
    return 'var(--main)'
  }
  if (props.variant === 'danger') {
    return 'var(--danger)'
  }
  return 'var(--back-sec)'
})
const widthWithHeight = computed(() => ({
  width: props.svgAttrs?.width ?? '24px',
  height: props.svgAttrs?.height
}))

const is = computed(() => (props.tag === 'button' ? 'button' : AppLink))
</script>

<template>
  <component
    :is="is"
    v-bind="props.tag === 'a' ? { to } : {}"
    v-tooltip="tooltip"
    type="button"
    class="action-icon"
    :class="[variant, paintType, isActive && 'active']"
  >
    <v-loader
      v-if="loading"
      :style="widthWithHeight"
      :color="variantLoader"
    />
    <component
      :is="svg"
      v-else
      :style="widthWithHeight"
      v-bind="svgAttrs"
    />
    <slot />
  </component>
</template>

<style scoped lang="sass">
@mixin mymixin($selector, $bg: false,$active: false)
  $danger: var(--danger-semi-light)
  $main: var(--main-semi-light)
  $default: var(--gray)
  @if $active
    $danger: var(--danger)
    $main: var(--main)
    $default: #fff
  #{$selector}
    &.primary
      @if $bg
        background: var(--main-light)
      svg
        fill: $main
      &.stroke svg
        stroke: $main
        fill: none
      &:focus-visible
        outline: $main 2px solid
    &.danger
      @if $bg
        background: var(--danger-light)
      svg
        fill: $danger
      &.stroke svg
        stroke: $danger
        fill: none
      &:focus-visible
        outline: $danger 2px solid
    &.default
      @if $bg
        background: var(--back-sec)
      svg
        fill: $default
      &.stroke svg
        stroke: $default
        fill: none

.action-icon
  transition: background .2s
  border-radius: 4px
  padding: 8px
  cursor: pointer
  svg
    transition: .2s
    fill: var(--gray)
  &.stroke svg
    stroke: var(--gray)
    fill: none
  &:focus-visible
    outline: var(--gray) 2px solid
  @include mymixin("&:hover", true)
  @include mymixin("&.active", false, true)
</style>
