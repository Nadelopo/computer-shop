<script setup lang="ts">
import { ref } from 'vue'
import { VModal, VButton } from '@/components/UI'

type Props = {
  label?: string
  message: string
  title?: string
  type?: 'primary' | 'danger' | 'noactive'
  width?: string
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  type: 'primary',
  title: 'Подтвердите действие'
})

const emit = defineEmits<{
  ok: []
  cancel: []
}>()

defineOptions({
  inheritAttrs: false
})

const showModal = ref(false)

const onCancel = () => {
  showModal.value = false
  emit('cancel')
}

const onOk = () => {
  showModal.value = false
  emit('ok')
}

const openModal = () => {
  showModal.value = true
}
</script>

<template>
  <VButton
    v-if="!$slots.default"
    :variant="type"
    :width="width"
    :loading="loading"
    v-bind="$attrs"
    @click="openModal"
  >
    {{ label }}
  </VButton>
  <slot
    v-else
    :open-modal
  />
  <VModal v-model="showModal">
    <div class="confirm">
      <div class="label">{{ title }}</div>
      <div class="message">{{ message }}</div>
      <div class="buttons">
        <VButton
          variant="noactive"
          @click="onCancel"
        >
          отменить
        </VButton>
        <VButton @click="onOk">подтвердить</VButton>
      </div>
    </div>
  </VModal>
</template>

<style scoped lang="sass">
.confirm
  background: var(--back-main)
  color: #e8e6e3
  border-radius: 4px
  width: 400px
  box-sizing: border-box
  .label
    padding: 16px
    font-size: 1.25rem
    font-weight: 500
    line-height: 2rem
  .message
    padding: 16px
    padding-top: 0
.buttons
  display: flex
  gap: 8px
  padding: 8px
  margin-left: auto
  button:first-child
    margin-left: auto
</style>
