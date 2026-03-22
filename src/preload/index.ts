import { contextBridge, ipcRenderer } from 'electron'

export interface Prompt {
  id?: number
  title: string
  content: string
  category?: string
  tags?: string[]
  collection_id?: number | null
  is_favorite?: boolean
  reference_images?: string[]
  created_at?: string
  updated_at?: string
}

export interface Collection {
  id?: number
  name: string
  description?: string
  icon?: string
  color?: string
  created_at?: string
  updated_at?: string
}

export interface Stats {
  prompts: number
  collections: number
  favorites: number
}

const api = {
  getPrompts: (params: {
    category?: string
    search?: string
    favorites?: boolean
    collectionId?: number
    limit?: number
    offset?: number
  }) => ipcRenderer.invoke('db:getPrompts', params),

  getPrompt: (id: number) => ipcRenderer.invoke('db:getPrompt', id),

  createPrompt: (prompt: Partial<Prompt>) => ipcRenderer.invoke('db:createPrompt', prompt),

  updatePrompt: (id: number, prompt: Partial<Prompt>) => ipcRenderer.invoke('db:updatePrompt', id, prompt),

  deletePrompt: (id: number) => ipcRenderer.invoke('db:deletePrompt', id),

  toggleFavorite: (id: number) => ipcRenderer.invoke('db:toggleFavorite', id),

  getCollections: () => ipcRenderer.invoke('db:getCollections'),

  createCollection: (collection: Partial<Collection>) => ipcRenderer.invoke('db:createCollection', collection),

  updateCollection: (id: number, collection: Partial<Collection>) => ipcRenderer.invoke('db:updateCollection', id, collection),

  deleteCollection: (id: number) => ipcRenderer.invoke('db:deleteCollection', id),

  getCategories: () => ipcRenderer.invoke('db:getCategories'),

  getStats: () => ipcRenderer.invoke('db:getStats'),

  exportData: () => ipcRenderer.invoke('db:exportData'),

  importData: () => ipcRenderer.invoke('db:importData')
}

contextBridge.exposeInMainWorld('api', api)

declare global {
  interface Window {
    api: typeof api
  }
}
