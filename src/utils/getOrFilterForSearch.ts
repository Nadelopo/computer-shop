import { formatSearch } from './formatSearch'
import {
  translateKeysEnToRu,
  translateKeysRuToEn
} from './translateKeyboardKeys'

export const getOrFilterForSearch = (search: string, column: string) => {
  const filter = column + '.ilike'
  return `${filter}.${formatSearch(search)},${filter}.${formatSearch(
    translateKeysEnToRu(search)
  )},${filter}.${formatSearch(translateKeysRuToEn(search))}`
}
