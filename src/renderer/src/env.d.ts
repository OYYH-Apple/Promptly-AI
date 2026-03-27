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
  reference_videos?: string[]
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

interface UpdateInfo {
  available: boolean
  version?: string
  releaseDate?: string
  releaseNotes?: string | string[]
  error?: string
}

interface DownloadProgress {
  percent: number
  transferred: number
  total: number
}

interface Window {
  api: {
    // Window controls
    minimizeWindow: () => Promise<void>
    maximizeWindow: () => Promise<boolean>
    closeWindow: () => Promise<void>
    isMaximized: () => Promise<boolean>

    getPrompts: (params?: { category?: string; search?: string; favorites?: boolean; collectionId?: number; limit?: number; offset?: number; sortBy?: string; sortOrder?: string }) => Promise<Prompt[]>
    getPrompt: (id: number) => Promise<Prompt | null>
    createPrompt: (prompt: Partial<Prompt>) => Promise<number>
    updatePrompt: (id: number, prompt: Partial<Prompt>) => Promise<void>
    deletePrompt: (id: number) => Promise<void>
    /**
     * 批量更新多个提示词
     * 用于批量添加到集合、批量移出集合、批量收藏等操作
     */
    batchUpdatePrompts: (ids: number[], updates: Partial<Prompt>) => Promise<boolean>
    /**
     * 批量删除多个提示词
     * 包含关联视频文件的清理
     */
    batchDeletePrompts: (ids: number[]) => Promise<boolean>
    toggleFavorite: (id: number) => Promise<void>
    getCollections: () => Promise<Collection[]>
    createCollection: (collection: Partial<Collection>) => Promise<number>
    updateCollection: (id: number, collection: Partial<Collection>) => Promise<void>
    deleteCollection: (id: number) => Promise<void>
    getCategories: () => Promise<string[]>
    getStats: () => Promise<Stats>
    getStoragePath: () => Promise<string>
    changeStoragePath: () => Promise<{ oldPath: string; newPath: string } | null>
    purgeAllData: () => Promise<boolean>
    getSetting: (key: string) => Promise<string | null>
    setSetting: (key: string, value: string) => Promise<boolean>
    exportData: () => Promise<string | null>
    importData: () => Promise<{ prompts?: Prompt[]; collections?: Collection[] } | null>
    getAppVersion: () => Promise<string>
    checkForUpdates: () => Promise<UpdateInfo>
    downloadUpdate: () => Promise<{ success: boolean; error?: string }>
    quitAndInstall: () => Promise<void>
    getUpdateState: () => Promise<{
      pendingUpdateVersion: string | null
      pendingReleaseNotes: string | null
      lastInstallAttemptFailed: boolean
      lastInstallAttemptTime: string | null
      ignoredVersion: string | null
    }>
    clearUpdateCache: () => Promise<{ success: boolean; error?: string }>
    ignoreUpdateVersion: (version: string) => Promise<{ success: boolean }>
    onUpdateAvailable: (callback: (info: { version: string; releaseDate?: string; releaseNotes?: string | string[] }) => void) => void
    onUpdateDownloaded: (callback: () => void) => void
    onUpdateError: (callback: (error: string) => void) => void
    onDownloadProgress: (callback: (progress: DownloadProgress) => void) => void
    onInstallFailed: (callback: (data: { error: string }) => void) => void
    onInstallFailedRecovery: (callback: (data: { version: string; releaseNotes: string | null; lastAttemptTime: string | null }) => void) => void
    removeUpdateListeners: () => void
    saveVideo: (data: { fileName: string; filePath: string }) => Promise<string>
    deleteVideo: (filePath: string) => Promise<boolean>
    // 视频缩略图生成：传入视频路径，返回缩略图 Base64 字符串或 null
    generateThumbnail: (videoPath: string) => Promise<string | null>
    sendFeedbackEmail: (feedback: { type: string; content: string; contact: string }) => Promise<{ success: boolean; messageId?: string; error?: string }>
  }
}
