import { ref, watch } from 'vue'
import { getOneById } from '@/db/queries/tables'
import { useUserStore } from '@/stores/userStore'
import type { Loading } from '@/types'
import type { OrderData } from './useFeatureForm'

export const useFeatureInitialUserDataInstallation = (
  setValues: (order: OrderData) => void,
  values: OrderData
) => {
  const loadingUserData = ref<Loading>('loading')
  const store = useUserStore()
  const watcher = watch(
    () => store.user,
    async (cur) => {
      if (!cur) {
        const isUser = await store.isUserAuthenticated()
        if (!isUser) watcher()
        loadingUserData.value = 'success'
        return
      }
      const { data, error } = await getOneById(
        'users',
        cur.id,
        'address, apartment, floor, entrance, city'
      )
      if (error) {
        loadingUserData.value = 'error'
        watcher()
        return
      }
      setValues({
        ...values,
        email: cur.email,
        name: cur.name,
        phone: cur.phone?.toString() ?? '',
        receiptDetails: {
          ...values.receiptDetails,
          city: data.city ?? 'Ульяновск',
          address: data.address ?? '',
          apartment: data.apartment,
          floor: data.floor,
          entrance: data.entrance
        }
      })
      loadingUserData.value = 'success'
      watcher()
    },
    { immediate: true }
  )
  return { loadingUserData }
}
