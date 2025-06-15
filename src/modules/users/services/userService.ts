import { supabase } from '@/shared/api'

export type ListTitle = 'favourites' | 'comparison'

export const updateUserList = async (
  listTitle: ListTitle,
  userId: string,
  products: number[]
) => {
  return supabase
    .from('users')
    .update({ [listTitle]: products })
    .eq('id', userId)
}

export const getUserList = async <T extends ListTitle>(listTitle: T, userId: string) =>
  supabase.from('users').select(listTitle).eq('id', userId).single()
