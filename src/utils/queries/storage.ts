import { supabase } from '@/supabase'

export type Folder = 'categories' | 'manufacturers' | 'products'

export const insertInStorage = async (
  folder: Folder,
  imageData: File
): Promise<
  { url: string; error: null } | { url: null; error: NonNullable<typeof error> }
> => {
  const { error } = await supabase.storage
    .from('storage')
    .upload(`${folder}/${imageData.name}`, imageData, {
      cacheControl: '3600',
      upsert: false
    })
  if (error) {
    console.log(error)
    return {
      url: null,
      error
    }
  }

  const {
    data: { publicUrl }
  } = supabase.storage
    .from('storage')
    .getPublicUrl(`${folder}/${imageData.name}`)

  return { url: publicUrl, error: null }
}

export const removeFromStorage = async (
  folder: Folder,
  imgName: string
): Promise<
  | { data: NonNullable<typeof data>; error: null }
  | { data: null; error: NonNullable<typeof error> }
> => {
  const { data, error } = await supabase.storage
    .from('storage')
    .remove([`${folder}/${imgName}`])
  if (error) {
    console.log(error)
    return {
      data: null,
      error
    }
  }

  return { data, error }
}
