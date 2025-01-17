import type {
  CartCreate,
  CartRead,
  CartUpdate
} from '@/types/tables/cart.types'
import type {
  CategoryCreate,
  CategoryRead,
  CategoryUpdate
} from '@/types/tables/categories.types'
import type {
  CategorySpecificationCreate,
  CategorySpecificationRead,
  CategorySpecificationUpdate
} from '@/types/tables/categorySpecifications.types'
import type {
  ManufacturerCreate,
  ManufacturerRead,
  ManufacturerUpdate
} from '@/types/tables/manufacturers.types'
import type {
  ProductCreate,
  ProductRead,
  ProductUpdate
} from '@/types/tables/products.types'
import type {
  ReviewCreate,
  ReviewRead,
  ReviewUpdate
} from '@/types/tables/reviews.types'
import type {
  SpecificationCreate,
  SpecificationRead,
  SpecificationUpdate
} from '@/types/tables/specifications.types'
import type {
  UserCreate,
  UserReadWithDetails,
  UserUpdate
} from '@/types/tables/users.types'
import type {
  ShopCreate,
  ShopRead,
  ShopUpdate
} from '../types/tables/shops.types'
import type {
  OrderCreate,
  OrderRead,
  OrderUpdate
} from '../types/tables/orders.types'
import type {
  OrderedProductCreate,
  OrderedProductRead,
  OrderedProductUpdate
} from '../types/tables/orderedProducts.types'
import type {
  ProductQuantityInStoreRead,
  ProductQuantityInStoreCreate,
  ProductQuantityInStoreUpdate
} from '@/types/tables/ProductQuantityInStores'

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      cart: {
        Row: CartRead
        Insert: CartCreate
        Update: CartUpdate
        Relationships: [
          {
            foreignKeyName: 'cart_productId_fkey'
            columns: ['productId']
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'cart_userId_fkey'
            columns: ['userId']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      categories: {
        Row: CategoryRead
        Insert: CategoryCreate
        Update: CategoryUpdate
        Relationships: []
      }
      category_specifications: {
        Row: CategorySpecificationRead
        Insert: CategorySpecificationCreate
        Update: CategorySpecificationUpdate
        Relationships: [
          {
            foreignKeyName: 'category_specifications_categoryId_fkey'
            columns: ['categoryId']
            referencedRelation: 'categories'
            referencedColumns: ['id']
          }
        ]
      }
      manufacturers: {
        Row: ManufacturerRead
        Insert: ManufacturerCreate
        Update: ManufacturerUpdate
        Relationships: []
      }
      products: {
        Row: ProductRead
        Insert: ProductCreate
        Update: ProductUpdate
        Relationships: [
          {
            foreignKeyName: 'products_categoryId_fkey'
            columns: ['categoryId']
            referencedRelation: 'categories'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'products_manufacturerId_fkey'
            columns: ['manufacturerId']
            referencedRelation: 'manufacturers'
            referencedColumns: ['id']
          }
        ]
      }
      reviews: {
        Row: ReviewRead
        Insert: ReviewCreate
        Update: ReviewUpdate
        Relationships: [
          {
            foreignKeyName: 'reviews_categoryId_fkey'
            columns: ['categoryId']
            referencedRelation: 'categories'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reviews_productId_fkey'
            columns: ['productId']
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reviews_userId_fkey'
            columns: ['userId']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      specifications: {
        Row: SpecificationRead
        Insert: SpecificationCreate
        Update: SpecificationUpdate
        Relationships: [
          {
            foreignKeyName: 'specifications_categorySpecificationsId_fkey'
            columns: ['categorySpecificationsId']
            referencedRelation: 'category_specifications'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'specifications_productId_fkey'
            columns: ['productId']
            referencedRelation: 'products'
            referencedColumns: ['id']
          }
        ]
      }
      users: {
        Row: UserReadWithDetails
        Insert: UserCreate
        Update: UserUpdate
        Relationships: []
      }
      shops: {
        Row: ShopRead
        Insert: ShopCreate
        Update: ShopUpdate
        Relationships: []
      }
      product_quantity_in_stores: {
        Row: ProductQuantityInStoreRead
        Insert: ProductQuantityInStoreCreate
        Update: ProductQuantityInStoreUpdate
        Relationships: [
          {
            foreignKeyName: 'product_quantity_in_stores_productId_fkey'
            columns: ['productId']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'product_quantity_in_stores_shopId_fkey'
            columns: ['shopId']
            isOneToOne: false
            referencedRelation: 'shops'
            referencedColumns: ['id']
          }
        ]
      }
      orders: {
        Row: OrderRead
        Insert: OrderCreate
        Update: OrderUpdate
        Relationships: [
          {
            foreignKeyName: 'orders_shopAddress_fkey'
            columns: ['shopAddress']
            isOneToOne: false
            referencedRelation: 'shops'
            referencedColumns: ['address']
          },
          {
            foreignKeyName: 'orders_userId_fkey'
            columns: ['userId']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      ordered_products: {
        Row: OrderedProductRead
        Insert: OrderedProductCreate
        Update: OrderedProductUpdate
        Relationships: [
          {
            foreignKeyName: 'public_ordered_products_productId_fkey'
            columns: ['productId']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'public_ordered_products_orderId_fkey'
            columns: ['orderId']
            isOneToOne: false
            referencedRelation: 'orders'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      distinct_categories: {
        Row: CategoryRead & {
          manufacturerId: number
          repetitionCount: number
          manufacturerTitle: string
        }
        Relationships: []
      }
    }
    Functions: {
      gtrgm_compress: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gtrgm_in: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      gtrgm_options: {
        Args: {
          '': unknown
        }
        Returns: undefined
      }
      gtrgm_out: {
        Args: {
          '': unknown
        }
        Returns: unknown
      }
      set_limit: {
        Args: {
          '': number
        }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: {
          '': string
        }
        Returns: unknown
      }
    }
    Enums: {
      category_specification_condition: 'greater' | 'less'
      category_specification_type: 'number' | 'string' | 'union'
      // prettier-ignore
      order_status: 'processing'| 'shipped' | 'canceled' | 'returned' | 'completed' | 'waiting in store'
      // prettier-ignore
      order_payment_status: 'pending' | 'processing' | 'paid' | 'failed' | 'canceled' | 'refunded'
      order_type: 'selfcall' | 'delivery'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Table = keyof Database['public']['Tables']

export type CreateData<T extends Table> =
  Database['public']['Tables'][T]['Insert']

export type UpdateData<T extends Table> =
  Database['public']['Tables'][T]['Update']

export type View<T extends keyof Database['public']['Views']> =
  Database['public']['Views'][T]['Row']

export type DbEnum<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]
