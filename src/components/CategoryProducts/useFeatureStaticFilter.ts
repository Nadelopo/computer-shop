import { ref } from 'vue'
import type { LocationQueryValue } from 'vue-router'

type Options = {
  max?: number
  visibility?: boolean
}

type ReturnValuesFromQuery<T> = T extends true
  ? { min: number; max: number }
  : { values: string[] }

export const getValuesFromQuery = <T extends boolean>(
  value: LocationQueryValue | LocationQueryValue[],
  type: T
): ReturnValuesFromQuery<T> | void => {
  if (!value) return
  if (type) {
    const [minValue, maxValue] = String(value).split('_').map(Number)
    return { min: minValue, max: maxValue } as ReturnValuesFromQuery<T>
  } else {
    return {
      values: Array.isArray(value) ? value : [value]
    } as ReturnValuesFromQuery<T>
  }
}

export const useFeatureStringStaticFilter = (options?: Options) => {
  const values = ref<number[]>([])
  const variantsValues = ref<{ id: number; title: string }[]>([])
  const visibility = ref(options?.visibility ?? true)
  const setValues = (
    value: LocationQueryValue | LocationQueryValue[],
    valuesData?: { id: number; title: string }[]
  ) => {
    if (valuesData) variantsValues.value = valuesData
    const queryValues = getValuesFromQuery(value, false)
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
    variantsValues,
    visibility,
    clear,
    setValues
  }
}

export const useFeatureNumberStaticFilter = (options?: Options) => {
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
    const queryValues = getValuesFromQuery(value, true)
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
