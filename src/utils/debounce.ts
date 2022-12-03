export const debounce = (ms: number, func: () => void) => {
  let timeout = 0
  return () => {
    clearTimeout(timeout)
    timeout = window.setTimeout(() => func(), ms)
  }
}
