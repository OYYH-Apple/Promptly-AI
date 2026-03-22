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

  const categories = computed(() => {
    const cats = new Set(prompts.value.map(p => p.category))
    return Array.from(cats).filter(Boolean)
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
      search: searchQuery.value || undefined
    })
    prompts.value = data.map((p: any) => ({
      ...p,
      tags: JSON.parse(p.tags || '[]'),
      reference_images: JSON.parse(p.reference_images || '[]'),
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

  async function deletePrompt(id: number) {
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
    categories,
    filteredPrompts,
    fetchPrompts,
    fetchCollections,
    fetchPrompt,
    createPrompt,
    updatePrompt,
    deletePrompt,
    toggleFavorite,
    createCollection,
    deleteCollection,
    exportData,
    importData
  }
})
