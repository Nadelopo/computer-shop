import { type Ref, reactive, watchEffect } from 'vue'

//prettier-ignore
export type ArrowRef =  Ref<{
    swipeSlideByClick: (direction: 'next' | 'prev') => void;
} | undefined>

export const useAutoPlay = (
  arrowRef: ArrowRef,
  propsAutoplay: Ref<boolean | number>
) => {
  const autoplay = reactive({
    value: 0,
    stop() {
      if (!propsAutoplay.value) return
      clearInterval(this.value)
    },
    start() {
      if (!propsAutoplay.value) return
      this.stop()
      const timeInterval =
        typeof propsAutoplay.value === 'number' ? propsAutoplay.value : 5000
      this.value = window.setInterval(() => {
        arrowRef.value?.swipeSlideByClick('next')
      }, timeInterval)
    }
  })
  watchEffect(() => {
    if (propsAutoplay.value) autoplay.start()
    else autoplay.stop()
  })
  return { autoplay }
}
