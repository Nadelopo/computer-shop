import { onBeforeMount, ref } from 'vue'
import { supabase } from '@/shared/api'
import { useCartStore } from '@/modules/cart'
import { getProductQuantity, type ProductRead } from '@/modules/products'
import { useCustomRouter } from '@/shared/composables/customRouter'
import type { Loading } from '@/types'

// TODO сделать нормальный нейминг
export const useFeaturePrice = () => {
  const store = useCartStore()
  const price = ref(0)
  const loadingPrice = ref<Loading>('loading')

  const router = useCustomRouter()

  const products = ref<
    (Pick<ProductRead, 'id' | 'price' | 'title' | 'img'> & {
      quantity: number
    })[]
  >([])

  onBeforeMount(async () => {
    await store.setCartItems()

    if (!store.cartItems.length) {
      router.replace({ name: 'Home' })
    }

    const { data, error } = await supabase
      .from('products')
      .select('id, price,  title, img, product_quantity_in_stores(quantity)')
      .in(
        'id',
        store.cartItems.map((e) => e.productId)
      )
    if (error) {
      loadingPrice.value = 'error'
      return
    }
    products.value = data.map((p) => {
      const { product_quantity_in_stores: _, ...f } = p
      return {
        ...f,
        quantity: getProductQuantity(p.product_quantity_in_stores)
      }
    })
    price.value += data.reduce((a, b) => {
      const item = store.cartItems.find((e) => e.productId === b.id)
      if (!item) return a
      const markup = store.getMarkup(item.additionalWarranty, b.price)
      return a + b.price * item.count + markup * item.count
    }, 0)
    loadingPrice.value = 'success'
  })

  return { price, loadingPrice, products }
}
