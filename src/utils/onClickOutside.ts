import { onUnmounted, type Ref, onMounted } from 'vue'

export const onClickOutside = (
  element: Ref<HTMLElement | undefined>,
  func: () => void
) => {
  onMounted(() => {
    setTimeout(() => {
      window.addEventListener('click', func)
    })
  })
  onUnmounted(() => {
    window.removeEventListener('click', func)
  })
}
