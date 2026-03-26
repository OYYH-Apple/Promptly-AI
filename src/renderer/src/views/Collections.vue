<template>
  <section class="flex-1 overflow-y-auto p-10 bg-surface">
    <div class="max-w-7xl mx-auto">
      <div class="flex flex-col gap-8">
        <div class="flex justify-between items-end">
          <div>
            <span class="font-bold tracking-widest text-primary uppercase mb-2 block"
              :class="locale === 'zh-CN' ? 'text-sm' : 'text-xs'">{{
                t('collections.overview') }}</span>
            <h2 class="text-3xl font-semibold tracking-tight text-slate-900">{{ t('collections.title') }}</h2>
            <p class="text-slate-500 mt-2" :class="locale === 'zh-CN' ? 'text-base' : 'text-sm'">{{
              t('collections.subtitle') }}</p>
          </div>
          <div class="flex gap-3 items-center">
            <div class="relative">
              <span
                class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input v-model="searchQuery"
                class="w-64 pl-10 pr-10 py-2 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20"
                :placeholder="t('common.searchCollections')" />
              <button @click="searchQuery = ''"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-all hover:rotate-90">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>
        </div>

        <div v-if="store.loading" class="flex items-center justify-center py-20">
          <span class="material-symbols-outlined animate-spin text-primary">progress_activity</span>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <button @click="showCreateModal = true"
            class="group relative h-full min-h-[220px] rounded-xl border-2 border-dashed border-slate-200 hover:border-primary/40 hover:bg-primary/[0.02] transition-all flex flex-col items-center justify-center gap-4">
            <div
              class="w-12 h-12 rounded-full bg-primary/5 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <span class="material-symbols-outlined text-3xl transition-all hover:rotate-90">add</span>
            </div>
            <div class="text-center">
              <span class="block font-semibold text-slate-900" :class="locale === 'zh-CN' ? 'text-base' : 'text-sm'">{{
                t('collections.newCollection') }}</span>
              <span class="text-slate-400" :class="locale === 'zh-CN' ? 'text-sm' : 'text-xs'">{{
                t('collections.createWorkspace') }}</span>
            </div>
          </button>

          <div v-for="collection in filteredCollections" :key="collection.id"
            class="group bg-surface-container-lowest rounded-xl p-6 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between border border-transparent hover:border-slate-100 cursor-pointer relative"
            @click="openCollection(collection)">
            <!-- 缩略图堆叠展示区域 - 浮动在按钮下方 -->
            <div class="collection-thumbnails absolute top-[70px] left-1/2 h-[125px] min-w-[100px] p-[3px] z-10"
              @mouseenter="handleThumbnailsEnter(collection.id!)" @mouseleave="handleThumbnailsLeave(collection.id!)">
              <div class="thumbnails-stack flex items-center justify-center h-full relative">
                <div v-for="(promptInfo, index) in getVisiblePrompts(collection.id!)" :key="promptInfo.id"
                  class="thumbnail-card absolute h-[125px] min-w-[100px] w-auto rounded-lg border-2 border-white shadow-lg overflow-hidden bg-white transition-all duration-500 ease-out group"
                  :class="{ 'is-expanded': expandedCollectionId === collection.id }"
                  :style="getThumbnailStyle(index, getVisiblePrompts(collection.id!).length)">
                  <!-- 有图片时显示图片 -->
                  <img v-if="promptInfo.imageUrl" :src="promptInfo.imageUrl" alt="thumbnail"
                    class="w-full h-full object-contain" />
                  <!-- 无图片时显示默认图标 -->
                  <div v-else class="w-full h-full flex items-center justify-center bg-slate-100">
                    <span class="material-symbols-outlined text-slate-300 text-3xl">{{
                      getCategoryIcon(promptInfo.category) }}</span>
                  </div>
                  <!-- 移出按钮 - 鼠标移入显示并旋转 -->
                  <button @click.stop="removePromptFromCollection(promptInfo.id)"
                    class="absolute top-1 right-1 w-5 h-5 rounded-full bg-error text-white opacity-0 group-hover:opacity-100 transition-all duration-200 hover:rotate-180 flex items-center justify-center shadow-md z-50">
                    <span class="text-xs font-bold material-symbols-outlined">remove</span>
                  </button>
                </div>
                <!-- 无提示词时的占位 -->
                <div v-if="getVisiblePrompts(collection.id!).length === 0"
                  class="h-[125px] w-[100px] rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 shadow-sm">
                  <span class="material-symbols-outlined text-slate-300 text-2xl">image</span>
                </div>
              </div>
            </div>

            <div>
              <div class="flex justify-between items-start mb-4">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center"
                  :style="{ backgroundColor: collection.color + '20', color: collection.color }">
                  <span class="material-symbols-outlined text-2xl">{{ collection.icon }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <Tooltip :text="t('tooltip.addPrompts')" placement="top">
                    <button @click.stop="showAddPromptDialog(collection)"
                      class="p-2 rounded-full hover:bg-primary/10 transition-colors">
                      <span
                        class="material-symbols-outlined text-primary transition-all hover:rotate-90">add_circle</span>
                    </button>
                  </Tooltip>
                  <Tooltip :text="t('tooltip.deleteCollection')" placement="top">
                    <button @click.stop="confirmDelete(collection)"
                      class="p-2 rounded-full hover:bg-red-50 transition-colors">
                      <span class="material-symbols-outlined text-slate-400 hover:text-red-500">delete</span>
                    </button>
                  </Tooltip>
                </div>
              </div>

              <h4 class="text-lg font-semibold text-slate-900">{{ collection.name }}</h4>
              <p class="text-sm text-slate-500 mt-1">{{ collection.description || t('collections.noDescription') }}</p>
            </div>
            <div class="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
              <div class="flex flex-col">
                <span class="font-bold text-slate-400 uppercase tracking-tighter"
                  :class="locale === 'zh-CN' ? 'text-xs' : 'text-[10px]'">{{
                    t('collections.promptsLabel') }}</span>
                <span class="text-sm font-semibold text-slate-900">{{ getCollectionCount(collection.id!) }} items</span>
              </div>
              <div class="text-right">
                <span class="font-bold text-slate-400 uppercase tracking-tighter"
                  :class="locale === 'zh-CN' ? 'text-xs' : 'text-[10px]'">{{
                    t('collections.updatedLabel') }}</span>
                <span class="text-sm text-slate-600 block">{{ formatDate(collection.updated_at) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-8 bg-surface-container-low rounded-2xl p-8 flex items-center justify-around">
          <div class="text-center">
            <span class="block text-2xl font-bold text-slate-900">{{ filteredCollections.length }}</span>
            <span class="font-medium text-slate-500 uppercase tracking-widest"
              :class="locale === 'zh-CN' ? 'text-sm' : 'text-xs'">{{
                t('collections.collectionsLabel') }}</span>
          </div>
          <div class="w-px h-8 bg-slate-200"></div>
          <div class="text-center">
            <span class="block text-2xl font-bold text-slate-900">{{ totalPrompts }}</span>
            <span class="font-medium text-slate-500 uppercase tracking-widest"
              :class="locale === 'zh-CN' ? 'text-sm' : 'text-xs'">{{ t('collections.activePrompts')
              }}</span>
          </div>
          <div class="w-px h-8 bg-slate-200"></div>
          <div class="text-center">
            <span class="block text-2xl font-bold text-slate-900">{{ totalFavorites }}</span>
            <span class="font-medium text-slate-500 uppercase tracking-widest"
              :class="locale === 'zh-CN' ? 'text-sm' : 'text-xs'">{{
                t('collections.favoritesLabel') }}</span>
          </div>
        </div>
      </div>
    </div>

    <button
      class="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-primary text-white shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
      @click="showCreateModal = true">
      <span class="material-symbols-outlined transition-all hover:rotate-90">add</span>
    </button>

    <div v-if="showCreateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="closeCreateModal">
      <div class="bg-white rounded-2xl p-8 w-full max-w-md">
        <h3 class="text-xl font-bold mb-6">{{ t('collectionModal.title') }}</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">{{ t('collectionModal.name') }}</label>
            <input v-model="newCollection.name"
              class="w-full px-4 py-2 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20"
              :class="{ 'ring-2 ring-red-500': formErrors.name }" :placeholder="t('collectionModal.namePlaceholder')" />
            <p v-if="formErrors.name" class="mt-1 text-sm text-red-500">{{ formErrors.name }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">{{ t('collectionModal.description') }}</label>
            <input v-model="newCollection.description"
              class="w-full px-4 py-2 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20"
              :class="{ 'ring-2 ring-red-500': formErrors.description }"
              :placeholder="t('collectionModal.descriptionPlaceholder')" />
            <p v-if="formErrors.description" class="mt-1 text-sm text-red-500">{{ formErrors.description }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">{{ t('collectionModal.icon') }}</label>
            <div class="grid grid-cols-5 gap-2">
              <button v-for="icon in availableIcons" :key="icon.value" @click="newCollection.icon = icon.value"
                class="w-10 h-10 rounded-lg flex items-center justify-center transition-all"
                :class="newCollection.icon === icon.value ? 'bg-primary text-white ring-2 ring-primary' : 'bg-surface-container-low text-slate-600 hover:bg-surface-container'"
                :title="icon.label">
                <span class="material-symbols-outlined">{{ icon.value }}</span>
              </button>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">{{ t('collectionModal.color') }}</label>
            <input v-model="newCollection.color" type="color" class="w-50 h-10 rounded-md cursor-pointer p-1" />
          </div>
        </div>
        <div class="flex gap-3 mt-6">
          <button @click="closeCreateModal" class="flex-1 px-4 py-2 bg-surface-container-high rounded-xl font-medium">{{
            t('dialog.cancel') }}</button>
          <button @click="createCollection" class="flex-1 px-4 py-2 bg-primary text-white rounded-xl font-medium">{{
            t('dialog.create') }}</button>
        </div>
      </div>
    </div>

    <AddPromptModal v-model:visible="showAddPromptModal" :collection-id="selectedCollection?.id || 0"
      :collection-name="selectedCollection?.name || ''" @added="handlePromptsAdded" />

    <ConfirmDialog v-model:visible="showDeleteDialog" type="danger" :title="t('dialog.deleteCollectionTitle')"
      :message="t('dialog.deleteCollectionMessage', { name: collectionToDelete?.name })"
      :confirm-text="t('dialog.delete')" :cancel-text="t('dialog.cancel')" @confirm="handleDelete" />
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePromptStore } from '@/stores/prompts'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import AddPromptModal from '@/components/AddPromptModal.vue'
import Tooltip from '@/components/Tooltip.vue'

const router = useRouter()
const store = usePromptStore()
const { t, locale } = useI18n()
const showCreateModal = ref(false)
const showDeleteDialog = ref(false)
const showAddPromptModal = ref(false)
const collectionToDelete = ref<any>(null)
const selectedCollection = ref<any>(null)
const newCollection = ref({ name: '', description: '', icon: 'folder', color: '#005bc1' })
const formErrors = ref<{ name?: string; description?: string }>({})
const searchQuery = ref('')

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

// ==================== 缩略图堆叠展示逻辑 ====================

// 当前展开缩略图的集合ID
const expandedCollectionId = ref<number | null>(null)

// ==================== 缩略图与提示词管理 ====================

/**
 * 提示词信息接口
 */
interface PromptInfo {
  id: number
  imageUrl: string | null
  category: string
}

/**
 * 获取指定集合下可见的提示词信息（最多3张）
 * 移出后自动从集合中补齐下一张
 */
function getVisiblePrompts(collectionId: number): PromptInfo[] {
  const collectionPrompts = store.prompts.filter(p => p.collection_id === collectionId)
  const result: PromptInfo[] = []

  for (const prompt of collectionPrompts) {
    result.push({
      id: prompt.id!,
      imageUrl: prompt.reference_images && prompt.reference_images.length > 0
        ? prompt.reference_images[0]
        : null,
      category: prompt.category
    })
    if (result.length >= 3) break // 限制只显示3张
  }

  return result
}

/**
 * 根据分类获取默认图标
 */
function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    'Image Generation': 'image',
    'Video Prompt': 'movie'
  }
  return icons[category] || 'text_snippet'
}

/**
 * 从集合中移出提示词
 */
async function removePromptFromCollection(promptId: number) {
  await store.updatePrompt(promptId, { collection_id: null })
  showToast(t('toast.removedFromCollection'), 'success')
}

/**
 * 计算每张缩略图的堆叠样式
 * 未展开时呈扇形堆叠，展开时像扑克牌一样扇形展开
 * z-index 从左到右递减：第1张(最左)在最上层(z-index: 3)，第3张(最右)在最下层(z-index: 1)
 */
function getThumbnailStyle(index: number, total: number): Record<string, string> {
  const centerIndex = (total - 1) / 2
  const offsetFromCenter = index - centerIndex

  // 堆叠状态：轻微旋转和偏移，形成扇形堆叠效果
  const stackedRotation = offsetFromCenter * 3 // 每张相差3度
  const stackedTranslateX = offsetFromCenter * 4 // 水平偏移4px
  const stackedTranslateY = Math.abs(offsetFromCenter) * 1 // 垂直轻微偏移

  // 展开状态：更大的扇形展开
  const expandedRotation = offsetFromCenter * 12 // 展开时每张相差12度
  const expandedTranslateX = offsetFromCenter * 35 // 展开时水平偏移35px
  const expandedTranslateY = Math.abs(offsetFromCenter) * 5 // 展开时垂直偏移

  const isExpanded = expandedCollectionId.value !== null

  const rotation = isExpanded ? expandedRotation : stackedRotation
  const translateX = isExpanded ? expandedTranslateX : stackedTranslateX
  const translateY = isExpanded ? -expandedTranslateY : stackedTranslateY

  // z-index 从左到右递减：第1张(索引0) z-index=3，第2张 z-index=2，第3张 z-index=1
  // 这样第1张在最上层，移出按钮不会被遮挡
  const zIndex = total - index

  return {
    transform: `translateX(${translateX}px) translateY(${translateY}px) rotate(${rotation}deg)`,
    zIndex: String(zIndex),
    left: 'calc(50% - 50px)' // 居中定位 (100px最小宽度的一半)
  }
}

/**
 * 鼠标移入缩略图区域时展开
 */
function handleThumbnailsEnter(collectionId: number) {
  expandedCollectionId.value = collectionId
}

/**
 * 鼠标移出缩略图区域时收起
 */
function handleThumbnailsLeave(_collectionId: number) {
  expandedCollectionId.value = null
}

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

const filteredCollections = computed(() => {
  if (!searchQuery.value) return store.collections
  const q = searchQuery.value.toLowerCase()
  return store.collections.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.description?.toLowerCase().includes(q)
  )
})

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

// 表单校验
function validateCollectionForm(): boolean {
  formErrors.value = {}
  const name = newCollection.value.name.trim()

  // 名称必填校验
  if (!name) {
    formErrors.value.name = t('toast.collectionNameRequired')
    showToast(t('toast.collectionNameRequired'), 'error')
    return false
  }

  // 名称长度校验（最多50个字符）
  if (name.length > 50) {
    formErrors.value.name = t('toast.maxLength', { field: t('collectionModal.name'), count: 50 })
    showToast(t('toast.maxLength', { field: t('collectionModal.name'), count: 50 }), 'error')
    return false
  }

  // 描述长度校验（最多200个字符）
  if (newCollection.value.description && newCollection.value.description.length > 200) {
    formErrors.value.description = t('toast.maxLength', { field: t('collectionModal.description'), count: 200 })
    showToast(t('toast.maxLength', { field: t('collectionModal.description'), count: 200 }), 'error')
    return false
  }

  return true
}

async function createCollection() {
  // 执行表单校验
  if (!validateCollectionForm()) return

  await store.createCollection({
    name: newCollection.value.name.trim(),
    description: newCollection.value.description.trim(),
    icon: newCollection.value.icon,
    color: newCollection.value.color
  })
  showToast(t('toast.collectionCreated'), 'success')
  showCreateModal.value = false
  newCollection.value = { name: '', description: '', icon: 'folder', color: '#005bc1' }
  formErrors.value = {}
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

// 关闭创建弹窗并重置表单
function closeCreateModal() {
  showCreateModal.value = false
  newCollection.value = { name: '', description: '', icon: 'folder', color: '#005bc1' }
  formErrors.value = {}
}

function handlePromptsAdded() {
  selectedCollection.value = null
  showToast(t('toast.promptsAddedToCollection'), 'success')
}

function showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
  window.dispatchEvent(new CustomEvent('show-toast', {
    detail: { message, type, duration: 2000 }
  }))
}

// 日期格式化使用 useDateFormatter

onMounted(() => {
  store.fetchPrompts()
  store.fetchCollections()
})
</script>

<style scoped>
/* ==================== 缩略图堆叠动画样式 ==================== */

/* 缩略图容器 - 用于整体定位 */
.collection-thumbnails {
  perspective: 600px;
}

.thumbnails-stack {
  transform-style: preserve-3d;
}

.thumbnail-card {
  transform-origin: center bottom;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.thumbnail-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

/* 展开状态下的额外样式 */
.thumbnail-card.is-expanded {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}
</style>
