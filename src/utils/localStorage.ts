type Key = 'cart' | 'compareList' | 'adminSidebar' | 'recentlyProducts'

export const localStorageSet = (key: Key, value: unknown): void => {
  localStorage.setItem(key, JSON.stringify(value))
}

export const localStorageGet = <T>(key: Key): T | null => {
  const data = localStorage.getItem(key)
  if (data === null) return null

  try {
    return JSON.parse(data) as T
  } catch (e) {
    console.error('incorrect format ', e)
    return null
  }
}
