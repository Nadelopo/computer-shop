import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/supabase'
import {
  createOne,
  deleteOne,
  getAll,
  getOneById,
  updateOne
} from '@/utils/queries/db'
import { localStorageGet, localStorageSet } from '@/utils/localStorage'
import type { ProductInStorage } from '@/types'
import type { CartRead } from '@/types/tables/cart.types'
import type { ProductRead } from '@/types/tables/products.types'

type QueryProduct = Omit<
  ProductRead,
  | 'countReviews'
  | 'created_at'
  | 'description'
  | 'manufacturerId'
  | 'popularity'
  | 'sell'
  | 'warranty'
>

type ProductCart = QueryProduct & {
  count: number
  cartItemId?: number
}

export const useCartStore = defineStore('cart', () => {
  const cartItems = ref<ProductInStorage[]>([])
  const cartItemsWithDetails = ref<ProductCart[]>([])

  async function addToCart(productId: number) {
    const user = supabase.auth.user()
    let data: CartRead | null = null
    const product = await getOneById('products', productId)

    if (user) {
      const productCart = await getAll('cart', {
        eq: [
          {
            column: 'userId',
            value: user.id
          },
          {
            column: 'productId',
            value: productId
          }
        ]
      })

      if (productCart?.length && product) {
        data = await updateOne('cart', productCart[0].id, {
          count: productCart[0].count + 1
        })
        cartItems.value = cartItems.value.map((e) =>
          data && e.productId === productId ? data : e
        )
      } else {
        data = await createOne('cart', {
          userId: user.id,
          productId,
          count: 1
        })
        if (data) {
          cartItems.value.push(data)
        }
      }
    } else {
      const productsCart = localStorageGet<ProductInStorage[]>('products') ?? []
      const checkProductInCart = productsCart.find(
        (e) => e.productId === productId
      )

      if (checkProductInCart) {
        cartItems.value = productsCart.map((e) =>
          e.productId === productId
            ? { ...e, count: checkProductInCart.count + 1 }
            : e
        )
      } else {
        cartItems.value = [...productsCart, { count: 1, productId }]
      }

      localStorageSet('products', cartItems.value)
    }
  }

  async function setCartItems() {
    const user = supabase.auth.user()
    if (user) {
      const data = await getAll('cart', {
        eq: [{ column: 'userId', value: user.id }]
      })
      if (data) {
        cartItems.value = data
      }
    } else {
      const data = localStorageGet<ProductInStorage[]>('products')
      if (data) {
        cartItems.value = data
      }
    }
    return cartItems.value
  }

  async function setCartItemsWithDetails(cartItems: ProductInStorage[]) {
    const idList: number[] = cartItems.map((e) => e.productId)

    const { data } = await supabase
      .from<QueryProduct>('products')
      .select('categoryId, discount, id, img, name, price, quantity, rating')
      .in('id', idList)

    const modifiedData: ProductCart[] = []
    for (const product of data || []) {
      const item = cartItems.find((i) => i.productId === product.id)
      if (item) {
        modifiedData.push({
          ...product,
          count: item.count,
          cartItemId: item.id
        })
      }
    }

    const orderedData = []
    for (const id of idList) {
      const item = modifiedData.find((i) => i.id === id)
      if (item) {
        orderedData.push(item)
      }
    }
    cartItemsWithDetails.value = orderedData
  }

  async function increaseItemCount(product: ProductCart) {
    const user = supabase.auth.user()
    let data: CartRead | ProductInStorage[] | null = null
    if (user) {
      if (product.cartItemId) {
        data = await updateOne('cart', product.cartItemId, {
          count: product.count + 1
        })
      }
    } else {
      data = localStorageGet<ProductInStorage[]>('products')
      if (data) {
        cartItems.value = data.map((p) =>
          p.productId === product.id ? { ...p, count: p.count + 1 } : p
        )
        localStorageSet('products', cartItems.value)
      }
    }
    if (data) {
      cartItemsWithDetails.value = cartItemsWithDetails.value.map((p) =>
        p.id === product.id ? { ...p, count: p.count + 1 } : p
      )
    }
  }

  async function reduceItemCount(product: ProductCart) {
    const user = supabase.auth.user()
    let data: CartRead | ProductInStorage[] | null = null
    if (user) {
      if (product.cartItemId) {
        if (product.count > 1) {
          data = await updateOne('cart', product.cartItemId, {
            count: product.count - 1
          })
        } else {
          data = await deleteOne('cart', product.cartItemId)
        }
      }
    } else {
      data = localStorageGet<ProductInStorage[]>('products')
      if (data) {
        if (product.count > 1) {
          cartItems.value = data.map((p) =>
            p.productId === product.id ? { ...p, count: p.count - 1 } : p
          )
        } else {
          cartItems.value = data.filter((p) => p.productId !== product.id)
        }
        localStorageSet('products', cartItems.value)
      }
    }
    if (data) {
      if (product.count > 1) {
        cartItemsWithDetails.value = cartItemsWithDetails.value.map((p) =>
          p.id === product.id ? { ...p, count: p.count - 1 } : p
        )
      } else {
        cartItemsWithDetails.value = cartItemsWithDetails.value.filter(
          (p) => p.id !== product.id
        )
      }
    }
  }

  async function deleteItem(productId: number) {
    const user = supabase.auth.user()
    let data: CartRead | ProductInStorage[] | null = null
    if (user) {
      const productCart = await getAll('cart', {
        eq: [
          {
            column: 'userId',
            value: user.id
          },
          {
            column: 'productId',
            value: productId
          }
        ]
      })
      if (productCart) {
        data = await deleteOne('cart', productCart[0].id)
      }
    } else {
      data = localStorageGet<ProductInStorage[]>('products')
      if (data) {
        localStorageSet(
          'products',
          data.filter((e) => e.productId !== productId)
        )
      }
    }
    if (data) {
      cartItems.value = cartItems.value.filter((e) => e.productId !== productId)
      cartItemsWithDetails.value = cartItemsWithDetails.value.filter(
        (e) => e.id !== productId
      )
    }
  }

  return {
    cartItems,
    addToCart,
    setCartItems,
    cartItemsWithDetails,
    setCartItemsWithDetails,
    increaseItemCount,
    reduceItemCount,
    deleteItem
  }
})
