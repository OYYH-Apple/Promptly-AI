<template>
  <section class="flex-1 overflow-y-auto p-10 bg-surface-container-low">
    <div class="max-w-7xl mx-auto space-y-12">
      <nav class="flex items-center gap-2 text-sm text-on-surface-variant mb-6">
        <span @click="router.push('/collections')" class="hover:text-primary cursor-pointer transition-colors">{{
          t('nav.collections') }}</span>
        <span class="material-symbols-outlined text-xs">chevron_right</span>
        <span class="font-medium text-on-surface">{{ collection?.name || t('common.loading') }}</span>
      </nav>

      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center"
              :style="{ backgroundColor: (collection?.color || '#005bc1') + '20', color: collection?.color || '#005bc1' }">
              <span class="material-symbols-outlined text-2xl">{{ collection?.icon || 'folder' }}</span>
            </div>
            <h2 class="text-4xl font-bold tracking-tight text-on-surface">{{ collection?.name }}</h2>
            <span
              class="px-3 py-1 bg-surface-container-highest rounded-full text-xs font-bold text-on-surface-variant tracking-wider">
              {{ collectionPrompts.length }} {{ t('collectionDetail.promptsCount') }}
            </span>
          </div>
          <p class="text-on-surface-variant max-w-xl">{{ collection?.description || t('collectionDetail.noDescription')
            }}</p>
        </div>
        <div class="flex items-center gap-3">
          <button @click="showAddPromptModal = true"
            class="bg-surface-container-lowest text-on-surface px-5 py-2.5 rounded-xl font-medium shadow-sm hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-2">
            <span class="material-symbols-outlined text-[20px] transition-all hover:rotate-90">add_circle</span>
            {{ t('collectionDetail.addPrompts') }}
          </button>
          <button @click="editCollection"
            class="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-medium shadow-sm hover:bg-primary-dim active:scale-95 transition-all flex items-center gap-2">
            <span class="material-symbols-outlined text-[20px]">edit</span>
            {{ t('collectionDetail.editCollection') }}
          </button>
        </div>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-20">
        <span class="material-symbols-outlined animate-spin text-primary">progress_activity</span>
      </div>

      <div v-else-if="collectionPrompts.length === 0" class="text-center py-20">
        <span class="material-symbols-outlined text-6xl text-slate-300">folder_open</span>
        <p class="text-slate-500 mt-4">{{ t('collectionDetail.noPromptsInCollection') }}</p>
        <button @click="showAddPromptModal = true" class="mt-4 px-6 py-2 bg-primary text-white rounded-xl font-medium">
          {{ t('collectionDetail.addPrompts') }}
        </button>
      </div>

      <template v-else>
        <PromptSection :title="t('library.imagePrompts')" icon="image" icon-color="#005bc1" :items="imagePrompts"
          :show-add-button="false">
          <template #default="{ items }">
            <PromptCard v-for="(prompt, idx) in items" :key="prompt.id" :prompt="prompt" :rotation-index="idx"
              @click="router.push(`/prompt/${prompt.id}`)" @copy="copyPrompt" @open-image="openImageViewer">
              <template #actions="slotProps">
                <Tooltip :text="t('tooltip.copy')" placement="top">
                  <button @click.stop="copyPrompt(slotProps.prompt)"
                    class="p-1.5 rounded-full hover:bg-primary/10 transition-colors">
                    <span
                      class="material-symbols-outlined text-primary-dim hover:text-primary text-lg">content_copy</span>
                  </button>
                </Tooltip>
                <Tooltip :text="t('tooltip.edit')" placement="top">
                  <button @click.stop="router.push(`/edit/${slotProps.prompt.id}`)"
                    class="p-1.5 rounded-full hover:bg-primary/10 transition-colors">
                    <span class="material-symbols-outlined text-slate-400 hover:text-primary text-lg">edit</span>
                  </button>
                </Tooltip>
                <Tooltip :text="t('tooltip.removeFromCollection')" placement="top">
                  <button @click.stop="removeFromCollection(slotProps.prompt)"
                    class="p-1.5 rounded-full hover:bg-red-50 transition-colors">
                    <span
                      class="material-symbols-outlined text-slate-400 hover:text-red-500 hover:rotate-180 transition-all text-lg">remove_circle</span>
                  </button>
                </Tooltip>
              </template>
            </PromptCard>
          </template>
        </PromptSection>

        <PromptSection :title="t('library.videoPrompts')" icon="movie" icon-color="#5f5c78" :items="videoPrompts"
          :show-add-button="false">
          <template #default="{ items }">
            <PromptCard v-for="(prompt, idx) in items" :key="prompt.id" :prompt="prompt" :rotation-index="idx"
              @click="router.push(`/prompt/${prompt.id}`)" @copy="copyPrompt" @open-image="openImageViewer">
              <template #actions="slotProps">
                <Tooltip :text="t('tooltip.copy')" placement="top">
                  <button @click.stop="copyPrompt(slotProps.prompt)"
                    class="p-1.5 rounded-full hover:bg-primary/10 transition-colors">
                    <span
                      class="material-symbols-outlined text-primary-dim hover:text-primary text-lg">content_copy</span>
                  </button>
                </Tooltip>
                <Tooltip :text="t('tooltip.edit')" placement="top">
                  <button @click.stop="router.push(`/edit/${slotProps.prompt.id}`)"
                    class="p-1.5 rounded-full hover:bg-primary/10 transition-colors">
                    <span class="material-symbols-outlined text-slate-400 hover:text-primary text-lg">edit</span>
                  </button>
                </Tooltip>
                <Tooltip :text="t('tooltip.removeFromCollection')" placement="top">
                  <button @click.stop="removeFromCollection(slotProps.prompt)"
                    class="p-1.5 rounded-full hover:bg-red-50 transition-colors">
                    <span
                      class="material-symbols-outlined text-slate-400 hover:text-red-500 text-lg">remove_circle</span>
                  </button>
                </Tooltip>
              </template>
            </PromptCard>
          </template>
        </PromptSection>
      </template>
    </div>

    <ImageViewer v-model:visible="viewerVisible" :images="viewerImages" :initial-index="viewerIndex"
      @close="viewerVisible = false" />

    <AddPromptModal v-model:visible="showAddPromptModal" :collection-id="collectionId"
      :collection-name="collection?.name || ''" @added="handlePromptsAdded" />

    <div v-if="showEditModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="closeEditModal">
      <div class="bg-white rounded-2xl p-8 w-full max-w-md">
        <h3 class="text-xl font-bold mb-6">{{ t('collectionModal.editTitle') }}</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">{{ t('collectionModal.name') }}</label>
            <input v-model="editForm.name"
              class="w-full px-4 py-2 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20"
              :class="{ 'ring-2 ring-red-500': editFormErrors.name }"
              :placeholder="t('collectionModal.namePlaceholder')" />
            <p v-if="editFormErrors.name" class="mt-1 text-sm text-red-500">{{ editFormErrors.name }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">{{ t('collectionModal.description') }}</label>
            <input v-model="editForm.description"
              class="w-full px-4 py-2 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20"
              :class="{ 'ring-2 ring-red-500': editFormErrors.description }"
              :placeholder="t('collectionModal.descriptionPlaceholder')" />
            <p v-if="editFormErrors.description" class="mt-1 text-sm text-red-500">{{ editFormErrors.description }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">{{ t('collectionModal.icon') }}</label>
            <div class="grid grid-cols-5 gap-2">
              <button v-for="icon in availableIcons" :key="icon.value" @click="editForm.icon = icon.value"
                class="w-10 h-10 rounded-lg flex items-center justify-center transition-all"
                :class="editForm.icon === icon.value ? 'bg-primary text-white ring-2 ring-primary' : 'bg-surface-container-low text-slate-600 hover:bg-surface-container'"
                :title="icon.label">
                <span class="material-symbols-outlined">{{ icon.value }}</span>
              </button>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">{{ t('collectionModal.color') }}</label>
            <input v-model="editForm.color" type="color" class="w-50 h-10 rounded-md cursor-pointer p-1" />
          </div>
        </div>
        <div class="flex gap-3 mt-6">
          <button @click="closeEditModal" class="flex-1 px-4 py-2 bg-surface-container-high rounded-xl font-medium">{{
            t('dialog.cancel') }}</button>
          <button @click="saveEditCollection" class="flex-1 px-4 py-2 bg-primary text-white rounded-xl font-medium">{{
            t('dialog.save') }}</button>
        </div>
      </div>
    </div>

    <ConfirmDialog v-model:visible="showRemoveDialog" type="warning" :title="t('dialog.removeFromCollectionTitle')"
      :message="t('dialog.removeFromCollectionMessage', { title: promptToRemove?.title })"
      :confirm-text="t('dialog.remove')" :cancel-text="t('dialog.cancel')" @confirm="handleRemove" />
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePromptStore } from '@/stores/prompts'
import ImageViewer from '@/components/ImageViewer.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import PromptCard from '@/components/PromptCard.vue'
import PromptSection from '@/components/PromptSection.vue'
import AddPromptModal from '@/components/AddPromptModal.vue'
import Tooltip from '@/components/Tooltip.vue'

const route = useRoute()
const router = useRouter()
const store = usePromptStore()
const { t } = useI18n()

const collectionId = computed(() => Number(route.params.id))
const collection = ref<any>(null)
const loading = ref(true)
const showAddPromptModal = ref(false)
const showRemoveDialog = ref(false)
const showEditModal = ref(false)
const promptToRemove = ref<any>(null)
const viewerVisible = ref(false)
const viewerImages = ref<string[]>([])
const viewerIndex = ref(0)
const editForm = ref({ name: '', description: '', icon: 'folder', color: '#005bc1' })
const editFormErrors = ref<{ name?: string; description?: string }>({})

const availableIcons = [
  { value: 'folder', label: 'Folder' },
  { value: 'architecture', label: 'Architecture' },
  { value: 'code', label: 'Code' },
  { value: 'palette', label: 'Palette' },
  { value: 'campaign', label: 'Marketing' },
  { value: 'camera_roll', label: 'Camera' },
  { value: 'image', label: 'Image' },
  { value: 'movie', label: 'Video' },
  { value: 'brush', label: 'Art' },
  { value: 'web', label: 'Design' }
]

const collectionPrompts = computed(() => {
  return store.prompts.filter(p => p.collection_id === collectionId.value)
})

const imagePrompts = computed(() => {
  return collectionPrompts.value.filter(p => p.category === 'Image Generation')
})

const videoPrompts = computed(() => {
  return collectionPrompts.value.filter(p => p.category === 'Video Prompt')
})

async function copyPrompt(prompt: any) {
  const content = prompt.content_zh || prompt.content_en
  if (content) {
    await navigator.clipboard.writeText(content)
    showToast(t('toast.copied'), 'success')
  }
}

function openImageViewer(images: string[], index: number) {
  viewerImages.value = images
  viewerIndex.value = index
  viewerVisible.value = true
}

function handlePromptsAdded() {
  showToast(t('toast.promptsAddedToCollection'), 'success')
}

function removeFromCollection(prompt: any) {
  promptToRemove.value = prompt
  showRemoveDialog.value = true
}

async function handleRemove() {
  if (promptToRemove.value && promptToRemove.value.id) {
    await store.updatePrompt(promptToRemove.value.id, { collection_id: null })
    showToast(t('toast.removedFromCollection'), 'success')
    promptToRemove.value = null
  }
}

function editCollection() {
  if (collection.value) {
    editForm.value = {
      name: collection.value.name || '',
      description: collection.value.description || '',
      icon: collection.value.icon || 'folder',
      color: collection.value.color || '#005bc1'
    }
    editFormErrors.value = {}
    showEditModal.value = true
  }
}

// 关闭编辑弹窗并重置表单
function closeEditModal() {
  showEditModal.value = false
  editFormErrors.value = {}
}

// 编辑表单校验
function validateEditForm(): boolean {
  editFormErrors.value = {}
  const name = editForm.value.name.trim()

  // 名称必填校验
  if (!name) {
    editFormErrors.value.name = t('toast.collectionNameRequired')
    showToast(t('toast.collectionNameRequired'), 'error')
    return false
  }

  // 名称长度校验（最多50个字符）
  if (name.length > 50) {
    editFormErrors.value.name = t('toast.maxLength', { field: t('collectionModal.name'), count: 50 })
    showToast(t('toast.maxLength', { field: t('collectionModal.name'), count: 50 }), 'error')
    return false
  }

  // 描述长度校验（最多200个字符）
  if (editForm.value.description && editForm.value.description.length > 200) {
    editFormErrors.value.description = t('toast.maxLength', { field: t('collectionModal.description'), count: 200 })
    showToast(t('toast.maxLength', { field: t('collectionModal.description'), count: 200 }), 'error')
    return false
  }

  return true
}

async function saveEditCollection() {
  // 执行表单校验
  if (!validateEditForm() || !collection.value) return

  await store.updateCollection(collection.value.id, {
    name: editForm.value.name.trim(),
    description: editForm.value.description.trim(),
    icon: editForm.value.icon,
    color: editForm.value.color
  })

  collection.value = store.collections.find(c => c.id === collectionId.value)
  showEditModal.value = false
  editFormErrors.value = {}
  showToast(t('toast.collectionUpdated'), 'success')
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
