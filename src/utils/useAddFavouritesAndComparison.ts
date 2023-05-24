import { storeToRefs } from 'pinia'
import { getOneById, updateOne } from './queries/db'
import { useUserStore } from '@/stores/userStore'

const { user } = storeToRefs(useUserStore())

let loading = true
export const useAddFavouritesAndComparison = async (
  listTitle: 'favourites' | 'comparison',
  productId: number,
  state: boolean,
  callbackOnAction: () => void
) => {
  if (!loading) return
  loading = false
  if (user.value) {
    const items =
      (await getOneById('users', user.value.id, { select: listTitle }))?.[
        listTitle
      ] || []

    const isItem = items.includes(productId)

    let itemState = false

    if ((!state && !isItem) || (state && isItem)) {
      const updatedItems: number[] = state
        ? items.filter((e) => e !== productId)
        : [...items, productId]
      const data = await updateOne('users', user.value.id, {
        [listTitle]: updatedItems
      })
      if (data) {
        user.value[listTitle] = data[listTitle]
        itemState = true
      }
    } else {
      user.value[listTitle] = items
      itemState = true
    }

    if (itemState) {
      callbackOnAction()
    }
  }
  loading = true
}
