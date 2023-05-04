import { onUnmounted, type Ref, onMounted } from 'vue'

export const onClickOutside = (
  element: Ref<HTMLElement | undefined>,
  func: () => void
) => {
  const click = (e: Event) => {
    if (element.value && !e.composedPath().includes(element.value)) {
      func()
    }
  }

  onMounted(() => {
    setTimeout(() => {
      window.addEventListener('click', click)
    })
  })
  onUnmounted(() => {
    window.removeEventListener('click', click)
  })
}
