export interface IdefaultValues {
  id: number
  created_at: Date
}

//products
export interface IproductR extends IdefaultValues {
  categoryId: number
  name: string
  description: string
  img: string
  warranty: number
  price: number
  rating: number
  countReviews: number
  popularity: number
  quantity: number
  discount: number
  manufacturerId: {
    id: number
    title: string
  }
}

export interface IproductCU
  extends Omit<
    IproductR,
    | 'categoryId'
    | 'rating'
    | 'countReviews'
    | 'popularity'
    | 'manufacturerId'
    | 'id'
    | 'created_at'
  > {
  manufacturerId: number
}

//specifications

export interface IproductSpecificationCU {
  productId: number
  value: string
  categorySpecificationsId: number
}

export interface IproductSpecificationR
  extends Omit<IproductSpecificationCU, 'categorySpecificationsId'>,
    IdefaultValues {
  categorySpecificationsId: {
    title: string
    visible: boolean
    units: string
  }
}

export interface IproductSpecificationOnEditR
  extends Omit<IproductSpecificationCU, 'categorySpecificationsId'>,
    IdefaultValues {
  categorySpecificationsId: {
    title: string
    visible: boolean
    units: string
    type: boolean
    step: number | null
    min: number | null
    max: number
    variantsValues: string[] | null
  }
}

//productWithSpecifications
export interface IproductWithSpecifications extends IproductR {
  specifications: Omit<IproductSpecificationR, 'created_at'>[]
}

//category_specification
export interface IcategorySpecificationCU {
  categoryId: number
  title: string
  type: boolean
  visible: boolean
  units: string
  step?: number | null
  min: number
  max?: number | null
  variantsValues?: string[] | null
}

export interface IcategorySpecificationR
  extends IdefaultValues,
    Omit<IcategorySpecificationCU, 'step' | 'max' | 'variantsValues'> {
  step: number | null
  max: number | null
  variantsValues: string[] | null
}

//categories
export interface IcategorysCU {
  title: string
  enTitle: string
  img: string
}

export interface IcategoeiesR extends IcategorysCU, IdefaultValues {}

//users
export interface IuserCU {
  email: string
  name: string
  phone: number | null
  role: number
}

export interface IuserR extends IuserCU, IdefaultValues {}

//manufacturers
export interface ImanufacturerCU {
  title: string
  img: string
  description: string
}

export interface ImanufacturerR extends ImanufacturerCU, IdefaultValues {}
