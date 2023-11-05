import { reactive, watch, type Ref } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { debounce } from './debounce'

type Breakpoint<T> = {
  media: Ref<boolean>
  value: T
}

const defaultBreakpoints = [1536, 1280, 1024, 768, 640]

export const useBreakpoints = <T extends object | number>(
  valueByResize: T[],
  func?: (args: T | 'noOne') => void,
  options?: {
    points?: number[]
    delay?: number
    onUpdate?: (value: T | 'noOne') => void
  }
) => {
  const points = options?.points ?? defaultBreakpoints

  const breakpoints: Breakpoint<T>[] = reactive([])
  for (const [i, point] of points.entries()) {
    const media = useMediaQuery(`(width < ${point}px)`)
    breakpoints.push({
      media,
      value: valueByResize[i]
    })
  }
  const onPoints = debounce(() => {
    for (const breakpoint of breakpoints) {
      if (breakpoint.media) {
        func?.(breakpoint.value)
      }
    }

    if (breakpoints.every((e) => !e.media)) {
      func?.('noOne')
    }
  }, options?.delay ?? 0)
  watch(
    () => breakpoints.map((b) => b.media),
    () => {
      const lastPoint = breakpoints.findLast((e) => e.media)
      if (lastPoint) {
        options?.onUpdate?.(lastPoint.value)
      } else {
        options?.onUpdate?.('noOne')
      }
      onPoints()
    },
    {
      immediate: true
    }
  )
  return { breakpoints }
}
