import { supabase } from '@/db/supabase'
import { getImgName } from '../../utils/getImgName'

export type Folder = 'categories' | 'manufacturers' | 'products'

export type StorageError = {
  error: string
  message: string
  statusCode: string
}

export const insertInStorage = async (
  folder: Folder,
  imageData: File
): Promise<
  { url: string; error: null } | { url: null; error: StorageError }
> => {
  const { error } = await supabase.storage
    .from('storage')
    .upload(`${folder}/${imageData.name}`, imageData, {
      cacheControl: '3600',
      upsert: false
    })
  if (error) {
    console.error(error)
    return {
      url: null,
      error: error as any
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
  imgUrl: string
): Promise<
  | { data: NonNullable<typeof data>; error: null }
  | { data: null; error: StorageError }
> => {
  const { data, error } = await supabase.storage
    .from('storage')
    .remove([`${folder}/${getImgName(imgUrl)}`])
  if (error) {
    console.error(error)
    return {
      data: null,
      error: error as any
    }
  }

  return { data, error }
}
