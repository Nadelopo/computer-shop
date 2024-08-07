<script setup lang="ts">
import { computed, FunctionalComponent, SVGAttributes } from 'vue'
import { VLoader } from './UI'

type Props = {
  variant?: 'primary' | 'danger' | 'default'
  svg: FunctionalComponent<SVGAttributes>
  paintType?: 'stroke' | 'fill'
  tooltip?: string
  svgAttrs?: SVGAttributes
  isActive?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  svgType: 'fill'
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
</script>

<template>
  <button
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
  </button>
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
