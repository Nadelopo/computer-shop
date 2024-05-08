<script setup lang="ts">
import { computed, FunctionalComponent, SVGAttributes } from 'vue'
import { VLoader } from './UI'

type Props = {
  variant?: 'primary' | 'danger'
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

const variantLoader = computed(() =>
  props.variant === 'primary' ? 'var(--main)' : 'var(--danger)'
)
</script>

<template>
  <button
    v-tooltip="tooltip"
    class="action-icon"
    :class="[variant, paintType, isActive && 'active']"
  >
    <v-loader
      v-if="loading"
      :style="{ width: svgAttrs?.width ?? 24, height: svgAttrs?.height }"
      :color="variantLoader"
    />
    <component
      :is="svg"
      v-else
      v-bind="svgAttrs"
    />
  </button>
</template>

<style scoped lang="sass">
@mixin mymixin($selector, $bg: false,$active: false)
  $danger: var(--danger-semi-light)
  $main: var(--main-semi-light)
  @if $active
    $danger: var(--danger)
    $main: var(--main)
  #{$selector}
    &.primary
      @if $bg
        background: var(--main-light)
      svg
        fill: $main
      &.stroke svg
        stroke: $main
        fill: none
    &.danger
      @if $bg
        background: var(--danger-light)
      svg
        fill: $danger
      &.stroke svg
        stroke: $danger
        fill: none

.action-icon
  transition: .2s
  border-radius: 4px
  padding: 8px
  cursor: pointer
  svg
    transition: .2s
    fill: var(--gray)
  &.stroke svg
    stroke: var(--gray)
    fill: none
  @include mymixin("&:hover", true)
  @include mymixin("&.active", false, true)
</style>
