import { useForm } from 'vee-validate'
import { number, string } from 'yup'

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
        name: string().required(),
        email: string().required().email(),
        phone: string().required().phone(),
        'receiptDetails.apartment': (v?: string) => {
          console.log('test', v)
          if (values.obtainType === 'selfcall') return true
          return number()
            .required()
            .validate(v)
            .then(() => true)
            .catch((e) => e.errors)
        },
        'receiptDetails.address': (value?: string | null) => {
          if (values.obtainType === 'selfcall') return true
          return string()
            .required()
            .validate(value)
            .then(() => true)
            .catch((e) => e.errors)
        },
        'receiptDetails.shopAddress': (v?: string | null) => {
          if (values.obtainType === 'delivery') return true
          return string()
            .notOneOf(['Выберите магазин'])
            .validate(v)
            .then(() => true)
            .catch((e) => e.errors)
        }
      }
    }
  )
  return { values, handleSubmit, setValues, setFieldValue }
}
