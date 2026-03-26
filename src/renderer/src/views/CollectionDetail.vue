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
          <!-- 批量选择入口按钮 - 与排序按钮样式一致 -->
          <button v-if="!isBatchMode" @click="enterBatchMode"
            class="px-4 py-1.5 bg-surface-container-low text-on-surface-variant rounded-lg text-sm font-medium hover:bg-surface-container-high transition-colors flex items-center gap-1">
            <span class="material-symbols-outlined text-base">check_box</span>
            {{ t('batch.select') }}
          </button>
          <template v-if="!isBatchMode">
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
          </template>
        </div>
      </div>

      <!-- 批量操作工具栏 - 放到下一行 -->
      <div v-if="isBatchMode" class="flex items-center gap-3 flex-wrap">
        <!-- 全选/取消全选按钮 -->
        <button @click="toggleSelectAll"
          class="px-4 py-1.5 bg-surface-container-low text-on-surface-variant rounded-lg text-sm font-medium hover:bg-surface-container-high transition-colors flex items-center gap-1">
          <span class="material-symbols-outlined text-base">
            {{ isAllSelected ? 'deselect' : 'select_all' }}
          </span>
          {{ isAllSelected ? t('batch.deselectAll') : t('batch.selectAll') }}
        </button>
        <span class="text-sm text-on-surface-variant">
          {{ t('batch.selectedCount', { count: selectedPrompts.length }) }}
        </span>
        <!-- 批量从集合移除 -->
        <button @click="handleBatchRemoveFromCollection" :disabled="selectedPrompts.length === 0"
          class="px-4 py-1.5 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed">
          <span class="material-symbols-outlined text-sm">remove_circle</span>
          {{ t('batch.removeFromCollection') }}
        </button>
        <!-- 批量删除 -->
        <button @click="handleBatchDelete" :disabled="selectedPrompts.length === 0"
          class="px-4 py-1.5 bg-error text-white rounded-lg text-sm font-medium hover:bg-error/90 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed">
          <span class="material-symbols-outlined text-sm">delete</span>
          {{ t('batch.delete') }}
        </button>
        <button @click="exitBatchMode"
          class="px-4 py-1.5 bg-surface-container-high text-on-surface-variant rounded-lg text-sm font-medium hover:bg-surface-container transition-colors">
          {{ t('batch.cancel') }}
        </button>
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
          :show-add-button="false" :expanded="expandAllSections">
          <template #default="{ items }">
            <PromptCard v-for="(prompt, idx) in items" :key="prompt.id" :prompt="prompt" :rotation-index="idx"
              :is-selected="isPromptSelected(prompt.id)" :is-batch-mode="isBatchMode"
              @click="!isBatchMode && router.push(`/prompt/${prompt.id}`)" @select="togglePromptSelection"
              @toggle-favorite="!isBatchMode && store.toggleFavorite(prompt.id as number)"
              @toggle-private="(p: Prompt) => !isBatchMode && handleTogglePrivate(p)"
              @copy="(p: Prompt) => !isBatchMode && copyPrompt(p)" @open-image="(imgs, vids, idx) => openImageViewer(imgs, vids, idx)"
              @edit="(id: number | undefined) => !isBatchMode && handleEdit(id)"
              @delete="(id: number | undefined) => !isBatchMode && handleDelete(id)" />
          </template>
        </PromptSection>

        <PromptSection :title="t('library.videoPrompts')" icon="movie" icon-color="#5f5c78" :items="videoPrompts"
          :show-add-button="false" :expanded="expandAllSections">
          <template #default="{ items }">
            <PromptCard v-for="(prompt, idx) in items" :key="prompt.id" :prompt="prompt" :rotation-index="idx"
              :is-selected="isPromptSelected(prompt.id)" :is-batch-mode="isBatchMode"
              @click="!isBatchMode && router.push(`/prompt/${prompt.id}`)" @select="togglePromptSelection"
              @toggle-favorite="!isBatchMode && store.toggleFavorite(prompt.id as number)"
              @toggle-private="(p: Prompt) => !isBatchMode && handleTogglePrivate(p)"
              @copy="(p: Prompt) => !isBatchMode && copyPrompt(p)" @open-image="(imgs, vids, idx) => openImageViewer(imgs, vids, idx)"
              @edit="(id: number | undefined) => !isBatchMode && handleEdit(id)"
              @delete="(id: number | undefined) => !isBatchMode && handleDelete(id)" />
          </template>
        </PromptSection>
      </template>
    </div>

    <MediaViewer v-model:visible="viewerVisible" :images="viewerImages" :videos="viewerVideos" :initial-index="viewerIndex"
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
    <!-- 隐私切换确认对话框 -->
    <ConfirmDialog v-model:visible="showPrivacyDialog" type="warning"
      :title="privacyPrompt?.is_private ? t('dialog.makePublicTitle') : t('dialog.makePrivateTitle')"
      :message="privacyPrompt?.is_private ? t('dialog.makePublicMessage') : t('dialog.makePrivateMessage')"
      :confirm-text="privacyPrompt?.is_private ? t('dialog.makePublicTitle') : t('dialog.makePrivateTitle')"
      :cancel-text="t('dialog.cancel')" @confirm="confirmTogglePrivate" />
    <!-- 删除确认对话框 -->
    <ConfirmDialog v-model:visible="showDeleteDialog" type="danger" :title="t('dialog.deletePromptTitle')"
      :message="t('dialog.deletePromptMessage')" :confirm-text="t('dialog.delete')" :cancel-text="t('dialog.cancel')"
      @confirm="confirmDelete" />
    <!-- 批量删除确认对话框 -->
    <ConfirmDialog v-model:visible="showBatchDeleteDialog" type="danger" :title="t('dialog.batchDeleteTitle')"
      :message="t('dialog.batchDeleteMessage', { count: selectedPrompts.length })" :confirm-text="t('dialog.delete')"
      :cancel-text="t('dialog.cancel')" @confirm="confirmBatchDelete" />
    <!-- 批量从集合移除确认对话框 -->
    <ConfirmDialog v-model:visible="showBatchRemoveDialog" type="warning" :title="t('batch.removeFromCollection')"
      :message="t('batch.confirmRemoveFromCollection', { count: selectedPrompts.length })"
      :confirm-text="t('dialog.remove')" :cancel-text="t('dialog.cancel')"
      @confirm="confirmBatchRemoveFromCollection" />
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePromptStore, type Prompt } from '@/stores/prompts'
import MediaViewer from '@/components/MediaViewer.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import PromptCard from '@/components/PromptCard.vue'
import PromptSection from '@/components/PromptSection.vue'
import AddPromptModal from '@/components/AddPromptModal.vue'


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
const viewerVideos = ref<string[]>([])
const viewerIndex = ref(0)
const editForm = ref({ name: '', description: '', icon: 'folder', color: '#005bc1' })
const editFormErrors = ref<{ name?: string; description?: string }>({})

// ==================== 隐私切换与删除功能 ====================
const showPrivacyDialog = ref(false)
const privacyPrompt = ref<Prompt | null>(null)
const showDeleteDialog = ref(false)
const promptToDelete = ref<Prompt | null>(null)

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

// ==================== 批量操作功能 ====================
const isBatchMode = ref(false)
const selectedPrompts = ref<number[]>([])
const showBatchDeleteDialog = ref(false)
const showBatchRemoveDialog = ref(false)
const expandAllSections = ref(false)

// 进入批量模式
function enterBatchMode() {
  isBatchMode.value = true
  selectedPrompts.value = []
  // 进入批量模式时展开所有分区，方便选择
  expandAllSections.value = true
}

// 退出批量模式
function exitBatchMode() {
  isBatchMode.value = false
  selectedPrompts.value = []
  expandAllSections.value = false
}

// 切换单个提示词的选中状态
function togglePromptSelection(promptId: number | undefined) {
  if (!promptId) return
  const index = selectedPrompts.value.indexOf(promptId)
  if (index === -1) {
    selectedPrompts.value.push(promptId)
  } else {
    selectedPrompts.value.splice(index, 1)
  }
}

// 判断提示词是否被选中
function isPromptSelected(promptId: number | undefined): boolean {
  if (!promptId) return false
  return selectedPrompts.value.includes(promptId)
}

// 是否全选
const isAllSelected = computed(() => {
  const allIds = collectionPrompts.value.map(p => p.id).filter((id): id is number => id !== undefined)
  return allIds.length > 0 && selectedPrompts.value.length === allIds.length
})

// 全选/取消全选
function toggleSelectAll() {
  const allIds = collectionPrompts.value.map(p => p.id).filter((id): id is number => id !== undefined)
  if (isAllSelected.value) {
    selectedPrompts.value = []
    expandAllSections.value = false
  } else {
    selectedPrompts.value = [...allIds]
    expandAllSections.value = true
  }
}

// 批量删除处理
function handleBatchDelete() {
  if (selectedPrompts.value.length === 0) return
  showBatchDeleteDialog.value = true
}

// 确认批量删除
async function confirmBatchDelete() {
  const count = selectedPrompts.value.length
  // 使用批量删除 API，避免逐条 IPC 调用
  // 使用 .slice() 将 Vue Proxy 数组转换为纯数据数组
  await store.batchDeletePrompts(selectedPrompts.value.slice())
  showToast(t('toast.batchDeleteSuccess', { count }), 'success')
  exitBatchMode()
  showBatchDeleteDialog.value = false
}

// 批量从集合移除处理
function handleBatchRemoveFromCollection() {
  if (selectedPrompts.value.length === 0) return
  showBatchRemoveDialog.value = true
}

// 确认批量从集合移除
async function confirmBatchRemoveFromCollection() {
  const count = selectedPrompts.value.length
  // 使用批量更新 API 一次性移出所有选中的提示词，避免逐条 IPC 调用
  // 使用 .slice() 将 Vue Proxy 数组转换为纯数据数组
  await store.batchUpdatePrompts(selectedPrompts.value.slice(), { collection_id: null })
  showToast(t('toast.batchRemoveFromCollectionSuccess', { count }), 'success')
  exitBatchMode()
  showBatchRemoveDialog.value = false
}

// ==================== 数据计算 ====================
const collectionPrompts = computed(() => {
  return store.prompts.filter(p => p.collection_id === collectionId.value)
})

const imagePrompts = computed(() => {
  return collectionPrompts.value.filter(p => p.category === 'Image Generation')
})

const videoPrompts = computed(() => {
  return collectionPrompts.value.filter(p => p.category === 'Video Prompt')
})

// ==================== 通用操作 ====================
async function copyPrompt(prompt: Prompt) {
  const content = prompt.content_zh || prompt.content_en
  if (content) {
    await navigator.clipboard.writeText(content)
    showToast(t('toast.copied'), 'success')
  }
}

function openImageViewer(images: string[], videos: string[], index: number) {
  viewerImages.value = images
  viewerVideos.value = videos
  viewerIndex.value = index
  viewerVisible.value = true
}

function handlePromptsAdded() {
  showToast(t('toast.promptsAddedToCollection'), 'success')
}



async function handleRemove() {
  if (promptToRemove.value && promptToRemove.value.id) {
    // 使用批量更新 API 移出单个提示词（复用批量接口保持一致性）
    await store.batchUpdatePrompts([promptToRemove.value.id], { collection_id: null })
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

// ==================== 提示词操作处理函数 ====================

function handleTogglePrivate(prompt: Prompt) {
  privacyPrompt.value = prompt
  showPrivacyDialog.value = true
}

async function confirmTogglePrivate() {
  if (privacyPrompt.value) {
    await store.updatePrompt(privacyPrompt.value.id!, {
      is_private: !privacyPrompt.value.is_private
    })
    showToast(privacyPrompt.value.is_private ? t('toast.promptNowPublic') : t('toast.promptNowPrivate'), 'success')
    privacyPrompt.value = null
  }
}

function handleEdit(id: number | undefined) {
  if (id) router.push(`/edit/${id}`)
}

function handleDelete(prompt: Prompt | number | undefined) {
  if (typeof prompt === 'number') {
    promptToDelete.value = collectionPrompts.value.find(p => p.id === prompt) || null
  } else if (prompt) {
    promptToDelete.value = prompt
  }
  if (promptToDelete.value) {
    showDeleteDialog.value = true
  }
}

async function confirmDelete() {
  if (promptToDelete.value) {
    await store.deletePrompt(promptToDelete.value.id!)
    showToast(t('toast.promptDeleted'), 'success')
    promptToDelete.value = null
  }
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
