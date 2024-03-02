import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useUserStore } from './userStore'
import {
  createOne,
  deleteOneById,
  getAll,
  getOneById,
  updateOneById
} from '@/db/queries/tables'
import { useLocalStorage } from '@/utils/localStorage'
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
  | 'rating'
>

export type ProductCart = QueryProduct & {
  count: number
  cartItemId?: number
  additionalWarranty: number
  servicePrice: number
  categories: {
    enTitle: string
  }
}

export type ProductInStorage = {
  id?: number
  created_at?: string
  userId?: string
  productId: number
  count: number
  additionalWarranty: number
}

export const useCartStore = defineStore('cart', () => {
  const { isUserAuthenticated } = useUserStore()
  const cartItems = ref<ProductInStorage[]>([])
  const cartItemsWithDetails = ref<ProductCart[]>([])
  const cartItemsStorage = useLocalStorage<ProductInStorage[]>('cart', {
    onChange: (newValue) => {
      cartItems.value = newValue
    }
  })

  async function addToCart(
    productId: number
  ): Promise<{ error: PostgrestError | null }> {
    const [user, { error: errorGetProduct }] = await Promise.all([
      isUserAuthenticated(),
      getOneById('products', productId)
    ])
    if (errorGetProduct) {
      return { error: errorGetProduct }
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
          { count: productsCart[0].count + 1 }
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
          count: 1,
          additionalWarranty: 0
        })
        if (errorCreate) {
          error = errorCreate
          return { error }
        }
        cartItems.value.push(data)
      }
    } else {
      const productsCart = cartItemsStorage.get() ?? []
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
        cartItems.value = [
          ...productsCart,
          { count: 1, productId, additionalWarranty: 0 }
        ]
      }
    }
    cartItemsStorage.set(cartItems.value)
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
      cartItemsStorage.set(data)
    } else {
      const data = cartItemsStorage.get()
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
      select:
        'categoryId, discount, id, img, title, price, priceWithoutDiscount, quantity, warranty, categories(enTitle)',
      in: { id: idList }
    })
    if (error) {
      return { error }
    }

    const modifiedData: ProductCart[] = []
    for (const product of data || []) {
      const item = cartItems.find((i) => i.productId === product.id)
      if (item) {
        modifiedData.push({
          ...product,
          count: item.count,
          cartItemId: item.id,
          additionalWarranty: item.additionalWarranty,
          servicePrice: 0
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

  async function setItemCount(
    product: ProductCart,
    count: number
  ): Promise<{ error: PostgrestError | null }> {
    const user = await isUserAuthenticated()
    if (user) {
      if (product.cartItemId) {
        if (count === 0) {
          const { error } = await deleteOneById('cart', product.cartItemId)
          if (error) return { error }
        } else {
          const { error } = await updateOneById('cart', product.cartItemId, {
            count
          })
          if (error) return { error }
        }
      }
    } else {
      const data = cartItemsStorage.get() ?? []
      cartItems.value = data
    }
    if (count === 0) {
      cartItemsWithDetails.value = cartItemsWithDetails.value.filter(
        (p) => p.id !== product.id
      )
      cartItems.value = cartItems.value.filter(
        (p) => p.productId !== product.id
      )
    } else {
      cartItemsWithDetails.value = cartItemsWithDetails.value.map((p) =>
        p.id === product.id ? { ...p, count } : p
      )
      cartItems.value = cartItems.value.map((p) =>
        p.productId === product.id ? { ...p, count } : p
      )
    }
    cartItemsStorage.set(cartItems.value)
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
    }

    cartItems.value = cartItems.value.filter((e) => e.productId !== productId)
    cartItemsWithDetails.value = cartItemsWithDetails.value.filter(
      (e) => e.id !== productId
    )
    cartItemsStorage.set(cartItems.value)
    return { error: null }
  }

  const countCartItems = computed(() =>
    cartItems.value.reduce((total, item) => total + item.count, 0)
  )

  const getMarkup = (warranty: number, productPrice: number) => {
    const markup = Math.min(productPrice * 0.01, 1000)
    let price = 0
    if (warranty === 12) price = 1000 + markup
    if (warranty === 24) price = 1500 + markup
    if (warranty === 36) price = 2500 + markup
    return Math.floor(price)
  }

  return {
    cartItems,
    addToCart,
    setCartItems,
    cartItemsWithDetails,
    setCartItemsWithDetails,
    setItemCount,
    deleteItem,
    countCartItems,
    getMarkup
  }
})
