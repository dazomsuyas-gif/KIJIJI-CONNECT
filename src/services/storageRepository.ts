export interface StorageRepository {
  read<T>(key: string, fallback: T): T
  write<T>(key: string, value: T): void
}

export class LocalStorageRepository implements StorageRepository {
  read<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback

    try {
      const storedValue = window.localStorage.getItem(key)
      return storedValue ? (JSON.parse(storedValue) as T) : fallback
    } catch (error) {
      console.error(`Could not read ${key} from local storage.`, error)
      return fallback
    }
  }

  write<T>(key: string, value: T): void {
    window.localStorage.setItem(key, JSON.stringify(value))
  }
}

export const storageRepository = new LocalStorageRepository()
