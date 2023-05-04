import type { Ref } from 'vue'

export const isOutside = (ref: Ref<HTMLElement | undefined>, e: Event) => {
  return ref.value && !e.composedPath().includes(ref.value)
}
