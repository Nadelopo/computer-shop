import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useUserStore } from './userStore'
import {
  createOne,
  deleteOneById,
  getAll,
  getOneById,
  updateOneById
} from '@/utils/queries/db'
import { localStorageGet, localStorageSet } from '@/utils/localStorage'
import type { ProductRead } from '@/types/tables/products.types'
import type { PostgrestError } from '@supabase/supabase-js'
import type { DataError } from '@/types'

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

type ProductInStorage = {
  id?: number
  created_at?: string
  userId?: string
  productId: number
  count: number
}

export const useCartStore = defineStore('cart', () => {
  const { isUserAuthenticated } = useUserStore()
  const cartItems = ref<ProductInStorage[]>([])
  const cartItemsWithDetails = ref<ProductCart[]>([])

  async function addToCart(
    productId: number
  ): Promise<{ error: PostgrestError | null }> {
    const user = await isUserAuthenticated()
    const { error: errerGet } = await getOneById('products', productId)
    if (errerGet) {
      return { error: errerGet }
    }
    let error: PostgrestError | null = null
    if (user) {
      const { data: productsCart, error: errorProducts } = await getAll(
        'cart',
        {
          match: {
            userId: user.id,
            productId: productId
          }
        }
      )
      if (errorProducts) {
        error = errorProducts
        return { error }
      }

      if (productsCart.length) {
        const { data, error: errorUpdate } = await updateOneById(
          'cart',
          productsCart[0].id,
          {
            count: productsCart[0].count + 1
          }
        )
        cartItems.value = cartItems.value.map((e) =>
          data && e.productId === productId ? data : e
        )
        if (errorUpdate) {
          error = errorUpdate
          return { error }
        }
      } else {
        const { data, error: errorCreate } = await createOne('cart', {
          userId: user.id,
          productId,
          count: 1
        })
        if (errorCreate) {
          error = errorCreate
          return { error }
        }
        cartItems.value.push(data)
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
    return { error }
  }

  async function setCartItems(): Promise<DataError<ProductInStorage[]>> {
    const user = await isUserAuthenticated()
    let error: PostgrestError | null = null
    if (user) {
      const { data, error: errorGet } = await getAll('cart', {
        match: { userId: user.id }
      })
      if (errorGet) {
        error = errorGet
        return { data: null, error }
      }
      cartItems.value = data
    } else {
      const data = localStorageGet<ProductInStorage[]>('products')
      if (data) {
        cartItems.value = data
      }
    }
    return { data: cartItems.value, error }
  }

  async function setCartItemsWithDetails(
    cartItems: ProductInStorage[]
  ): Promise<{
    error: PostgrestError | null
  }> {
    const idList: number[] = cartItems.map((e) => e.productId)

    const { data, error } = await getAll('products', {
      select: 'categoryId, discount, id, img, name, price, quantity, rating',
      in: ['id', idList]
    })
    if (error) {
      return {
        error
      }
    }

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
    return { error: null }
  }

  async function increaseItemCount(
    product: ProductCart
  ): Promise<{ error: PostgrestError | null }> {
    const user = await isUserAuthenticated()
    if (user) {
      if (product.cartItemId) {
        const { error } = await updateOneById('cart', product.cartItemId, {
          count: product.count + 1
        })
        if (error) return { error }
      }
    } else {
      const storageData = localStorageGet<ProductInStorage[]>('products') ?? []

      cartItems.value = storageData.map((p) =>
        p.productId === product.id ? { ...p, count: p.count + 1 } : p
      )
      localStorageSet('products', cartItems.value)
    }

    cartItemsWithDetails.value = cartItemsWithDetails.value.map((p) =>
      p.id === product.id ? { ...p, count: p.count + 1 } : p
    )
    return { error: null }
  }

  async function reduceItemCount(
    product: ProductCart
  ): Promise<{ error: PostgrestError | null }> {
    const user = await isUserAuthenticated()
    if (user) {
      if (product.cartItemId) {
        if (product.count > 1) {
          const { error } = await updateOneById('cart', product.cartItemId, {
            count: product.count - 1
          })
          if (error) return { error }
        } else {
          const { error } = await deleteOneById('cart', product.cartItemId)
          if (error) return { error }
        }
      }
    } else {
      const data = localStorageGet<ProductInStorage[]>('products') ?? []
      if (product.count > 1) {
        cartItems.value = data.map((p) =>
          p.productId === product.id ? { ...p, count: p.count - 1 } : p
        )
      } else {
        cartItems.value = data.filter((p) => p.productId !== product.id)
      }
      localStorageSet('products', cartItems.value)
    }
    if (product.count > 1) {
      cartItemsWithDetails.value = cartItemsWithDetails.value.map((p) =>
        p.id === product.id ? { ...p, count: p.count - 1 } : p
      )
    } else {
      cartItemsWithDetails.value = cartItemsWithDetails.value.filter(
        (p) => p.id !== product.id
      )
    }
    return { error: null }
  }

  async function deleteItem(
    productId: number
  ): Promise<{ error: PostgrestError | null }> {
    const user = await isUserAuthenticated()
    if (user) {
      const { data: productCart, error } = await getAll('cart', {
        match: {
          userId: user.id,
          productId: productId
        }
      })
      if (error) return { error }

      const { error: errorDelete } = await deleteOneById(
        'cart',
        productCart[0].id
      )
      if (errorDelete) return { error: errorDelete }
    } else {
      const data = localStorageGet<ProductInStorage[]>('products') ?? []

      localStorageSet(
        'products',
        data.filter((e) => e.productId !== productId)
      )
    }

    cartItems.value = cartItems.value.filter((e) => e.productId !== productId)
    cartItemsWithDetails.value = cartItemsWithDetails.value.filter(
      (e) => e.id !== productId
    )
    return { error: null }
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
