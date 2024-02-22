import { onUnmounted } from 'vue'

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
    if (e.key === key) {
      options?.onChange!(JSON.parse(e.newValue ?? '') as T)
    }
  }
  if (options?.onChange) {
    window.addEventListener('storage', onStorage)
  }

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
