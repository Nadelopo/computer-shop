import { ComputedRef, Ref, computed } from 'vue'
import type { CategorySpecifications, ComparisonProduct } from './types'
import { formatPrice } from '@/utils/formatPrice'

type FieldsData = {
  title: string
  values: Array<string | number>
  units: string | number
  max?: number
}

export const useFeatureFilteredProducts = (
  categoryProducts: ComputedRef<ComparisonProduct[]>,
  currentCategorySpecifications: Readonly<Ref<CategorySpecifications[]>>,
  showDifferences: Readonly<Ref<boolean>>
) => {
  const productsData = computed(() => {
    const fields: FieldsData[] = [
      {
        title: 'Наименование',
        values: [],
        units: ''
      },
      {
        title: 'Цена',
        values: [],
        units: ''
      },
      {
        title: 'Рейтинг',
        values: [],
        units: ''
      }
    ]
    const currentCategorySpecificationsValue =
      currentCategorySpecifications.value
    for (const category of currentCategorySpecificationsValue) {
      fields.push({
        title: category.title,
        values: [],
        units: category.units
      })
    }
    fields.push({
      title: 'Производитель',
      values: [],
      units: ''
    })
    fields.push({
      title: 'Гарантия',
      values: [],
      units: 'мес'
    })
    const categoryProductsValue = categoryProducts.value
    for (let i = 0; i < categoryProductsValue.length; i++) {
      const product = categoryProductsValue[i]
      fields[0].values.push(product.name)
      fields[1].values.push(formatPrice(product.price))
      fields[2].values.push(Number(product.rating.toFixed(1)))
      for (let j = 0; j < currentCategorySpecificationsValue.length; j++) {
        const category = currentCategorySpecificationsValue[j]
        let index = 3
        const specification = product.specifications.find((e, i) => {
          index = i + 3
          return e.categorySpecificationsId === category.id
        })
        if (!specification) continue
        let value: string | number | null | undefined =
          specification.valueNumber
        if (value === null) {
          value =
            specification.valueString?.length === 1
              ? specification.valueString[0]
              : specification.valueString?.join(', ')
        }
        if (!value) continue
        fields[index].values.push(value)
      }
      fields.at(-2)?.values.push(product.manufacturers.title)
      fields.at(-1)?.values.push(product.warranty)
    }
    fields.forEach((f) => {
      if (typeof f.values[0] === 'string') {
        return f
      }
      const { condition } =
        currentCategorySpecificationsValue.find((s) => s.title === f.title) ||
        {}
      const choiseMethod = !condition || condition === 'greater' ? 'max' : 'min'
      f.max = Math[choiseMethod](...(f.values as number[]))
      return f
    })
    return fields
  })

  const filteredProducts = computed(() => {
    const productsDataValue = productsData.value
    if (!showDifferences.value || categoryProducts.value.length <= 1) {
      return productsDataValue
    }
    let filtered = productsDataValue
    for (let i = 3; i < productsDataValue.length; i++) {
      const data = productsDataValue[i]
      if (data.values.every((e) => e === data.values[0])) {
        filtered = filtered.filter((e) => e.title !== data.title)
      }
    }
    return filtered
  })
  return { filteredProducts }
}
