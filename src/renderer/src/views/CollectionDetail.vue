<template>
  <section class="flex-1 overflow-y-auto p-10 bg-surface-container-low">
    <div class="max-w-7xl mx-auto">
      <nav class="flex items-center gap-2 text-sm text-on-surface-variant mb-6">
        <span @click="router.push('/collections')"
          class="hover:text-primary cursor-pointer transition-colors">Collections</span>
        <span class="material-symbols-outlined text-xs">chevron_right</span>
        <span class="font-medium text-on-surface">{{ collection?.name || 'Loading...' }}</span>
      </nav>

      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center"
              :style="{ backgroundColor: (collection?.color || '#005bc1') + '20', color: collection?.color || '#005bc1' }">
              <span class="material-symbols-outlined text-2xl">{{ collection?.icon || 'folder' }}</span>
            </div>
            <h2 class="text-4xl font-bold tracking-tight text-on-surface">{{ collection?.name }}</h2>
            <span
              class="px-3 py-1 bg-surface-container-highest rounded-full text-xs font-bold text-on-surface-variant tracking-wider">
              {{ collectionPrompts.length }} PROMPTS
            </span>
          </div>
          <p class="text-on-surface-variant max-w-xl">{{ collection?.description || 'No description available.' }}</p>
        </div>
        <div class="flex items-center gap-3">
          <button @click="showAddPromptModal = true"
            class="bg-surface-container-lowest text-on-surface px-5 py-2.5 rounded-xl font-medium shadow-sm hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-2">
            <span class="material-symbols-outlined text-[20px]">add_circle</span>
            Add Prompts
          </button>
          <button @click="editCollection"
            class="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-medium shadow-sm hover:bg-primary-dim active:scale-95 transition-all flex items-center gap-2">
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
        <button @click="showAddPromptModal = true" class="mt-4 px-6 py-2 bg-primary text-white rounded-xl font-medium">
          Add Prompts
        </button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <PromptCard v-for="(prompt, idx) in collectionPrompts" :key="prompt.id" :prompt="prompt" :rotation-index="idx"
          @click="router.push(`/prompt/${prompt.id}`)" @copy="copyPrompt" @open-image="openImageViewer">
          <template #actions="slotProps">
            <button @click.stop="copyPrompt(slotProps.prompt)"
              class="p-1.5 rounded-full hover:bg-primary/10 transition-colors">
              <span class="material-symbols-outlined text-primary-dim hover:text-primary text-lg">content_copy</span>
            </button>
            <button @click.stop="removeFromCollection(slotProps.prompt)"
              class="p-1.5 rounded-full hover:bg-red-50 transition-colors">
              <span class="material-symbols-outlined text-slate-400 hover:text-red-500 text-lg">remove_circle</span>
            </button>
          </template>
        </PromptCard>

        <div @click="showAddPromptModal = true"
          class="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-slate-200 hover:border-primary/40 hover:bg-white transition-all cursor-pointer group min-h-[200px]">
          <div
            class="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-primary/10 flex items-center justify-center mb-4 transition-colors">
            <span class="material-symbols-outlined text-slate-400 group-hover:text-primary">add</span>
          </div>
          <p class="font-semibold text-slate-500 group-hover:text-primary">New Prompt</p>
        </div>
      </div>
    </div>

<ImageViewer v-model:visible="viewerVisible" :images="viewerImages" :initial-index="viewerIndex"
    @close="viewerVisible = false" />

  <AddPromptModal
    v-model:visible="showAddPromptModal"
    :collection-id="collectionId"
    :collection-name="collection?.name || ''"
    @added="handlePromptsAdded"
  />

  <ConfirmDialog v-model:visible="showRemoveDialog" type="warning" title="Remove from Collection"
      :message="`Remove '${promptToRemove?.title}' from this collection? The prompt will not be deleted.`"
      confirm-text="Remove" cancel-text="Cancel" @confirm="handleRemove" />
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePromptStore } from '@/stores/prompts'
import ImageViewer from '@/components/ImageViewer.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import PromptCard from '@/components/PromptCard.vue'
import AddPromptModal from '@/components/AddPromptModal.vue'

const route = useRoute()
const router = useRouter()
const store = usePromptStore()

const collectionId = computed(() => Number(route.params.id))
const collection = ref<any>(null)
const loading = ref(true)
const showAddPromptModal = ref(false)
const showRemoveDialog = ref(false)
const promptToRemove = ref<any>(null)
const viewerVisible = ref(false)
const viewerImages = ref<string[]>([])
const viewerIndex = ref(0)

const collectionPrompts = computed(() => {
  return store.prompts.filter(p => p.collection_id === collectionId.value)
})

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

function handlePromptsAdded() {
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
