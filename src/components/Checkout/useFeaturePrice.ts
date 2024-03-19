import { onBeforeMount, ref } from 'vue'
import { useCartStore } from '@/stores/cartStore'
import type { Loading } from '@/types'
import type { ProductRead } from '@/types/tables/products.types'
import { useRouter } from 'vue-router'
import { getAll } from '@/db/queries/tables'

export const useFeaturePrice = () => {
  const store = useCartStore()
  const price = ref(0)
  const loadingPrice = ref<Loading>('loading')

  const router = useRouter()

  const products = ref<
    Pick<ProductRead, 'id' | 'price' | 'title' | 'img' | 'quantity'>[]
  >([])

  onBeforeMount(async () => {
    await store.setCartItems()
    if (!store.cartItems.length) {
      router.push({ name: 'Cart' })
    }
    const { data, error } = await getAll('products', {
      in: {
        id: store.cartItems.map((e) => e.productId)
      },
      select: 'id, price, quantity, title, img '
    })
    if (error) {
      loadingPrice.value = 'error'
      return
    }
    products.value = data
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
