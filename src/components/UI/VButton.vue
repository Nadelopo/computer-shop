<script setup lang="ts">
import type { ButtonHTMLAttributes } from 'vue'
import VLoader from './VLoader.vue'

interface Props extends /* @vue-ignore */ ButtonHTMLAttributes {
  variant?: 'primary' | 'danger' | 'noactive'
  loading?: boolean
  width?: string
  size?: 'normal' | 'small'
  static?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  width: '100px',
  loading: false,
  size: 'normal'
})
</script>

<template>
  <button
    v-wave
    class="btn"
    :class="[
      {
        danger: variant === 'danger',
        noactive: variant === 'noactive',
        static
      },
      size
    ]"
  >
    <template v-if="loading">
      <v-loader :color="variant === 'danger' && '#f96464'" />
    </template>
    <template v-else>
      <slot />
    </template>
  </button>
</template>

<style scoped lang="sass">
.btn
  border: none
  border-radius: 4px
  padding: 0.375rem 0.75rem
  color: #fff
  cursor: pointer
  transition: transform .3s, background .3s
  display: inline-flex
  vertical-align: middle
  align-items: center
  justify-content: center
  outline: 2px solid transparent
  @media (width < 426px)
    font-size: 14px
  &:active:not(.static):not(:disabled)
    transform: scale(0.9)
  svg
    width: 24px
    @media (width < 426px)
      width: 16px
  &.small svg
    width: 16px
  &.static
    pointer-events: none
  &:disabled
    opacity: 0.5
    cursor: no-drop

.btn
  min-width: v-bind('props.width')
  background: var(--color-main)
  :slotted(svg)
    fill: #fff
  @media (hover: hover)
    &:hover:not(.static):not(:disabled)
      background: var(--color-sec)
  @media (hover: none)
    &:active:not(.static):not(:disabled)
      background: var(--color-sec)

  &:focus-visible
    outline: 2px solid var(--color-text)
  &.noactive
    border-radius: 4px
    padding: 0.375rem 0.75rem
    cursor: pointer
    transition: fill .3s, background .3s, transform .3s, color .3s
    display: inline-flex
    vertical-align: middle
    align-items: center
    justify-content: center
    color: var(--color-main)
    box-shadow: inset 0px 0px 0px 2px var(--color-main)
    background: transparent
    :slotted(svg)
      transition: fill .3s
      fill: var(--color-main)
    @media (hover: hover)
      &:hover:not(:disabled)
        :slotted(svg)
          fill: #fff
      &:hover:not(.static):not(:disabled)
        background: var(--color-sec)
        color: #fff
        box-shadow: inset 0px 0px 0px 2px var(--color-sec)
    @media (hover: none)
      &:active:not(.static):not(:disabled)
        :slotted(svg)
          fill: #fff
      &:active:not(.static):not(:disabled)
        background: var(--color-sec)
        color: #fff
        box-shadow: inset 0px 0px 0px 2px var(--color-sec)
  &.danger
    background: var(--danger)
    @media (hover: hover)
      &:hover:not(.static):not(:disabled)
        background: var(--danger-light)
    @media (hover: none)
      &:active:not(.static):not(:disabled)
        background: var(--danger-light)
    &:focus-visible
      outline: 2px solid #ffa3a3
</style>
