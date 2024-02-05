export const formatTime = (start: string, end: string): string => {
  return `${start.slice(0, 5)} - ${end.slice(0, 5)}`
}
