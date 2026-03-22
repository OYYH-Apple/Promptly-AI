<template>
  <section class="flex-1 overflow-y-auto p-10 bg-surface-container-low">
    <div class="max-w-7xl mx-auto">
      <nav class="flex items-center gap-2 text-sm text-on-surface-variant mb-6">
        <span @click="router.push('/collections')" class="hover:text-primary cursor-pointer transition-colors">Collections</span>
        <span class="material-symbols-outlined text-xs">chevron_right</span>
        <span class="font-medium text-on-surface">{{ collection?.name || 'Loading...' }}</span>
      </nav>

      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center"
              :style="{ backgroundColor: (collection?.color || '#005bc1') + '20', color: collection?.color || '#005bc1' }"
            >
              <span class="material-symbols-outlined text-2xl">{{ collection?.icon || 'folder' }}</span>
            </div>
            <h2 class="text-4xl font-bold tracking-tight text-on-surface">{{ collection?.name }}</h2>
            <span class="px-3 py-1 bg-surface-container-highest rounded-full text-xs font-bold text-on-surface-variant tracking-wider">
              {{ collectionPrompts.length }} PROMPTS
            </span>
          </div>
          <p class="text-on-surface-variant max-w-xl">{{ collection?.description || 'No description available.' }}</p>
        </div>
        <div class="flex items-center gap-3">
          <button
            @click="showAddPromptModal = true"
            class="bg-surface-container-lowest text-on-surface px-5 py-2.5 rounded-xl font-medium shadow-sm hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-2"
          >
            <span class="material-symbols-outlined text-[20px]">add_circle</span>
            Add Prompts
          </button>
          <button
            @click="editCollection"
            class="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-medium shadow-sm hover:bg-primary-dim active:scale-95 transition-all flex items-center gap-2"
          >
            <span class="material-symbols-outlined text-[20px]">edit</span>
            Edit Collection
          </button>
        </div>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-20">
        <span class="material-symbols-outlined animate-spin text-primary">progress_activity</span>
      </div>

      <div v-else-if="collectionPrompts.length === 0" class="text-center py-20">
        <span class="material-symbols-outlined text-6xl text-slate-300">folder_open</span>
        <p class="text-slate-500 mt-4">No prompts in this collection yet.</p>
        <button
          @click="showAddPromptModal = true"
          class="mt-4 px-6 py-2 bg-primary text-white rounded-xl font-medium"
        >
          Add Prompts
        </button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div
          v-for="(prompt, idx) in collectionPrompts"
          :key="prompt.id"
          class="group relative bg-surface-container-lowest p-5 rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 cursor-pointer"
          @click="router.push(`/prompt/${prompt.id}`)"
        >
          <div
            v-if="prompt.reference_images?.length"
            class="absolute -top-1.5 right-3 z-20"
          >
            <span
              class="material-symbols-outlined text-slate-400 text-3xl"
              style="font-variation-settings: 'wght' 200;"
            >attachment</span>
          </div>

          <div class="flex justify-between items-start mb-4">
            <div
              class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md"
              :class="getCategoryStyle(prompt.category).badge"
            >
              {{ prompt.category }}
            </div>
            <div
              v-if="prompt.reference_images?.length"
              class="w-16 h-16 rounded-lg overflow-hidden shadow-inner border border-slate-100 bg-slate-50 group-hover:rotate-0 transition-transform"
              :style="{ transform: `rotate(${thumbnailRotations[idx % thumbnailRotations.length]}deg)`, cursor: 'zoom-in' }"
              @click.stop="openImageViewer(prompt.reference_images, 0)"
            >
              <img
                :src="prompt.reference_images[0]"
                alt="Thumbnail"
                class="w-full h-full object-cover"
              />
            </div>
          </div>

          <h3 class="text-lg font-semibold text-on-surface mb-2 leading-snug">{{ prompt.title }}</h3>
          <p class="text-sm text-on-surface-variant line-clamp-2 mb-6">{{ prompt.content_zh || prompt.content_en }}</p>

          <div class="flex items-center justify-between pt-4 border-t border-slate-50">
            <span class="text-[11px] font-medium text-outline">{{ formatDate(prompt.updated_at) }}</span>
            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                @click.stop="copyPrompt(prompt)"
                class="p-1.5 rounded-full hover:bg-primary/10 transition-colors"
              >
                <span class="material-symbols-outlined text-primary-dim hover:text-primary text-lg">content_copy</span>
              </button>
              <button
                @click.stop="removeFromCollection(prompt)"
                class="p-1.5 rounded-full hover:bg-red-50 transition-colors"
              >
                <span class="material-symbols-outlined text-slate-400 hover:text-red-500 text-lg">remove_circle</span>
              </button>
            </div>
          </div>
        </div>

        <div
          @click="showAddPromptModal = true"
          class="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-slate-200 hover:border-primary/40 hover:bg-white transition-all cursor-pointer group min-h-[200px]"
        >
          <div class="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-primary/10 flex items-center justify-center mb-4 transition-colors">
            <span class="material-symbols-outlined text-slate-400 group-hover:text-primary">add</span>
          </div>
          <p class="font-semibold text-slate-500 group-hover:text-primary">New Prompt</p>
        </div>
      </div>
    </div>

    <ImageViewer
      v-model:visible="viewerVisible"
      :images="viewerImages"
      :initial-index="viewerIndex"
      @close="viewerVisible = false"
    />

    <div v-if="showAddPromptModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showAddPromptModal = false">
      <div class="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold">Add Prompts to "{{ collection?.name }}"</h3>
          <button @click="showAddPromptModal = false" class="p-2 hover:bg-slate-100 rounded-full">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="mb-4">
          <input
            v-model="promptSearchQuery"
            class="w-full px-4 py-2 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20"
            placeholder="Search prompts..."
          />
        </div>
        <div class="flex-1 overflow-y-auto space-y-2">
          <div
            v-for="prompt in availablePrompts"
            :key="prompt.id"
            class="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl hover:bg-surface-container transition-colors cursor-pointer"
            :class="{ 'ring-2 ring-primary bg-primary/5': selectedPromptIds.includes(prompt.id as number) }"
            @click="togglePromptSelection(prompt.id as number)"
          >
            <div class="flex-1 min-w-0">
              <p class="font-medium text-slate-900 truncate">{{ prompt.title }}</p>
              <p class="text-xs text-slate-500 truncate">{{ prompt.content_zh?.slice(0, 60) || prompt.content_en?.slice(0, 60) }}...</p>
            </div>
            <span
              v-if="prompt.collection_id === collection?.id"
              class="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full"
            >In collection</span>
            <span
              v-else-if="prompt.collection_id"
              class="text-xs px-2 py-1 bg-slate-100 text-slate-500 rounded-full"
            >In other</span>
          </div>
        </div>
        <div class="flex gap-3 mt-4 pt-4 border-t">
          <span class="text-sm text-slate-500">{{ selectedPromptIds.length }} selected</span>
          <div class="flex-1"></div>
          <button @click="showAddPromptModal = false" class="px-4 py-2 bg-surface-container-high rounded-xl font-medium">Cancel</button>
          <button
            @click="addPromptsToCollection"
            class="px-4 py-2 bg-primary text-white rounded-xl font-medium"
            :disabled="selectedPromptIds.length === 0"
          >
            Add {{ selectedPromptIds.length || '' }} Prompts
          </button>
        </div>
      </div>
    </div>

    <ConfirmDialog
      v-model:visible="showRemoveDialog"
      type="warning"
      title="Remove from Collection"
      :message="`Remove '${promptToRemove?.title}' from this collection? The prompt will not be deleted.`"
      confirm-text="Remove"
      cancel-text="Cancel"
      @confirm="handleRemove"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePromptStore } from '@/stores/prompts'
import ImageViewer from '@/components/ImageViewer.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const route = useRoute()
const router = useRouter()
const store = usePromptStore()

const collectionId = computed(() => Number(route.params.id))
const collection = ref<any>(null)
const loading = ref(true)
const showAddPromptModal = ref(false)
const showRemoveDialog = ref(false)
const promptToRemove = ref<any>(null)
const selectedPromptIds = ref<number[]>([])
const promptSearchQuery = ref('')
const viewerVisible = ref(false)
const viewerImages = ref<string[]>([])
const viewerIndex = ref(0)

const thumbnailRotations = [3, -2, 4, -3, 2, -4]

const collectionPrompts = computed(() => {
  return store.prompts.filter(p => p.collection_id === collectionId.value)
})

const availablePrompts = computed(() => {
  let prompts = store.prompts
  if (promptSearchQuery.value) {
    const q = promptSearchQuery.value.toLowerCase()
    prompts = prompts.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.content_zh?.toLowerCase().includes(q) ||
      p.content_en?.toLowerCase().includes(q)
    )
  }
  return prompts
})

const categoryStyles: Record<string, { icon: string; badge: string; bg: string; textColor: string }> = {
  'Image Generation': {
    icon: 'image',
    badge: 'bg-primary-container text-on-primary-container',
    bg: 'bg-primary-container',
    textColor: 'text-on-primary-container'
  },
  'Video Prompt': {
    icon: 'movie',
    badge: 'bg-tertiary-container text-on-tertiary-container',
    bg: 'bg-tertiary-container',
    textColor: 'text-on-tertiary-container'
  },
  'Coding': {
    icon: 'code',
    badge: 'bg-secondary-container text-on-secondary-container',
    bg: 'bg-secondary-container',
    textColor: 'text-on-secondary-container'
  },
  'General': {
    icon: 'text_snippet',
    badge: 'bg-surface-container-high text-on-surface-variant',
    bg: 'bg-surface-container-high',
    textColor: 'text-on-surface-variant'
  },
  'Concept Art': {
    icon: 'brush',
    badge: 'bg-amber-100 text-amber-700',
    bg: 'bg-amber-100',
    textColor: 'text-amber-700'
  },
  'Layout Design': {
    icon: 'web',
    badge: 'bg-emerald-100 text-emerald-700',
    bg: 'bg-emerald-100',
    textColor: 'text-emerald-700'
  }
}

function getCategoryStyle(category: string) {
  return categoryStyles[category] || categoryStyles['General']
}

function formatDate(date?: string) {
  if (!date) return ''
  const d = new Date(date)
  return `ED-${d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).replace(' ', '-')}`
}

async function copyPrompt(prompt: any) {
  const content = prompt.content_zh || prompt.content_en
  if (content) {
    await navigator.clipboard.writeText(content)
    showToast('Copied to clipboard', 'success')
  }
}

function openImageViewer(images: string[], index: number) {
  viewerImages.value = images
  viewerIndex.value = index
  viewerVisible.value = true
}

function togglePromptSelection(promptId: number) {
  const index = selectedPromptIds.value.indexOf(promptId)
  if (index > -1) {
    selectedPromptIds.value.splice(index, 1)
  } else {
    selectedPromptIds.value.push(promptId)
  }
}

async function addPromptsToCollection() {
  if (!collection.value || selectedPromptIds.value.length === 0) return

  for (const promptId of selectedPromptIds.value) {
    if (promptId !== undefined && promptId !== null) {
      await store.updatePrompt(promptId, { collection_id: collection.value.id })
    }
  }

  showAddPromptModal.value = false
  selectedPromptIds.value = []
  showToast('Prompts added to collection', 'success')
}

function removeFromCollection(prompt: any) {
  promptToRemove.value = prompt
  showRemoveDialog.value = true
}

async function handleRemove() {
  if (promptToRemove.value && promptToRemove.value.id) {
    await store.updatePrompt(promptToRemove.value.id, { collection_id: null })
    showToast('Removed from collection', 'success')
    promptToRemove.value = null
  }
}

function editCollection() {
  showToast('Edit collection feature coming soon', 'info')
}

function showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
  window.dispatchEvent(new CustomEvent('show-toast', {
    detail: { message, type, duration: 2000 }
  }))
}

async function loadCollection() {
  loading.value = true
  await store.fetchPrompts()
  await store.fetchCollections()
  collection.value = store.collections.find(c => c.id === collectionId.value)
  loading.value = false
}

watch(collectionId, () => {
  loadCollection()
})

onMounted(() => {
  loadCollection()
})
</script>
