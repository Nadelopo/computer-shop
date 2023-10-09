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
  slidesPerView: Ref<number>,
  defaultSlidesPerView: number
) => {
  const breakpoints: Breakpoints[] = reactive([])

  watch(
    () => breakpoints.map((e) => e.mediaQuery),
    () => {
      for (const item of breakpoints) {
        if (item.mediaQuery) {
          const point = propsBreakpoints[Number(item.point)]
          if (point.slidesPerView) {
            slidesPerView.value = point.slidesPerView
          }
        }
      }
      if (breakpoints.every((e) => !e.mediaQuery)) {
        slidesPerView.value = defaultSlidesPerView
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
}
