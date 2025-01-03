export const formatTime = (
  start: string,
  end: string,
  separator: string = '-'
): string => {
  return `${start.slice(0, 5)} ${separator} ${end.slice(0, 5)}`
}
