export const formatSearch = (text: string | undefined): string => {
  return text ? `%${text.split(' ').join('%')}%` : '%%'
}
