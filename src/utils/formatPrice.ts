export const formatPrice = (value: number) => {
  const price = String(value).split('')
  const result = []
  for (let i = price.length - 1; i >= 0; i--) {
    if ((price.length - i - 1) % 3 === 0) {
      result.unshift(' ')
    }
    result.unshift(price[i])
  }

  return result.join('') + '₽'
}
