import type { StorageError } from '@/utils/queries/storage'

export type InputFileActions<T extends string | string[] = string> = {
  clear: () => void
  onSave: () => Promise<
    | { url: T; error?: undefined }
    | { url?: undefined; error: StorageError }
    | undefined
  >
}
