export interface IdefaultValues {
  readonly id: number
  readonly created_at: Date
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
  sell: boolean
  manufacturerId: {
    id: number
    title: string
  }
}

export interface IproductU
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

export interface IproductC extends Omit<IproductU, 'sell'> {
  categoryId: number
}

//specifications

export interface IproductSpecificationC {
  productId: number
  value: string
  categorySpecificationsId: number
}

export interface IproductSpecificationU
  extends Omit<
    IproductSpecificationC,
    'categorySpecificationsId' | 'productId'
  > {
  id: number
}

export interface IproductSpecificationR
  extends Omit<IproductSpecificationC, 'categorySpecificationsId'>,
    IdefaultValues {
  categorySpecificationsId: {
    id: number
    title: string
    visible?: boolean
    units: string
  }
}

//category_specification
export interface IcategorySpecificationCU {
  categoryId: number
  title: string
  type: boolean
  visible: boolean
  units: string
  step?: number | null
  min?: number | null
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
export interface IcategoryC {
  title: string
  enTitle: string
  img: string
}

export interface IcategoryU extends IcategoryC {
  id: number
}

export interface IcategoryR extends IcategoryC, IdefaultValues {}

//users
export interface IuserC {
  id: string
  email: string
  name: string
  phone: number | null
  role: number
}

export interface IuserU extends Omit<IuserC, 'id'> {}

export interface IuserR extends IuserU, IdefaultValues {}

//manufacturers
export interface ImanufacturerCU {
  title: string
  img: string
  description: string
}

export interface ImanufacturerR extends ImanufacturerCU, IdefaultValues {}
