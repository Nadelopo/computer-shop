import { useForm } from 'vee-validate'
import { number, string } from '@/utils/validator'

export type ReceiptDetails = {
  city: string | null
  address: string | null
  apartment: number | null
  floor: number | null
  entrance: number | null
  shopAddress: string | null
  deliveryDate: Date
}

export type OrderData = {
  name: string
  email: string
  phone: string
  obtainType: 'selfcall' | 'delivery'
  receiptDetails: ReceiptDetails
}

export const useFeatureForm = () => {
  const { values, handleSubmit, setValues, setFieldValue } = useForm<OrderData>(
    {
      initialValues: {
        name: '',
        email: '',
        phone: '',
        obtainType: 'selfcall',
        receiptDetails: {
          apartment: null,
          floor: null,
          entrance: null,
          address: null,
          city: 'Ульяновск',
          deliveryDate: new Date(new Date().setDate(new Date().getDate() + 1)),
          shopAddress: null
        }
      },
      validationSchema: {
        name: (value?: string) => {
          return string(value).required().valid()
        },
        email: (value?: string) => {
          return string(value).required().email().valid()
        },
        phone: (value?: string) => {
          if (value?.length !== 17) return 'Поле должно содержать 11 цифр'
          return true
        },
        'receiptDetails.apartment': async (value?: number | null) => {
          if (values.obtainType === 'selfcall') return true
          return number(value).required().valid()
        },
        'receiptDetails.address': (value?: string | null) => {
          if (values.obtainType === 'selfcall') return true
          return string(value).required().valid()
        },
        'receiptDetails.shopAddress': async (value: string) => {
          if (values.obtainType === 'delivery') return true
          return string(value).notEqual('Выберите магазин').valid()
        }
      }
    }
  )
  return { values, handleSubmit, setValues, setFieldValue }
}
