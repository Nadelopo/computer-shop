export const getWordByQuantity = (count: number) => {
  if (count < 20) {
    if (count === 1) return 'товар'
    if (count >= 2 && count <= 4) return 'товара'
  } else {
    const lastChar = Number(count.toString().at(-1))
    if (lastChar === 1) return 'товар'
    if (lastChar >= 2 && lastChar <= 4) return 'товара'
  }
  return 'товаров'
}
