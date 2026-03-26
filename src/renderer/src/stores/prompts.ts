import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Prompt {
  id?: number
  title: string
  content_zh: string
  content_en: string
  category: string
  tags: string[]
  collection_id?: number | null
  is_favorite: boolean
  is_private: boolean
  reference_images: string[]
  reference_videos: string[]
  created_at?: string
  updated_at?: string
}

export interface Collection {
  id?: number
  name: string
  description?: string
  icon: string
  color: string
  created_at?: string
  updated_at?: string
}

export const usePromptStore = defineStore('prompts', () => {
  const prompts = ref<Prompt[]>([])
  const collections = ref<Collection[]>([])
  const currentPrompt = ref<Prompt | null>(null)
  const loading = ref(false)
  const searchQuery = ref('')
  const selectedCategory = ref('')
  const viewMode = ref<'grid' | 'list'>('grid')

  // ==================== 排序状态 ====================
  const sortBy = ref<string>('updated_at')
  const sortOrder = ref<string>('DESC')

  // 从 settings 恢复 viewMode 偏好
  async function loadViewMode() {
    const savedMode = await window.api.getSetting('viewMode')
    if (savedMode === 'grid' || savedMode === 'list') {
      viewMode.value = savedMode
    }
  }

  // 设置并持久化视图模式
  async function setViewMode(mode: 'grid' | 'list') {
    viewMode.value = mode
    await window.api.setSetting('viewMode', mode)
  }

  // 设置排序方式并重新获取数据
  function setSortOption(newSortBy: string, newSortOrder: string) {
    sortBy.value = newSortBy
    sortOrder.value = newSortOrder
    fetchPrompts()
  }

  const categories = computed(() => {
    const cats = new Set(prompts.value.map(p => p.category))
    return Array.from(cats).filter(Boolean)
  })

  const allTags = computed(() => {
    const tagSet = new Set<string>()
    prompts.value.forEach(p => {
      p.tags?.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  })

const filteredPrompts = computed(() => {
  let result = prompts.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.content_zh.toLowerCase().includes(q) ||
      p.content_en.toLowerCase().includes(q)
    )
  }
  if (selectedCategory.value) {
    result = result.filter(p => p.category === selectedCategory.value)
  }
  return result
})

async function fetchPrompts(params?: { favorites?: boolean; collectionId?: number }) {
  loading.value = true
  try {
    const data = await window.api.getPrompts({
      ...params,
      search: searchQuery.value || undefined,
      sortBy: sortBy.value,
      sortOrder: sortOrder.value
    })
    prompts.value = data.map((p: any) => ({
      ...p,
      tags: JSON.parse(p.tags || '[]'),
      reference_images: JSON.parse(p.reference_images || '[]'),
      reference_videos: JSON.parse(p.reference_videos || '[]'),
      is_favorite: Boolean(p.is_favorite),
      is_private: Boolean(p.is_private),
      content_zh: p.content_zh || '',
      content_en: p.content_en || ''
    }))
  } finally {
    loading.value = false
  }
}

  async function fetchCollections() {
    const data = await window.api.getCollections()
    collections.value = data.map((c: any) => ({
      ...c,
      icon: c.icon || 'folder',
      color: c.color || '#005bc1'
    }))
  }

async function fetchPrompt(id: number) {
  const data = await window.api.getPrompt(id)
  if (data) {
    currentPrompt.value = {
      ...data,
      category: data.category || 'Image Generation',
      content_zh: data.content_zh || '',
      content_en: data.content_en || '',
      tags: typeof data.tags === 'string' ? JSON.parse(data.tags || '[]') : (data.tags || []),
      reference_images: typeof data.reference_images === 'string' ? JSON.parse(data.reference_images || '[]') : (data.reference_images || []),
      reference_videos: typeof data.reference_videos === 'string' ? JSON.parse(data.reference_videos || '[]') : (data.reference_videos || []),
      is_favorite: Boolean(data.is_favorite),
      is_private: Boolean(data.is_private)
    }
  }
  return currentPrompt.value
}

async function createPrompt(prompt: Partial<Prompt>) {
  const serializablePrompt = JSON.parse(JSON.stringify(prompt))
  const id = await window.api.createPrompt(serializablePrompt)
  await fetchPrompts()
  return id
}

async function updatePrompt(id: number, prompt: Partial<Prompt>) {
  const serializablePrompt = JSON.parse(JSON.stringify(prompt))
  await window.api.updatePrompt(id, serializablePrompt)
  await fetchPrompts()
}

/**
 * 批量更新多个提示词
 * 用于批量添加到集合、批量移出集合、批量收藏等操作
 * 使用专门的批量 IPC 接口，避免逐条调用的性能问题
 */
async function batchUpdatePrompts(ids: number[], updates: Partial<Prompt>) {
  if (ids.length === 0) return
  // 序列化更新数据，避免 Vue 响应式代理导致的 IPC 序列化问题
  const serializableUpdates = JSON.parse(JSON.stringify(updates))
  await window.api.batchUpdatePrompts(ids, serializableUpdates)
  await fetchPrompts()
}

/**
 * 批量删除多个提示词
 * 使用专门的批量 IPC 接口，包含关联视频文件的清理
 */
async function batchDeletePrompts(ids: number[]) {
  if (ids.length === 0) return
  await window.api.batchDeletePrompts(ids)
  await fetchPrompts()
}

  async function deletePrompt(id: number) {
    // 先获取提示词信息，清理关联的视频文件
    const targetPrompt = prompts.value.find(p => p.id === id)
    if (targetPrompt?.reference_videos?.length) {
      for (const videoPath of targetPrompt.reference_videos) {
        await window.api.deleteVideo(videoPath)
      }
    }

    await window.api.deletePrompt(id)
    await fetchPrompts()
  }

  async function toggleFavorite(id: number) {
    await window.api.toggleFavorite(id)
    await fetchPrompts()
  }

async function createCollection(collection: Partial<Collection>) {
  const id = await window.api.createCollection(collection)
  await fetchCollections()
  return id
}

async function updateCollection(id: number, collection: Partial<Collection>) {
  await window.api.updateCollection(id, collection)
  await fetchCollections()
}

async function deleteCollection(id: number) {
    await window.api.deleteCollection(id)
    await fetchCollections()
    await fetchPrompts()
  }

  async function exportData() {
    return await window.api.exportData()
  }

  async function importData(): Promise<{ prompts?: any[]; collections?: any[] } | null> {
    const data = await window.api.importData()
    if (data) {
      await fetchPrompts()
      await fetchCollections()
    }
    return data
  }

  return {
    prompts,
    collections,
    currentPrompt,
    loading,
    searchQuery,
    selectedCategory,
    viewMode,
    sortBy,
    sortOrder,
    categories,
    allTags,
    filteredPrompts,
    fetchPrompts,
    fetchCollections,
    fetchPrompt,
    createPrompt,
    updatePrompt,
    batchUpdatePrompts,
    batchDeletePrompts,
    deletePrompt,
    toggleFavorite,
    createCollection,
    updateCollection,
    deleteCollection,
    exportData,
    importData,
    loadViewMode,
    setViewMode,
    setSortOption
  }
})
