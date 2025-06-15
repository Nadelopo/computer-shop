import { onUnmounted, watchEffect, ref, type Ref } from 'vue'

export const onClickOutsideClose = (
  element: Ref<HTMLElement | undefined>
): Ref<boolean> => {
  const value = ref(false)
  const click = (e: Event) => {
    if (element.value && !e.composedPath().includes(element.value)) {
      value.value = false
    }
  }

  watchEffect(() => {
    const eventType = value.value ? 'addEventListener' : 'removeEventListener'
    window[eventType]('click', click)
  })

  onUnmounted(() => {
    window.removeEventListener('click', click)
  })
  return value
}
