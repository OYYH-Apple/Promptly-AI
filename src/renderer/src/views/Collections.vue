<template>
  <section class="flex-1 overflow-y-auto p-10 bg-surface">
    <div class="max-w-7xl mx-auto">
      <div class="flex items-end justify-between mb-12">
        <div>
          <h2 class="text-3xl font-bold tracking-tight text-on-surface mb-2">Collections</h2>
          <p class="text-on-surface-variant">Organize your AI workflows into semantic workspaces.</p>
        </div>
        <button 
          @click="showCreateModal = true"
          class="px-4 py-2.5 bg-surface-container-high text-slate-900 font-medium text-sm rounded-xl flex items-center gap-2 hover:bg-surface-container-highest transition-all"
        >
          <span class="material-symbols-outlined text-[20px]">add</span>
          New Collection
        </button>
      </div>

      <div v-if="store.loading" class="flex items-center justify-center py-20">
        <span class="material-symbols-outlined animate-spin text-primary">progress_activity</span>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <button 
          @click="router.push('/create')"
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
          class="group bg-surface-container-lowest rounded-xl p-6 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between border border-transparent hover:border-slate-100"
        >
          <div>
            <div class="flex justify-between items-start mb-6">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center" :style="{ backgroundColor: collection.color + '20', color: collection.color }">
                <span class="material-symbols-outlined text-2xl">{{ collection.icon }}</span>
              </div>
              <button @click="confirmDelete(collection)" class="text-slate-300 hover:text-red-500 transition-colors">
                <span class="material-symbols-outlined">delete</span>
              </button>
            </div>
            <h4 class="text-lg font-semibold text-slate-900">{{ collection.name }}</h4>
            <p class="text-sm text-slate-500 mt-1">{{ collection.description || 'No description' }}</p>
          </div>
          <div class="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
            <div class="flex flex-col">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Prompts</span>
              <span class="text-sm font-semibold text-slate-900">{{ getCollectionCount(collection.id!) }}</span>
            </div>
            <button class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90">
              Open
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showCreateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showCreateModal = false">
      <div class="bg-white rounded-2xl p-8 w-full max-w-md">
        <h3 class="text-xl font-bold mb-6">Create Collection</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input v-model="newCollection.name" class="w-full px-4 py-2 bg-surface-container-low border-none rounded-xl" placeholder="Collection name..." />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <input v-model="newCollection.description" class="w-full px-4 py-2 bg-surface-container-low border-none rounded-xl" placeholder="Optional description..." />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Icon</label>
            <select v-model="newCollection.icon" class="w-full px-4 py-2 bg-surface-container-low border-none rounded-xl">
              <option value="folder">Folder</option>
              <option value="architecture">Architecture</option>
              <option value="code">Code</option>
              <option value="palette">Palette</option>
              <option value="campaign">Marketing</option>
              <option value="camera_roll">Camera</option>
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
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePromptStore } from '@/stores/prompts'

const router = useRouter()
const store = usePromptStore()
const showCreateModal = ref(false)
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

function getCollectionCount(id: number) {
  return collectionCounts.value[id] || 0
}

async function createCollection() {
  if (!newCollection.value.name.trim()) return
  await store.createCollection(newCollection.value)
  showCreateModal.value = false
  newCollection.value = { name: '', description: '', icon: 'folder', color: '#005bc1' }
}

function confirmDelete(collection: any) {
  if (confirm(`Delete "${collection.name}"? Prompts in this collection will not be deleted.`)) {
    store.deleteCollection(collection.id!)
  }
}

onMounted(() => {
  store.fetchPrompts()
  store.fetchCollections()
})
</script>
