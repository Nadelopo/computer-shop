import { type Ref, watchEffect } from 'vue'

//prettier-ignore
export type ArrowRef =  Ref<{
    swipeSlideByClick: (direction: 'next' | 'prev') => void;
} | undefined>

export const useFeatureAutoPlay = (
  arrowRef: ArrowRef,
  propsAutoplay: Ref<boolean | number>
) => {
  const autoplay = {
    value: 0,
    stop() {
      if (!propsAutoplay.value) return
      clearInterval(this.value)
    },
    start() {
      const propsAutoplayValue = propsAutoplay.value
      if (!propsAutoplayValue) return
      this.stop()
      const timeInterval =
        typeof propsAutoplayValue === 'number' ? propsAutoplayValue : 5000
      this.value = window.setInterval(() => {
        arrowRef.value?.swipeSlideByClick('next')
      }, timeInterval)
    }
  }
  watchEffect(() => {
    if (propsAutoplay.value) autoplay.start()
    else autoplay.stop()
  })
  return { autoplay }
}
