/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface Prompt {
  id?: number
  title: string
  content_zh?: string
  content_en?: string
  category?: string
  tags?: string | string[]
  collection_id?: number | null
  is_favorite?: boolean
  is_private?: boolean
  reference_images?: string | string[]
  created_at?: string
  updated_at?: string
}

interface Collection {
  id?: number
  name: string
  description?: string
  icon?: string
  color?: string
  created_at?: string
  updated_at?: string
}

interface Stats {
  prompts: number
  collections: number
  favorites: number
}

interface Window {
  api: {
    getPrompts: (params?: { category?: string; search?: string; favorites?: boolean; collectionId?: number; limit?: number; offset?: number }) => Promise<Prompt[]>
    getPrompt: (id: number) => Promise<Prompt | null>
    createPrompt: (prompt: Partial<Prompt>) => Promise<number>
    updatePrompt: (id: number, prompt: Partial<Prompt>) => Promise<void>
    deletePrompt: (id: number) => Promise<void>
    toggleFavorite: (id: number) => Promise<void>
    getCollections: () => Promise<Collection[]>
    createCollection: (collection: Partial<Collection>) => Promise<number>
    updateCollection: (id: number, collection: Partial<Collection>) => Promise<void>
    deleteCollection: (id: number) => Promise<void>
    getCategories: () => Promise<string[]>
    getStats: () => Promise<Stats>
    exportData: () => Promise<string | null>
    importData: () => Promise<{ prompts?: Prompt[]; collections?: Collection[] } | null>
  }
}
