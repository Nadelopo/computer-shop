export const debounce = (func: () => void, ms: number = 500) => {
  let timeout = 0
  return () => {
    clearTimeout(timeout)
    timeout = window.setTimeout(() => func(), ms)
  }
}
