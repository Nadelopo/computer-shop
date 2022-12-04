export const isOutside = (ref: HTMLElement, e: MouseEvent) => {
  return ref && !e.composedPath().includes(ref)
}
