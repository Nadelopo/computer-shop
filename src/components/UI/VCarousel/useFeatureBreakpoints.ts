import { useBreakpoints } from '@/utils/useBreakpoints'
import type { Ref } from 'vue'

type TailwindPoints = 1536 | 1280 | 1024 | 768 | 640

type CarouselBreakpointsOptions = {
  spaceBetween?: number
  slidesPerView?: number
}

export type CarouselBreakpoints = {
  [key in number]: CarouselBreakpointsOptions
} & Partial<Record<TailwindPoints, CarouselBreakpointsOptions>>

export const useFeatureBreakpoints = (
  propsBreakpoints: CarouselBreakpoints,
  options: {
    slidesPerView: {
      ref: Ref<number>
      default: Ref<number>
    }
    spaceBetween: {
      ref: Ref<number>
      default: Ref<number>
    }
  }
) => {
  const { breakpoints } = useBreakpoints(
    Object.values(propsBreakpoints).toReversed(),
    (current) => {
      const { slidesPerView, spaceBetween } = options
      if (current === 'noOne') {
        slidesPerView.ref.value = slidesPerView.default.value
        spaceBetween.ref.value = spaceBetween.default.value
        return
      }
      if (current.slidesPerView) {
        slidesPerView.ref.value = current.slidesPerView
      }
      if (current.spaceBetween) {
        spaceBetween.ref.value = current.spaceBetween
      }
    },
    { points: Object.keys(propsBreakpoints).map(Number).toReversed() }
  )
  return { breakpoints }
}
