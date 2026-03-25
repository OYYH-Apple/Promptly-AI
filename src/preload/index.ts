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
  reference_videos?: string[]
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
    sortBy?: string    // 排序字段：updated_at | created_at | title
    sortOrder?: string // 排序顺序：ASC | DESC
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

  // 设置项读写
  getSetting: (key: string): Promise<string | null> =>
    ipcRenderer.invoke('db:getSetting', key),
  setSetting: (key: string, value: string): Promise<boolean> =>
    ipcRenderer.invoke('db:setSetting', key, value),

  exportData: () => ipcRenderer.invoke('db:exportData'),

  importData: () => ipcRenderer.invoke('db:importData'),

  getAppVersion: (): Promise<string> =>
    ipcRenderer.invoke('get-app-version'),

  checkForUpdates: (): Promise<UpdateInfo> =>
    ipcRenderer.invoke('check-for-updates'),

  downloadUpdate: () => 
    ipcRenderer.invoke('download-update'),

  quitAndInstall: () => 
    ipcRenderer.invoke('quit-and-install'),

  // 查询当前更新状态（用于启动时恢复检查）
  getUpdateState: () =>
    ipcRenderer.invoke('get-update-state'),

  // 清理更新缓存（用于更新反复失败时手动清理）
  clearUpdateCache: () =>
    ipcRenderer.invoke('clear-update-cache'),

  // 忽略指定版本的更新
  ignoreUpdateVersion: (version: string) =>
    ipcRenderer.invoke('ignore-update-version', version),

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

  // 监听安装失败事件
  onInstallFailed: (callback: (data: { error: string }) => void) => {
    ipcRenderer.on('update-install-failed', (_, data) => callback(data))
  },

  // 监听启动时的安装失败恢复事件
  onInstallFailedRecovery: (callback: (data: { version: string; releaseNotes: string | null; lastAttemptTime: string | null }) => void) => {
    ipcRenderer.on('update-install-failed-recovery', (_, data) => callback(data))
  },

  removeUpdateListeners: () => {
    ipcRenderer.removeAllListeners('update-available')
    ipcRenderer.removeAllListeners('update-downloaded')
    ipcRenderer.removeAllListeners('update-error')
    ipcRenderer.removeAllListeners('download-progress')
    ipcRenderer.removeAllListeners('update-install-failed')
    ipcRenderer.removeAllListeners('update-install-failed-recovery')
  },

  // 视频文件操作
  saveVideo: (data: { fileName: string; filePath: string }) =>
    ipcRenderer.invoke('file:saveVideo', data),
  deleteVideo: (filePath: string) =>
    ipcRenderer.invoke('file:deleteVideo', filePath),

  sendFeedbackEmail: (feedback: { type: string; content: string; contact: string }) =>
    ipcRenderer.invoke('send-feedback-email', feedback)
}

contextBridge.exposeInMainWorld('api', api)

declare global {
  interface Window {
    api: typeof api
  }
}
