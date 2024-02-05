<script setup lang="ts">
type Props = {
  title?: string
  striped?: boolean
  column?: boolean
  line?: boolean
  bordered?: boolean
  placement?: 'start' | 'center' | 'end'
}

const props = withDefaults(defineProps<Props>(), {
  striped: true,
  bordered: true,
  placement: 'start'
})
</script>

<template>
  <div
    class="table__container"
    :class="{
      striped,
      bordered: bordered && !column && !line,
      line,
      column
    }"
  >
    <div
      v-if="title"
      class="header"
    >
      {{ title }}
    </div>
    <div class="wrapper__one">
      <div class="wrappper__two">
        <table>
          <slot />
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped lang="sass">
$bg: rgba(250, 250, 252, 1)
$border: 1px solid rgba(239, 239, 245, 1)

.table__container
  width: 100%
  background-color: white
  &.striped
    :slotted(tr:nth-child(even))
      background: $bg
  &.bordered
    :slotted(th), :slotted(td)
      border: 1px solid rgba(239, 239, 245, 1)
  &.line
    :slotted(th), :slotted(td)
      border-top: $border
    &:last-child
      border-bottom: $border
  &.column
    :slotted(th), :slotted(td)
      border-right: $border
  .header
    padding: 20px 12px
    border: 1px solid rgba(239, 239, 245, 1)
    border-bottom: unset
    font-size: 28px
    font-weight: 500
  .wrapper__one
    display: table
    table-layout: fixed
    width: 100%
  .wrappper__two
    display: table-cell
    overflow-x: auto
    width: 100%
    &::-webkit-scrollbar
      height: 10px
    &::-webkit-scrollbar-thumb
      background: #7b7b7b
      border-radius: 10px
    table
      width: 100%
      border-collapse: collapse
      border: $border
      text-align: v-bind('props.placement')
      :slotted(th)
        background: $bg
        white-space: nowrap
        font-weight: 500
        text-align: v-bind('props.placement')
      :slotted(th), :slotted(td)
        padding: 12px
</style>
