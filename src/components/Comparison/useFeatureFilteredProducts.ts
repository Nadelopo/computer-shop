import { ComputedRef, Ref, computed } from 'vue'
import type { CategorySpecifications, ComparisonProduct } from './types'
import { formatPrice } from '@/utils/formatPrice'

type FieldsData = {
  title: string
  value: Array<string | number>
  units: string | number
}

export const useFeatureFilteredProducts = (
  categoryProducts: ComputedRef<ComparisonProduct[]>,
  currentCategorySpecifications: Readonly<Ref<CategorySpecifications[]>>,
  showDifferences: Readonly<Ref<boolean>>
) => {
  const productsData = computed(() => {
    const fields: FieldsData[] = [
      {
        title: '',
        value: [],
        units: ''
      },
      {
        title: 'Наименование',
        value: [],
        units: ''
      },
      {
        title: 'Рейтинг',
        value: [],
        units: ''
      },
      {
        title: 'Цена',
        value: [],
        units: ''
      }
    ]
    for (const category of currentCategorySpecifications.value) {
      fields.push({
        title: category.title,
        value: [],
        units: category.units
      })
    }
    fields.push({
      title: 'Производитель',
      value: [],
      units: ''
    })
    fields.push({
      title: 'Гарантия',
      value: [],
      units: 'мес'
    })
    for (let i = 0; i < categoryProducts.value.length; i++) {
      const product = categoryProducts.value[i]
      fields[0].value.push(product.img[0])
      fields[1].value.push(product.name)
      fields[2].value.push(Number(product.rating.toFixed(1)))
      fields[3].value.push(formatPrice(product.price))
      for (let j = 0; j < currentCategorySpecifications.value.length; j++) {
        const category = currentCategorySpecifications.value[j]
        let index = 4
        const specification = product.specifications.find((e, i) => {
          index = i + 4
          return e.categorySpecificationsId === category.id
        })
        if (!specification) continue
        const value = specification.valueNumber ?? specification.valueString
        if (!value) continue
        fields[index].value.push(value)
      }
      fields.at(-2)?.value.push(product.manufacturers.title)
      fields.at(-1)?.value.push(product.warranty)
    }
    return fields
  })

  const filteredProducts = computed(() => {
    const productsDataValue = productsData.value
    if (!showDifferences.value || categoryProducts.value.length <= 1) {
      return productsDataValue
    }
    let filtered = productsDataValue
    for (let i = 4; i < productsDataValue.length; i++) {
      const data = productsDataValue[i]
      if (data.value.every((e) => e === data.value[0])) {
        filtered = filtered.filter((e) => e.title !== data.title)
      }
    }
    return filtered
  })
  return { filteredProducts }
}
