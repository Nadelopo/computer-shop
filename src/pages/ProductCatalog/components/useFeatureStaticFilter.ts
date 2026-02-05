import { ref } from 'vue'
import type { LocationQueryValue } from 'vue-router'

type Options = {
  max?: number
  visibility?: boolean
}

type ReturnValuesFromQuery<T> = T extends 'number'
  ? { min: number; max: number }
  : { values: string[] }

export const getValuesFromQuery = <T extends 'number' | 'string'>(
  value: LocationQueryValue | LocationQueryValue[],
  type: T
): ReturnValuesFromQuery<T> | void => {
  if (!value) return
  if (type === 'number') {
    const [minValue, maxValue] = String(value).split('_').map(Number)
    return { min: minValue, max: maxValue } as ReturnValuesFromQuery<T>
  }
  return {
    values: Array.isArray(value) ? value : [value]
  } as ReturnValuesFromQuery<T>
}

export const useFilterFieldString = (options?: Options) => {
  const values = ref<number[]>([])
  const visibility = ref(options?.visibility ?? true)
  const setValues = (value: LocationQueryValue | LocationQueryValue[]) => {
    const queryValues = getValuesFromQuery(value, 'string')
    if (queryValues) {
      values.value = queryValues.values.map(Number)
    } else {
      values.value = []
    }
  }
  const clear = () => {
    values.value = []
  }
  return {
    values,
    visibility,
    clear,
    setValues
  }
}

export const useFilterFieldNumber = (options?: Options) => {
  const maxStatic = options?.max ?? 1000000
  const min = ref(0)
  const max = ref(maxStatic)
  const visibility = ref(options?.visibility ?? true)
  const getQueryRow = () => {
    if (min.value === 0 && max.value === maxStatic) return
    return `${min.value}_${max.value}`
  }
  const clear = () => {
    min.value = 0
    max.value = maxStatic
  }
  const setValues = (value: LocationQueryValue | LocationQueryValue[]) => {
    const queryValues = getValuesFromQuery(value, 'number')
    if (!queryValues) return
    min.value = queryValues.min
    max.value = queryValues.max
  }

  return {
    min,
    max,
    maxStatic,
    visibility,
    getQueryRow,
    clear,
    setValues
  }
}
