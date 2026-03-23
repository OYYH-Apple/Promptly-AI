<template>
  <section class="flex-1 overflow-y-auto p-10 bg-surface">
    <div class="max-w-7xl mx-auto">
      <div class="flex flex-col gap-8">
        <div class="flex justify-between items-end">
          <div>
            <span class="text-xs font-bold tracking-widest text-primary uppercase mb-2 block">Library Overview</span>
            <h2 class="text-3xl font-semibold tracking-tight text-slate-900">Prompt Collections</h2>
            <p class="text-slate-500 mt-2">Organize your AI workflows into semantic workspaces.</p>
          </div>
          <div class="flex gap-3">
            <button
              class="px-4 py-2.5 rounded-xl bg-surface-container-highest text-slate-900 font-medium text-sm flex items-center gap-2 hover:bg-slate-200 transition-all"
            >
              <span class="material-symbols-outlined text-[20px]">filter_list</span>
              Filter
            </button>
          </div>
        </div>

        <div v-if="store.loading" class="flex items-center justify-center py-20">
          <span class="material-symbols-outlined animate-spin text-primary">progress_activity</span>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <button
            @click="showCreateModal = true"
            class="group relative h-full min-h-[220px] rounded-xl border-2 border-dashed border-slate-200 hover:border-primary/40 hover:bg-primary/[0.02] transition-all flex flex-col items-center justify-center gap-4"
          >
            <div class="w-12 h-12 rounded-full bg-primary/5 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <span class="material-symbols-outlined text-3xl">add</span>
            </div>
            <div class="text-center">
              <span class="block font-semibold text-slate-900">New Collection</span>
              <span class="text-xs text-slate-400">Create a focused workspace</span>
            </div>
          </button>

          <div
            v-for="collection in store.collections"
            :key="collection.id"
            class="group bg-surface-container-lowest rounded-xl p-6 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between border border-transparent hover:border-slate-100 cursor-pointer"
            @click="openCollection(collection)"
          >
            <div>
              <div class="flex justify-between items-start mb-6">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center" :style="{ backgroundColor: collection.color + '20', color: collection.color }">
                  <span class="material-symbols-outlined text-2xl">{{ collection.icon }}</span>
                </div>
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    @click.stop="showAddPromptDialog(collection)"
                    class="p-2 rounded-full hover:bg-primary/10 transition-colors"
                    title="Add prompts to collection"
                  >
                    <span class="material-symbols-outlined text-primary">add_circle</span>
                  </button>
                  <button
                    @click.stop="confirmDelete(collection)"
                    class="p-2 rounded-full hover:bg-red-50 transition-colors"
                    title="Delete collection"
                  >
                    <span class="material-symbols-outlined text-slate-400 hover:text-red-500">delete</span>
                  </button>
                </div>
              </div>
              <h4 class="text-lg font-semibold text-slate-900">{{ collection.name }}</h4>
              <p class="text-sm text-slate-500 mt-1">{{ collection.description || 'No description' }}</p>
            </div>
            <div class="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
              <div class="flex flex-col">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Prompts</span>
                <span class="text-sm font-semibold text-slate-900">{{ getCollectionCount(collection.id!) }} items</span>
              </div>
              <div class="text-right">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Updated</span>
                <span class="text-sm text-slate-600 block">{{ formatDate(collection.updated_at) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-8 bg-surface-container-low rounded-2xl p-8 flex items-center justify-around">
          <div class="text-center">
            <span class="block text-2xl font-bold text-slate-900">{{ store.collections.length }}</span>
            <span class="text-xs font-medium text-slate-500 uppercase tracking-widest">Collections</span>
          </div>
          <div class="w-px h-8 bg-slate-200"></div>
          <div class="text-center">
            <span class="block text-2xl font-bold text-slate-900">{{ totalPrompts }}</span>
            <span class="text-xs font-medium text-slate-500 uppercase tracking-widest">Active Prompts</span>
          </div>
          <div class="w-px h-8 bg-slate-200"></div>
          <div class="text-center">
            <span class="block text-2xl font-bold text-slate-900">{{ totalFavorites }}</span>
            <span class="text-xs font-medium text-slate-500 uppercase tracking-widest">Favorites</span>
          </div>
        </div>
      </div>
    </div>

    <button
      class="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-primary text-white shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
      @click="showCreateModal = true"
    >
      <span class="material-symbols-outlined">add</span>
    </button>

    <div v-if="showCreateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showCreateModal = false">
      <div class="bg-white rounded-2xl p-8 w-full max-w-md">
        <h3 class="text-xl font-bold mb-6">Create Collection</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input v-model="newCollection.name" class="w-full px-4 py-2 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20" placeholder="Collection name..." />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <input v-model="newCollection.description" class="w-full px-4 py-2 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20" placeholder="Optional description..." />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Icon</label>
            <select v-model="newCollection.icon" class="w-full px-4 py-2 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20">
              <option value="folder">Folder</option>
              <option value="architecture">Architecture</option>
              <option value="code">Code</option>
              <option value="palette">Palette</option>
              <option value="campaign">Marketing</option>
              <option value="camera_roll">Camera</option>
              <option value="image">Image</option>
              <option value="movie">Video</option>
              <option value="brush">Art</option>
              <option value="web">Design</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Color</label>
            <input v-model="newCollection.color" type="color" class="w-full h-10 rounded-xl cursor-pointer" />
          </div>
        </div>
        <div class="flex gap-3 mt-6">
          <button @click="showCreateModal = false" class="flex-1 px-4 py-2 bg-surface-container-high rounded-xl font-medium">Cancel</button>
          <button @click="createCollection" class="flex-1 px-4 py-2 bg-primary text-white rounded-xl font-medium">Create</button>
        </div>
      </div>
    </div>

<AddPromptModal
    v-model:visible="showAddPromptModal"
    :collection-id="selectedCollection?.id || 0"
    :collection-name="selectedCollection?.name || ''"
    @added="handlePromptsAdded"
  />

  <ConfirmDialog
      v-model:visible="showDeleteDialog"
      type="danger"
      title="Delete Collection"
      :message="`Are you sure you want to delete '${collectionToDelete?.name}'? Prompts in this collection will not be deleted.`"
      confirm-text="Delete"
      cancel-text="Cancel"
      @confirm="handleDelete"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePromptStore } from '@/stores/prompts'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import AddPromptModal from '@/components/AddPromptModal.vue'

const router = useRouter()
const store = usePromptStore()
const showCreateModal = ref(false)
const showDeleteDialog = ref(false)
const showAddPromptModal = ref(false)
const collectionToDelete = ref<any>(null)
const selectedCollection = ref<any>(null)
const newCollection = ref({ name: '', description: '', icon: 'folder', color: '#005bc1' })

const collectionCounts = computed(() => {
  const counts: Record<number, number> = {}
  store.prompts.forEach(p => {
    if (p.collection_id) {
      counts[p.collection_id] = (counts[p.collection_id] || 0) + 1
    }
  })
  return counts
})

const totalPrompts = computed(() => store.prompts.length)
const totalFavorites = computed(() => store.prompts.filter(p => p.is_favorite).length)

function getCollectionCount(id: number) {
  return collectionCounts.value[id] || 0
}

function formatDate(date?: string) {
  if (!date) return 'Never'
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function openCollection(collection: any) {
  router.push(`/collection/${collection.id}`)
}

async function createCollection() {
  if (!newCollection.value.name.trim()) return
  await store.createCollection({
    name: newCollection.value.name,
    description: newCollection.value.description,
    icon: newCollection.value.icon,
    color: newCollection.value.color
  })
  showCreateModal.value = false
  newCollection.value = { name: '', description: '', icon: 'folder', color: '#005bc1' }
}

function confirmDelete(collection: any) {
  collectionToDelete.value = collection
  showDeleteDialog.value = true
}

async function handleDelete() {
  if (collectionToDelete.value) {
    await store.deleteCollection(collectionToDelete.value.id!)
    collectionToDelete.value = null
  }
}

function showAddPromptDialog(collection: any) {
  selectedCollection.value = collection
  showAddPromptModal.value = true
}

function handlePromptsAdded() {
  selectedCollection.value = null
  showToast('Prompts added to collection', 'success')
}

function showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
  window.dispatchEvent(new CustomEvent('show-toast', {
    detail: { message, type, duration: 2000 }
  }))
}

onMounted(() => {
  store.fetchPrompts()
  store.fetchCollections()
})
</script>
