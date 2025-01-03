import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { PostgrestError, User } from '@supabase/supabase-js'
import { supabase } from '@/db/supabase'
import { getProductQuantity } from '@/utils/getProductQuantity'
import { useUserStore } from './userStore'
import { useLocalStorage } from '@/utils/localStorage'
import type { ProductRead } from '@/types/tables/products.types'
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
  isPriceChanged: boolean
  quantity: number
  categories: {
    enTitle: string
  }
}

export type ProductStorage = {
  id?: number
  created_at?: string
  userId?: string
  productId: number
  count: number
  isPriceChanged: boolean
  additionalWarranty: number
}

export const useCartStore = defineStore('cart', () => {
  const { isUserAuthenticated } = useUserStore()
  const cartItems = ref<ProductStorage[]>([])
  const cartItemsWithDetails = ref<ProductCart[]>([])
  const cartItemsStorage = useLocalStorage<ProductStorage[]>('cart', {
    onChange: (newValue) => {
      cartItems.value = newValue
    }
  })

  async function addToCart(
    productId: number
  ): Promise<{ error: PostgrestError | null | 'OutOfStock' }> {
    const [user, { data: product, error: errorGetProduct }] = await Promise.all(
      [
        isUserAuthenticated(),
        supabase
          .from('products')
          .select('*, product_quantity_in_stores(quantity)')
          .eq('id', productId)
          .single()
      ]
    )
    if (!product) {
      return { error: errorGetProduct }
    }
    const productQuantity = getProductQuantity(
      product.product_quantity_in_stores
    )
    if (productQuantity < 1) {
      return { error: 'OutOfStock' }
    }
    let error: PostgrestError | null = null
    if (user) {
      const { data: productsCart, error: errorProducts } = await supabase
        .from('cart')
        .select()
        .match({ userId: user.id, productId })
      if (errorProducts) {
        error = errorProducts
        return { error }
      }

      if (productsCart.length) {
        const { data, error: errorUpdate } = await supabase
          .from('cart')
          .update({ count: productsCart[0].count + 1 })
          .eq('id', productsCart[0].id)

        cartItems.value = cartItems.value.map((e) =>
          data && e.productId === productId ? data : e
        )
        if (errorUpdate) {
          error = errorUpdate
          return { error }
        }
      } else {
        const { data, error: errorCreate } = await supabase
          .from('cart')
          .insert({
            userId: user.id,
            productId,
            count: 1,
            additionalWarranty: 0,
            isPriceChanged: false
          })
          .select()
          .single()

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
          { count: 1, productId, additionalWarranty: 0, isPriceChanged: false }
        ]
      }
    }
    cartItemsStorage.set(cartItems.value)
    return { error }
  }

  async function getCartItems(
    user: User | null
  ): Promise<DataError<ProductStorage[]>> {
    let dataValue: ProductStorage[] = []
    if (user) {
      const { data, error } = await supabase
        .from('cart')
        .select()
        .eq('userId', user.id)
      if (error) {
        return { data: null, error }
      }
      dataValue = data
    } else {
      const data = cartItemsStorage.get()
      if (data) {
        dataValue = data
      }
    }
    return { data: dataValue, error: null }
  }

  async function deleteItem(
    productId: number
  ): Promise<{ error: PostgrestError | null }> {
    const user = await isUserAuthenticated()
    if (user) {
      const { data: productCart, error } = await supabase
        .from('cart')
        .select()
        .match({ userId: user.id, productId })
      if (error) return { error }

      const { error: errorDelete } = await supabase
        .from('cart')
        .delete()
        .eq('id', productCart[0].id)
      if (errorDelete) return { error: errorDelete }
    }

    cartItems.value = cartItems.value.filter((e) => e.productId !== productId)
    cartItemsWithDetails.value = cartItemsWithDetails.value.filter(
      (e) => e.id !== productId
    )
    cartItemsStorage.set(cartItems.value)
    return { error: null }
  }

  async function setItemCount(
    productId: number,
    itemCount: number,
    cartItemId?: number
  ): Promise<{ error: PostgrestError | null }> {
    const user = await isUserAuthenticated()

    const { data: product, error: errorProduct } = await supabase
      .from('products')
      .select('*, product_quantity_in_stores(quantity)')
      .eq('id', productId)
      .single()

    if (errorProduct) return { error: errorProduct }

    const productQuantity = getProductQuantity(
      product.product_quantity_in_stores
    )

    let count = itemCount
    if (productQuantity < count) {
      count = productQuantity
    }

    if (user) {
      if (cartItemId) {
        if (count === 0) {
          const { error } = await supabase
            .from('cart')
            .delete()
            .eq('id', cartItemId)
          if (error) return { error }
        } else {
          const { error } = await supabase
            .from('cart')
            .update({ count })
            .eq('id', cartItemId)
          if (error) return { error }
        }
      }
    } else {
      const data = cartItemsStorage.get() ?? []
      cartItems.value = data
    }

    if (count === 0) {
      cartItemsWithDetails.value = cartItemsWithDetails.value.filter(
        (p) => p.id !== productId
      )
      cartItems.value = cartItems.value.filter((p) => p.productId !== productId)
    } else {
      cartItemsWithDetails.value = cartItemsWithDetails.value.map((p) =>
        p.id === productId ? { ...p, count } : p
      )
      cartItems.value = cartItems.value.map((p) =>
        p.productId === productId ? { ...p, count } : p
      )
    }

    cartItemsStorage.set(cartItems.value)
    return { error: null }
  }

  async function setCartItems(): Promise<DataError<ProductStorage[]>> {
    const user = await isUserAuthenticated()

    let data: ProductStorage[] = []
    const { data: items, error } = await getCartItems(user)

    if (error) {
      return { data: null, error }
    }
    data = items

    const { data: products, error: errorProducts } = await supabase
      .from('products')
      .select('id, product_quantity_in_stores(quantity)')
      .in(
        'id',
        items.map((e) => e.productId)
      )
    if (errorProducts) return { data: null, error: errorProducts }

    const promises = []
    for (const cartProduct of items) {
      const product = products.find((e) => e.id === cartProduct.productId)
      if (!product) continue
      const productQuantity = getProductQuantity(
        product.product_quantity_in_stores
      )
      if (productQuantity === 0) {
        promises.push(deleteItem(product.id))
        continue
      }
      if (productQuantity < cartProduct.count) {
        promises.push(setItemCount(product.id, productQuantity, cartProduct.id))
      }
    }

    if (promises.length) {
      await Promise.all(promises)
      const { data: updatedItems, error: errorCartItems } =
        await getCartItems(user)
      if (errorCartItems) {
        return { data: null, error: errorCartItems }
      }
      data = updatedItems
    }

    cartItems.value = data
    if (user) {
      cartItemsStorage.set(data)
    }
    return { data: cartItems.value, error: null }
  }

  async function setCartItemsWithDetails(items: ProductStorage[]): Promise<{
    error: PostgrestError | null
  }> {
    const idList: number[] = items.map((e) => e.productId)

    const { data, error } = await supabase
      .from('products')
      .select(
        'categoryId, discount, id, img, title, price, priceWithoutDiscount,  warranty, categories(enTitle),product_quantity_in_stores(quantity)'
      )
      .in('id', idList)
    if (error) {
      return { error }
    }

    const modifiedData: ProductCart[] = []
    for (const product of data || []) {
      const item = items.find((i) => i.productId === product.id)
      if (item) {
        modifiedData.push({
          ...product,
          count: item.count,
          cartItemId: item.id,
          additionalWarranty: item.additionalWarranty,
          servicePrice: 0,
          isPriceChanged: item.isPriceChanged,
          quantity: getProductQuantity(product.product_quantity_in_stores)
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

  const getMarkup = (warranty: number, productPrice: number) => {
    const markup = Math.min(productPrice * 0.01, 1000)
    let price = 0
    if (warranty === 12) price = 1000 + markup
    if (warranty === 24) price = 1500 + markup
    if (warranty === 36) price = 2500 + markup
    return Math.floor(price)
  }

  const countCartItems = computed(() =>
    cartItems.value.reduce((total, item) => total + item.count, 0)
  )

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
