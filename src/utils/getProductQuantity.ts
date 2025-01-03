export const getProductQuantity = (
  productQuantityInStores: { quantity: number }[]
) => {
  return productQuantityInStores.reduce((sum, item) => sum + item.quantity, 0)
}
