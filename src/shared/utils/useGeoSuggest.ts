type GeoObjectType =
  | 'biz'
  | 'geo'
  | 'street'
  | 'metro'
  | 'district'
  | 'locality'
  | 'area'
  | 'province'
  | 'country'
  | 'house'

type Params = {
  text: string
  type?: GeoObjectType
}

export type LocationResult = {
  suggest_reqid: string
  results?: {
    title: {
      text: string
      hl?: { begin: number; end: number }[]
    }
    subtitle?: { text: string; hl: { begin: number; end: number }[] }
    tags: string[]
    distance: { value: number; text: string }
  }[]
}

const api = `https://suggest-maps.yandex.ru/v1/suggest?apikey=${
  import.meta.env.VITE_GEO_KEY
}&`

export const useGeoSuggest = async (params: Params) => {
  try {
    const type = params.type ? `&types=${params.type}` : ''
    const response = await fetch(`${api}text=${params.text}${type}`)
    const result: LocationResult = await response.json()
    return {
      data: result.results ?? null,
      error: null,
      empty: !result.results
    }
  } catch (error) {
    console.error(error)
    return { data: null, error, empty: null }
  }
}
