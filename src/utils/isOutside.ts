export const isOutside = (ref: HTMLElement, e: Event) => {
  return ref && !e.composedPath().includes(ref)
}
