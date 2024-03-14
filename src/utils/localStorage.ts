import { onBeforeMount, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/userStore'

type Key =
  | 'cart'
  | 'compareList'
  | 'adminSidebar'
  | 'recentlyProducts'
  | 'favourites'

type Options<T> = {
  onChange?: (newValue: T) => void
}

export const useLocalStorage = <T>(key: Key, options?: Options<T>) => {
  const onStorage = (e: StorageEvent) => {
    if (e.key === key && e.newValue !== null) {
      options?.onChange?.(JSON.parse(e.newValue))
    }
  }
  onBeforeMount(async () => {
    if (options?.onChange) {
      if (key === 'favourites') {
        const { isUserAuthenticated } = useUserStore()
        const isUser = await isUserAuthenticated()
        if (!isUser) return
      }
      window.addEventListener('storage', onStorage)
    }
  })

  onUnmounted(() => {
    window.removeEventListener('storage', onStorage)
  })

  const set = (value: T) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (err) {
      console.error(err)
      return false
    }
  }

  const get = () => {
    const data = localStorage.getItem(key)
    if (data === null) return null

    try {
      return JSON.parse(data) as T
    } catch (e) {
      console.error('incorrect format ', e)
      return null
    }
  }
  return { set, get }
}
