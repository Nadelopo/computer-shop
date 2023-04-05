import { ref } from 'vue'
import { defineStore } from 'pinia'
import { supabase } from '@/supabase'
import {
  createOne,
  deleteOne,
  getAllByColumns,
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
    const product = await getOneById<ProductRead>('products', productId)

    if (user) {
      const productCart = await getAllByColumns<CartRead>('cart', [
        {
          column: 'userId',
          value: user.id
        },
        {
          column: 'productId',
          value: productId
        }
      ])

      if (productCart?.length && product) {
        data = await updateOne<CartRead>('cart', productCart[0].id, {
          count: productCart[0].count + 1
        })
        cartItems.value = cartItems.value.map((e) =>
          data && e.productId === productId ? data : e
        )
      } else {
        data = await createOne<CartRead>('cart', {
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
      const data = await getAllByColumns<CartRead>('cart', [
        { column: 'userId', value: user.id }
      ])
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
    const newProducts = []
    for (const [i, el] of cartItems.entries()) {
      const product = await getOneById<QueryProduct>(
        'products',
        el.productId,
        'categoryId, discount, id, img, name, price, quantity, rating'
      )
      if (product) {
        newProducts.push({ ...product, count: el.count, cartItemId: el.id })
      }
      if (i === cartItems.length - 1) {
        cartItemsWithDetails.value = newProducts
      }
    }
  }

  async function increaseItemCount(product: ProductCart) {
    const user = supabase.auth.user()
    let data: CartRead | ProductInStorage[] | null = null
    if (user) {
      if (product.cartItemId) {
        data = await updateOne<CartRead>('cart', product.cartItemId, {
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
          data = await updateOne<CartRead>('cart', product.cartItemId, {
            count: product.count - 1
          })
        } else {
          data = await deleteOne<CartRead>('cart', product.cartItemId, [
            {
              column: 'userId',
              value: user.id
            }
          ])
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
      const productCart = await getAllByColumns<CartRead>('cart', [
        {
          column: 'userId',
          value: user.id
        },
        {
          column: 'productId',
          value: productId
        }
      ])
      if (productCart) {
        data = await deleteOne<CartRead>('cart', productCart[0].id)
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
