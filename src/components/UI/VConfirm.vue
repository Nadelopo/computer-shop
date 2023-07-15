<script setup lang="ts">
import VModal from '@/components/UI/VModal.vue'
import VButton from './VButton.vue'
import { ref } from 'vue'

type Props = {
  label: string
  title: string
  message: string
  type?: 'primary' | 'danger' | 'noactive'
}

type Emit = {
  ok: []
  cancel: []
}

withDefaults(defineProps<Props>(), {
  type: 'primary'
})
const emit = defineEmits<Emit>()

const showModal = ref(false)

const onCancel = () => {
  showModal.value = false
  emit('cancel')
}

const onOk = () => {
  showModal.value = false
  emit('ok')
}
</script>

<template>
  <span @click="showModal = true">
    <v-button :variant="type" v-bind="$attrs"> {{ label }}</v-button>
  </span>
  <v-modal v-model="showModal">
    <div class="confirm">
      <div class="label">{{ title }}</div>
      <div class="message">{{ message }}</div>
      <div class="buttons">
        <v-button variant="noactive" @click="onCancel">отменить</v-button>
        <v-button @click="onOk">подтвердить</v-button>
      </div>
    </div>
  </v-modal>
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
  gap: 4px
  padding: 8px
  margin-left: auto
  button:first-child
    margin-left: auto
</style>
