import { onUnmounted } from 'vue'

export const useMoveListener = (
  handler: (e: MouseEvent | TouchEvent) => void
) => {
  const add = (type: 'mousemove' | 'touchmove') => {
    window.addEventListener(type, handler, {
      passive: false
    })
  }
  const remove = () => {
    window.removeEventListener('mousemove', handler)
    window.removeEventListener('touchmove', handler)
  }
  onUnmounted(remove)
  return {
    add,
    remove
  }
}

export const useMouseUpListener = (
  handler: (e: MouseEvent | TouchEvent) => void
) => {
  const add = () => window.addEventListener('mouseup', handler)
  const remove = () => window.removeEventListener('mouseup', handler)
  onUnmounted(remove)
  return {
    add,
    remove
  }
}
