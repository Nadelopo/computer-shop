import { storeToRefs } from 'pinia'
import { getOneById, updateOne } from './queries/db'
import { useUserStore } from '@/stores/userStore'

const { user } = storeToRefs(useUserStore())

let loading = true
export const useAddToFavourites = async (
  productId: number,
  state: boolean,
  callbackOnAction: () => void
) => {
  if (!loading) return
  loading = false
  if (user.value) {
    const favourites =
      (await getOneById('users', user.value.id, { select: 'favourites' }))
        ?.favourites || []

    const isFavourite = favourites.includes(productId)

    let itemState = false

    let updatedFavouries: number[] = []
    if (state && isFavourite) {
      updatedFavouries = favourites.filter((e) => e !== productId)
    }
    if (!state && !isFavourite) {
      updatedFavouries = [...favourites, productId]
    }
    if ((!state && !isFavourite) || (state && isFavourite)) {
      const data = await updateOne('users', user.value.id, {
        favourites: updatedFavouries
      })
      if (data) {
        user.value.favourites = data.favourites
        itemState = true
      }
    }
    if ((state && !isFavourite) || (!state && isFavourite)) {
      user.value.favourites = favourites
      itemState = true
    }

    if (itemState) {
      callbackOnAction()
    }
  }
  loading = true
}
