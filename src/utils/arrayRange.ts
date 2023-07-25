export const arrayRange = (start: number, end: number) => {
  return Array.from({ length: end - start }, (v, k) => k + start)
}
