import type { StorageError } from '@/shared/api'

export type InputFileActions<T extends string | string[] = string> = {
  clear: () => void
  onSave: () => Promise<
    { url: T; error?: undefined } | { url?: undefined; error: StorageError } | undefined
  >
}
