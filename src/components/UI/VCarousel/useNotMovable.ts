import { useMutationObserver } from '@vueuse/core'
import { computed, onMounted, ref, type Ref } from 'vue'

export const useNotMovable = (
  carouselSlidesRef: Ref<HTMLElement | undefined>,
  slidesPerView: Ref<number>
) => {
  const countItems = ref(0)
  const notMovable = computed(() => countItems.value <= slidesPerView.value)
  useMutationObserver(
    carouselSlidesRef,
    () => {
      countItems.value = carouselSlidesRef.value?.children.length ?? 0
    },
    {
      childList: true
    }
  )
  onMounted(() => {
    countItems.value = carouselSlidesRef.value?.children.length ?? 0
  })
  return notMovable
}
