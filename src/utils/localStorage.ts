export const localStorageSet = (key: string, value: unknown) => {
  localStorage.setItem(key, JSON.stringify(value))
}

export const localStorageGet = <T>(key: string) => {
  const data = localStorage.getItem(key)
  if (data !== null) {
    const parsed: T = JSON.parse(data)
    return parsed
  } else {
    return null
  }
}
