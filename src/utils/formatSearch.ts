export const formatSearch = (text: string | undefined) => {
  return text ? `%${text.split(' ').join('%')}%` : '%%'
}
