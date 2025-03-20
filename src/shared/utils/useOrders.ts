import type { DbEnum } from '@/db/database.types'

const statusMappings = {
  completed: 'Завершен',
  canceled: 'Отменен',
  processing: 'В процессе',
  returned: 'Возвращен',
  shipped: 'Отправлен',
  'waiting in store': 'Ожидает в магазине'
} as const
const getStatus = (status: DbEnum<'order_status'>): string => {
  return statusMappings[status] || ''
}

const paymentStatusMappings: Record<DbEnum<'order_payment_status'>, string> = {
  pending: 'В ожидании',
  processing: 'Обрабатывается',
  paid: 'Оплачено',
  failed: 'Ошибка',
  canceled: 'Отменено',
  refunded: 'Возвращено'
}
const getPaymentStatus = (status: DbEnum<'order_payment_status'>): string => {
  return paymentStatusMappings[status] || ''
}

export const useOrders = () => {
  return { getStatus, getPaymentStatus, statusMappings, paymentStatusMappings }
}
