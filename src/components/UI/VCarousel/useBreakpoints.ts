import { useMediaQuery } from '@vueuse/core'
import { type Ref, reactive, watch } from 'vue'

type Breakpoints = {
  point: string
  mediaQuery: Ref<boolean>
}

export type PropsBreakpoints = {
  [key: number]: {
    spaceBetween?: number
    slidesPerView?: number
  }
}

export const useBreakpoints = (
  propsBreakpoints: PropsBreakpoints,
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
  const breakpoints: Breakpoints[] = reactive([])

  watch(
    () => breakpoints.map((e) => e.mediaQuery),
    () => {
      const { slidesPerView, spaceBetween } = options
      for (const item of breakpoints) {
        if (item.mediaQuery) {
          const point = propsBreakpoints[Number(item.point)]
          if (point.slidesPerView) {
            slidesPerView.ref.value = point.slidesPerView
          }
          if (point.spaceBetween) {
            spaceBetween.ref.value = point.spaceBetween
          }
        }
      }
      if (breakpoints.every((e) => !e.mediaQuery)) {
        slidesPerView.ref.value = slidesPerView.default.value
        spaceBetween.ref.value = spaceBetween.default.value
      }
    }
  )

  const points = Object.keys(propsBreakpoints)
  if (points.length) {
    for (const point of points) {
      const media = useMediaQuery(`(width < ${point}px)`)
      breakpoints.unshift({
        point,
        mediaQuery: media
      })
    }
  }
  return { breakpoints }
}
