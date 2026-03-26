<template>
  <section class="flex-1 overflow-y-auto p-10 bg-surface">
    <div class="max-w-7xl mx-auto space-y-12">
      <div class="flex items-end justify-between">
        <div>
          <h2 class="text-3xl font-bold tracking-tight text-on-surface mb-2">{{ t('favorites.title') }}</h2>
          <p class="text-on-surface-variant max-w-md">{{ t('favorites.subtitle') }}</p>
        </div>
        <div class="flex items-center gap-3">
          <!-- 批量选择入口按钮 - 与排序按钮样式一致 -->
          <button v-if="!isBatchMode" @click="enterBatchMode"
            class="px-4 py-1.5 bg-surface-container-low text-on-surface-variant rounded-lg text-sm font-medium hover:bg-surface-container-high transition-colors flex items-center gap-1">
            <span class="material-symbols-outlined text-base">check_box</span>
            {{ t('batch.select') }}
          </button>

          <!-- 排序下拉菜单 -->
          <div class="relative" ref="sortDropdownRef">
            <button @click="showSortMenu = !showSortMenu"
              class="px-4 py-1.5 bg-surface-container-low text-on-surface-variant rounded-lg text-sm font-medium hover:bg-surface-container-high transition-colors flex items-center gap-1">
              <span class="material-symbols-outlined text-base">sort</span>
              <span>{{ currentSortLabel }}</span>
              <span class="material-symbols-outlined text-sm">{{ showSortMenu ? 'expand_less' : 'expand_more' }}</span>
            </button>
            <div v-if="showSortMenu"
              class="absolute right-0 mt-2 w-44 bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant z-50 py-1 overflow-hidden">
              <button v-for="option in sortOptions" :key="option.value" @click="selectSort(option)" :class="['w-full px-4 py-2 text-sm text-left transition-colors flex items-center gap-2',
                currentSortValue === option.value
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-on-surface hover:bg-surface-container-high']">
                <span class="material-symbols-outlined text-sm" v-if="currentSortValue === option.value">check</span>
                <span v-else class="w-5"></span>
                {{ option.label }}
              </button>
            </div>
          </div>

          <div class="flex gap-2 p-1 bg-surface-container-low rounded-xl">
            <Tooltip :text="t('tooltip.gridView')" placement="bottom">
              <button @click="store.setViewMode('grid')"
                :class="['px-4 py-1.5 font-medium rounded-lg text-sm transition-colors', store.viewMode === 'grid' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high']">{{
                  t('view.grid') }}</button>
            </Tooltip>
            <Tooltip :text="t('tooltip.listView')" placement="bottom">
              <button @click="store.setViewMode('list')"
                :class="['px-4 py-1.5 font-medium rounded-lg text-sm transition-colors', store.viewMode === 'list' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high']">{{
                  t('view.list') }}</button>
            </Tooltip>
          </div>
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
        <!-- 批量取消收藏 -->
        <button @click="handleBatchUnfavorite" :disabled="selectedPrompts.length === 0"
          class="px-4 py-1.5 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed">
          <span class="material-symbols-outlined text-sm">star_border</span>
          {{ t('batch.unfavorite') }}
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

      <div v-if="store.loading" class="flex items-center justify-center py-20">
        <span class="material-symbols-outlined animate-spin text-primary">progress_activity</span>
      </div>

      <div v-else-if="favorites.length === 0" class="text-center py-20">
        <span class="material-symbols-outlined text-6xl text-slate-300">grade</span>
        <p class="text-slate-500 mt-4">{{ t('empty.noFavorites') }}</p>
      </div>

      <template v-else>
        <!-- Grid View -->
        <template v-if="store.viewMode === 'grid'">
          <PromptSection :title="t('library.imagePrompts')" icon="image" icon-color="#005bc1" :items="imageFavorites"
            :show-add-button="false" :expanded="expandAllSections">
            <template #default="{ items }">
              <PromptCard v-for="(prompt, idx) in items" :key="prompt.id" :prompt="prompt" :rotation-index="idx"
                :is-selected="isPromptSelected(prompt.id)" :is-batch-mode="isBatchMode"
                @click="!isBatchMode && router.push(`/prompt/${prompt.id}`)" @select="togglePromptSelection"
                @toggle-favorite="!isBatchMode && prompt.id && store.toggleFavorite(prompt.id)"
                @toggle-private="(p: Prompt) => !isBatchMode && handleTogglePrivate(p)"
                @copy="(p: Prompt) => !isBatchMode && copyPrompt(p)"
                @open-image="(imgs, vids, idx) => openImageViewer(imgs, vids, idx)"
                @edit="(id: number | undefined) => !isBatchMode && handleEdit(id)"
                @delete="(id: number | undefined) => !isBatchMode && handleDelete(id)" />
            </template>
          </PromptSection>

          <PromptSection :title="t('library.videoPrompts')" icon="movie" icon-color="#5f5c78" :items="videoFavorites"
            :show-add-button="false" :expanded="expandAllSections">
            <template #default="{ items }">
              <PromptCard v-for="(prompt, idx) in items" :key="prompt.id" :prompt="prompt" :rotation-index="idx"
                :is-selected="isPromptSelected(prompt.id)" :is-batch-mode="isBatchMode"
                @click="!isBatchMode && router.push(`/prompt/${prompt.id}`)" @select="togglePromptSelection"
                @toggle-favorite="!isBatchMode && prompt.id && store.toggleFavorite(prompt.id)"
                @toggle-private="(p: Prompt) => !isBatchMode && handleTogglePrivate(p)"
                @copy="(p: Prompt) => !isBatchMode && copyPrompt(p)"
                @open-image="(imgs, vids, idx) => openImageViewer(imgs, vids, idx)"
                @edit="(id: number | undefined) => !isBatchMode && handleEdit(id)"
                @delete="(id: number | undefined) => !isBatchMode && handleDelete(id)" />
            </template>
          </PromptSection>
        </template>

        <!-- List View -->
        <PromptList v-else :prompts="favorites" :is-batch-mode="isBatchMode" :selected-ids="selectedPrompts"
          :expanded="expandAllSections" @click="(prompt: Prompt) => !isBatchMode && router.push(`/prompt/${prompt.id}`)"
          @open-image="(imgs, vids, idx) => openImageViewer(imgs, vids, idx)"
          @toggle-private="(p: Prompt) => !isBatchMode && handleTogglePrivate(p)" @select="togglePromptSelection">
          <template #actions="{ prompt }">
            <template v-if="!isBatchMode">
              <Tooltip :text="t('tooltip.edit')" placement="top">
                <button @click.stop="router.push(`/edit/${prompt.id}`)"
                  class="p-2 rounded-full hover:bg-surface-container transition-colors">
                  <span class="material-symbols-outlined text-on-surface-variant">edit</span>
                </button>
              </Tooltip>
              <Tooltip :text="t('tooltip.copy')" placement="top">
                <button @click.stop="copyPrompt(prompt)"
                  class="p-2 rounded-full hover:bg-surface-container transition-colors">
                  <span class="material-symbols-outlined text-on-surface-variant">content_copy</span>
                </button>
              </Tooltip>
              <Tooltip :text="t('tooltip.removeFromFavorites')" placement="top">
                <button @click.stop="store.toggleFavorite(prompt.id!)"
                  class="p-2 rounded-full hover:bg-surface-container transition-colors">
                  <span class="material-symbols-outlined text-primary"
                    :style="{ fontVariationSettings: prompt.is_favorite ? `'FILL' 1` : `'FILL' 0` }">grade</span>
                </button>
              </Tooltip>
              <Tooltip :text="t('tooltip.delete')" placement="top">
                <button @click.stop="handleDelete(prompt)"
                  class="p-2 rounded-full hover:bg-surface-container transition-colors">
                  <span class="material-symbols-outlined" style="color: red;">delete</span>
                </button>
              </Tooltip>
            </template>
          </template>
        </PromptList>

        <div class="flex items-center justify-between text-on-surface-variant text-sm px-2 mt-6">
          <p>{{ t('view.showingFavorites', { count: favorites.length }) }}</p>
        </div>
      </template>
    </div>

    <MediaViewer v-model:visible="viewerVisible" :images="viewerImages" :videos="viewerVideos"
      :initial-index="viewerIndex" @close="viewerVisible = false" />
    <ConfirmDialog v-model:visible="showPrivacyDialog" type="warning"
      :title="privacyPrompt?.is_private ? t('dialog.makePublicTitle') : t('dialog.makePrivateTitle')"
      :message="privacyPrompt?.is_private ? t('dialog.makePublicMessage') : t('dialog.makePrivateMessage')"
      :confirm-text="privacyPrompt?.is_private ? t('dialog.makePublicTitle') : t('dialog.makePrivateTitle')"
      :cancel-text="t('dialog.cancel')" @confirm="confirmTogglePrivate" />
    <ConfirmDialog v-model:visible="showDeleteDialog" type="danger" :title="t('dialog.deletePromptTitle')"
      :message="t('dialog.deletePromptMessage')" :confirm-text="t('dialog.delete')" :cancel-text="t('dialog.cancel')"
      @confirm="confirmDelete" />
    <!-- 批量删除确认对话框 -->
    <ConfirmDialog v-model:visible="showBatchDeleteDialog" type="danger" :title="t('dialog.batchDeleteTitle')"
      :message="t('dialog.batchDeleteMessage', { count: selectedPrompts.length })" :confirm-text="t('dialog.delete')"
      :cancel-text="t('dialog.cancel')" @confirm="confirmBatchDelete" />
    <!-- 批量取消收藏确认对话框 -->
    <ConfirmDialog v-model:visible="showBatchUnfavoriteDialog" type="warning" :title="t('batch.unfavorite')"
      :message="t('batch.confirmUnfavorite', { count: selectedPrompts.length })" :confirm-text="t('dialog.confirm')"
      :cancel-text="t('dialog.cancel')" @confirm="confirmBatchUnfavorite" />
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePromptStore, type Prompt } from '@/stores/prompts'
import MediaViewer from '@/components/MediaViewer.vue'
import PromptCard from '@/components/PromptCard.vue'
import PromptSection from '@/components/PromptSection.vue'
import PromptList from '@/components/PromptList.vue'
import Tooltip from '@/components/Tooltip.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const router = useRouter()
const store = usePromptStore()
const { t } = useI18n()

const viewerVisible = ref(false)
const viewerImages = ref<string[]>([])
const viewerVideos = ref<string[]>([])
const viewerIndex = ref(0)
const showPrivacyDialog = ref(false)
const privacyPrompt = ref<Prompt | null>(null)
const showDeleteDialog = ref(false)
const promptToDelete = ref<Prompt | null>(null)

// ==================== 排序功能 ====================
const showSortMenu = ref(false)
const sortDropdownRef = ref<HTMLElement | null>(null)

// 排序选项定义
interface SortOption {
  value: string
  sortBy: string
  sortOrder: string
  label: string
}

const sortOptions = computed<SortOption[]>(() => [
  { value: 'updated_at_desc', sortBy: 'updated_at', sortOrder: 'DESC', label: t('sort.updatedNewest') },
  { value: 'updated_at_asc', sortBy: 'updated_at', sortOrder: 'ASC', label: t('sort.updatedOldest') },
  { value: 'created_at_desc', sortBy: 'created_at', sortOrder: 'DESC', label: t('sort.createdNewest') },
  { value: 'created_at_asc', sortBy: 'created_at', sortOrder: 'ASC', label: t('sort.createdOldest') },
  { value: 'title_asc', sortBy: 'title', sortOrder: 'ASC', label: t('sort.titleAZ') },
  { value: 'title_desc', sortBy: 'title', sortOrder: 'DESC', label: t('sort.titleZA') }
])

// 当前排序值（用于匹配选中状态）
const currentSortValue = computed(() => `${store.sortBy}_${store.sortOrder.toLowerCase()}`)

// 当前排序显示标签
const currentSortLabel = computed(() => {
  const option = sortOptions.value.find(o => o.value === currentSortValue.value)
  return option?.label || t('sort.updatedNewest')
})

// 选择排序选项
function selectSort(option: SortOption) {
  store.setSortOption(option.sortBy, option.sortOrder)
  showSortMenu.value = false
}

// 点击外部关闭下拉菜单
function handleClickOutside(event: MouseEvent) {
  if (sortDropdownRef.value && !sortDropdownRef.value.contains(event.target as Node)) {
    showSortMenu.value = false
  }
}

// ==================== 批量操作功能 ====================
const isBatchMode = ref(false)
const selectedPrompts = ref<number[]>([])
const showBatchDeleteDialog = ref(false)
const showBatchUnfavoriteDialog = ref(false)
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
  const allFavoriteIds = favorites.value.map(p => p.id).filter((id): id is number => id !== undefined)
  return allFavoriteIds.length > 0 && selectedPrompts.value.length === allFavoriteIds.length
})

// 全选/取消全选
function toggleSelectAll() {
  const allFavoriteIds = favorites.value.map(p => p.id).filter((id): id is number => id !== undefined)
  if (isAllSelected.value) {
    selectedPrompts.value = []
    expandAllSections.value = false
  } else {
    selectedPrompts.value = [...allFavoriteIds]
    // 网格模式下全选时展开所有卡片
    if (store.viewMode === 'grid') {
      expandAllSections.value = true
    }
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

// 批量取消收藏处理
function handleBatchUnfavorite() {
  if (selectedPrompts.value.length === 0) return
  showBatchUnfavoriteDialog.value = true
}

// 确认批量取消收藏
async function confirmBatchUnfavorite() {
  const count = selectedPrompts.value.length
  // 使用批量更新 API 一次性取消收藏，避免逐条 IPC 调用
  // 使用 .slice() 将 Vue Proxy 数组转换为纯数据数组
  await store.batchUpdatePrompts(selectedPrompts.value.slice(), { is_favorite: false })
  showToast(t('toast.batchUnfavoriteSuccess', { count }), 'success')
  exitBatchMode()
  showBatchUnfavoriteDialog.value = false
}

// ==================== 数据计算 ====================
const favorites = computed(() => store.prompts.filter(p => p.is_favorite))

const imageFavorites = computed(() => {
  return favorites.value.filter(p => p.category === 'Image Generation')
})

const videoFavorites = computed(() => {
  return favorites.value.filter(p => p.category === 'Video Prompt')
})

// ==================== 通用操作 ====================
async function copyPrompt(prompt: Prompt) {
  const content = prompt.content_zh || prompt.content_en
  if (content) {
    await navigator.clipboard.writeText(content)
    showToast(t('toast.copied'), 'success')
  }
}

function showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
  window.dispatchEvent(new CustomEvent('show-toast', {
    detail: { message, type, duration: 2000 }
  }))
}

function openImageViewer(images: string[], videos: string[], index: number) {
  viewerImages.value = images
  viewerVideos.value = videos
  viewerIndex.value = index
  viewerVisible.value = true
}

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

function handleEdit(promptId: number | undefined) {
  if (promptId) router.push(`/edit/${promptId}`)
}

function handleDelete(prompt: Prompt | number | undefined) {
  if (typeof prompt === 'number') {
    promptToDelete.value = favorites.value.find(p => p.id === prompt) || null
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

onMounted(() => {
  store.fetchPrompts({ favorites: true })
  // 监听点击事件用于关闭排序下拉菜单
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
