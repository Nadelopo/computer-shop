import { useCartStore } from '@/stores/cartStore'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

export const useChooseWord = () => {
  const { countCartItems } = storeToRefs(useCartStore())
  const chooseWord = computed(() => {
    const countCartItemsValue = countCartItems.value
    if (countCartItemsValue < 20) {
      if (countCartItemsValue === 1) return 'товар'
      if (countCartItemsValue >= 2 && countCartItemsValue <= 4) return 'товара'
    } else {
      const lastChar = Number(countCartItemsValue.toString().at(-1))
      if (lastChar === 1) return 'товар'
      if (lastChar >= 2 && lastChar <= 4) return 'товара'
    }
    return 'товаров'
  })
  return { chooseWord }
}
