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

export interface UpdateInfo {
  available: boolean
  version?: string
  releaseDate?: string
  releaseNotes?: string | string[]
  error?: string
}

export interface DownloadProgress {
  percent: number
  transferred: number
  total: number
}

const api = {
  // Window controls
  minimizeWindow: (): Promise<void> => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: (): Promise<boolean> => ipcRenderer.invoke('window:maximize'),
  closeWindow: (): Promise<void> => ipcRenderer.invoke('window:close'),
  isMaximized: (): Promise<boolean> => ipcRenderer.invoke('window:isMaximized'),

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

  getStoragePath: () => ipcRenderer.invoke('db:getStoragePath'),

  changeStoragePath: () => ipcRenderer.invoke('db:changeStoragePath'),

  purgeAllData: () => ipcRenderer.invoke('db:purgeAllData'),

  exportData: () => ipcRenderer.invoke('db:exportData'),

  importData: () => ipcRenderer.invoke('db:importData'),

  checkForUpdates: (): Promise<UpdateInfo> => 
    ipcRenderer.invoke('check-for-updates'),

  downloadUpdate: () => 
    ipcRenderer.invoke('download-update'),

  quitAndInstall: () => 
    ipcRenderer.invoke('quit-and-install'),

  onUpdateAvailable: (callback: (info: { version: string; releaseDate?: string; releaseNotes?: string | string[] }) => void) => {
    ipcRenderer.on('update-available', (_, info) => callback(info))
  },

  onUpdateDownloaded: (callback: () => void) => {
    ipcRenderer.on('update-downloaded', () => callback())
  },

  onUpdateError: (callback: (error: string) => void) => {
    ipcRenderer.on('update-error', (_, error) => callback(error))
  },

  onDownloadProgress: (callback: (progress: DownloadProgress) => void) => {
    ipcRenderer.on('download-progress', (_, progress) => callback(progress))
  },

  removeUpdateListeners: () => {
    ipcRenderer.removeAllListeners('update-available')
    ipcRenderer.removeAllListeners('update-downloaded')
    ipcRenderer.removeAllListeners('update-error')
    ipcRenderer.removeAllListeners('download-progress')
  }
}

contextBridge.exposeInMainWorld('api', api)

declare global {
  interface Window {
    api: typeof api
  }
}
