import { storeToRefs } from 'pinia'
import { getOneById, updateOne } from './queries/db'
import { useUserStore } from '@/stores/userStore'
import { useToast } from 'vue-toastification'
import { localStorageGet, localStorageSet } from './localStorage'

const { user } = storeToRefs(useUserStore())
const toast = useToast()

export const useAddFavouritesAndComparison = async (
  listTitle: 'favourites' | 'comparison',
  productId: number,
  state: boolean,
  onClick: () => void
) => {
  if (!user.value && listTitle === 'favourites') {
    toast.warning('Требуется авторизация')
    return
  }
  let items: number[] = []
  if (user.value) {
    items =
      (await getOneById('users', user.value.id, { select: listTitle }))?.[
        listTitle
      ] || []
  } else {
    const storageComapreList = localStorageGet<number[]>('compareList') || []
    storageComapreList.push(productId)
    items = [...new Set(storageComapreList)]
  }

  const isItem = items.includes(productId)

  let itemState = false

  if ((!state && !isItem) || (state && isItem)) {
    const updatedItems: number[] = state
      ? items.filter((e) => e !== productId)
      : [...items, productId]
    if (user.value) {
      const data = await updateOne('users', user.value.id, {
        [listTitle]: updatedItems
      })
      if (data) {
        user.value[listTitle] = data[listTitle]
        itemState = true
      }
    } else {
      localStorageSet('compareList', updatedItems)
      itemState = true
    }
  } else {
    if (user.value) {
      user.value[listTitle] = items
      itemState = true
    } else {
      localStorageSet('compareList', items)
      itemState = true
    }
  }

  if (itemState) {
    onClick()
  }
}
