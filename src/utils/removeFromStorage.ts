import { supabase } from '@/supabase'

export const removeFromStorage = async (
  folder: string,
  imgName: string
): Promise<boolean> => {
  let value = false
  const { data, error } = await supabase.storage
    .from('storage')
    .remove([`${folder}/${imgName}`])
  if (error) console.log(error)
  if (data) value = true

  return value
}
