import { supabase } from '@/supabase'

export const insertInStorage = async (
  folder: string,
  imageData: File
): Promise<string | null> => {
  let value = null
  const { data, error } = await supabase.storage
    .from('storage')
    .upload(`${folder}/${imageData.name}`, imageData, {
      cacheControl: '3600',
      upsert: false,
    })
  if (error) console.log(error)
  if (data) {
    const { publicURL, error: errorUrl } = await supabase.storage
      .from('storage')
      .getPublicUrl(`${folder}/${imageData.name}`)
    if (errorUrl) console.log(errorUrl)
    value = publicURL
  }

  return value
}
