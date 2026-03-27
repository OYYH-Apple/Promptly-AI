<template>
  <div class="bg-surface-container-lowest rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
    <table class="w-full text-left border-collapse">
      <thead>
        <tr class="bg-surface-container-low/50">
          <!-- 批量选择列 -->
          <th v-if="isBatchMode" class="px-4 py-4 w-16">
            <div class="w-6 h-6"></div>
          </th>
          <th class="px-6 py-4 font-semibold uppercase tracking-wider text-on-surface-variant/80 text-left"
            :class="locale === 'zh-CN' ? 'text-sm' : 'text-xs'">{{
              t('table.name') }}</th>
          <!-- 分类列 - 带下拉筛选 -->
          <th class="px-6 py-4 font-semibold uppercase tracking-wider text-on-surface-variant/80 text-left relative"
            :class="locale === 'zh-CN' ? 'text-sm' : 'text-xs'">
            <div class="flex items-center gap-2">
              <span v-if="selectedCategory" class="text-primary">
                {{ t('table.category') }}: {{ selectedCategory }}
              </span>
              <span v-else>{{ t('table.category') }}</span>
              <button
                @click.stop="toggleCategoryDropdown"
                class="p-1 rounded-lg hover:bg-surface-container-high transition-colors"
                :class="{ 'text-primary': selectedCategory, 'text-on-surface-variant/60': !selectedCategory }"
                :title="t('table.filterByCategory')"
              >
                <span class="material-symbols-outlined text-base">
                  {{ isCategoryDropdownOpen ? 'expand_less' : 'expand_more' }}
                </span>
              </button>
              <!-- 清除筛选按钮 -->
              <button
                v-if="selectedCategory"
                @click.stop="clearCategoryFilter"
                class="p-1 rounded-lg hover:bg-surface-container-high transition-colors text-on-surface-variant/60 hover:text-error"
                :title="t('common.clear')"
              >
                <span class="material-symbols-outlined text-base">close</span>
              </button>
            </div>
            <!-- 分类下拉菜单 -->
            <div
              v-if="isCategoryDropdownOpen"
              ref="categoryDropdownRef"
              class="absolute top-full left-0 mt-1 bg-surface-container-lowest rounded-lg shadow-lg border border-surface-variant/20 py-2 min-w-[200px] z-50 max-h-[300px] overflow-y-auto"
            >
              <!-- 全部选项 -->
              <button
                @click="selectCategory('')"
                class="w-full px-4 py-2 text-left text-sm hover:bg-surface-container-high transition-colors flex items-center justify-between"
                :class="{ 'bg-primary/10 text-primary': !selectedCategory }"
              >
                <span>{{ t('table.filterAll') }}</span>
                <span v-if="!selectedCategory" class="material-symbols-outlined text-base">check</span>
              </button>
              <div class="h-px bg-surface-variant/20 my-1"></div>
              <!-- 分类列表 -->
              <div v-if="availableCategories && availableCategories.length > 0">
                <button
                  v-for="category in availableCategories"
                  :key="category"
                  @click="selectCategory(category)"
                  class="w-full px-4 py-2 text-left text-sm hover:bg-surface-container-high transition-colors flex items-center justify-between"
                  :class="{ 'bg-primary/10 text-primary': selectedCategory === category }"
                >
                  <span class="flex items-center gap-2">
                    <span
                      class="w-2 h-2 rounded-full"
                      :class="getCategoryStyle(category).bg"
                    ></span>
                    {{ category }}
                  </span>
                  <span v-if="selectedCategory === category" class="material-symbols-outlined text-base">check</span>
                </button>
              </div>
              <div v-else class="px-4 py-2 text-sm text-on-surface-variant/60">
                {{ t('table.noCategories') }}
              </div>
            </div>
          </th>
          <th
            class="px-6 py-4 font-semibold uppercase tracking-wider text-on-surface-variant/80 text-left min-w-[140px]"
            :class="locale === 'zh-CN' ? 'text-sm' : 'text-xs'">{{
              t('table.dateEdited') }}</th>
          <th class="px-6 py-4 font-semibold uppercase tracking-wider text-on-surface-variant/80 text-left"
            :class="locale === 'zh-CN' ? 'text-sm' : 'text-xs'">{{
              t('table.option') }}</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100">
        <tr v-for="prompt in paginatedPrompts" :key="prompt.id"
          class="hover:bg-surface-container-low/30 transition-colors group cursor-pointer"
          :class="{ 'bg-primary/5': isBatchMode && isSelected(prompt.id) }" @click="handleRowClick(prompt)">
          <!-- 批量选择框 -->
          <td v-if="isBatchMode" class="px-4 py-3">
            <div @click.stop="$emit('select', prompt.id)"
              class="w-6 h-6 rounded border-2 flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110"
              :class="isSelected(prompt.id) ? 'border-primary bg-primary text-white' : 'border-slate-300 hover:border-primary'">
              <span v-if="isSelected(prompt.id)" class="material-symbols-outlined text-sm">check</span>
            </div>
          </td>
          <td class="px-6 py-3">
            <div class="flex items-center gap-3">
              <Thumbnail v-if="prompt.reference_images?.length" :image-url="prompt.reference_images[0]"
                :count="prompt.reference_images.length" :rotation="getThumbnailRotation(prompt.id)"
                @click="$emit('open-image', prompt.reference_images || [], prompt.reference_videos || [], 0)" />
              <div v-else class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                :class="getCategoryStyle(prompt.category).bg">
                <span class="material-symbols-outlined text-lg" :class="getCategoryStyle(prompt.category).textColor">{{
                  getCategoryStyle(prompt.category).icon }}</span>
              </div>
              <div>
                <p class="font-medium text-on-surface">{{ prompt.title }}</p>
                <p class="text-xs text-on-surface-variant line-clamp-1">{{ prompt.content_zh?.slice(0, 50) ||
                  prompt.content_en?.slice(0, 50) }}...</p>
              </div>
            </div>
          </td>
          <td class="px-6 py-3">
            <span
              class="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap text-center"
              :class="getCategoryStyle(prompt.category).badgeList" style="padding:10px;">
              {{ prompt.category }}
            </span>
          </td>
          <td class="px-6 py-3 text-sm text-on-surface-variant">
            {{ formatRelativeTime(prompt.updated_at) }}
          </td>
          <td class="px-6 py-3 text-right">
            <div class="flex items-center justify-end gap-2">
              <Tooltip :text="prompt.is_private ? t('tooltip.makePrivate') : t('tooltip.makePublic')" placement="top">
                <button @click.stop="$emit('toggle-private', prompt)"
                  class="p-1 rounded-lg hover:bg-surface-container-high transition-colors">
                  <span class="material-symbols-outlined text-base"
                    :class="prompt.is_private ? 'text-slate-400' : 'text-primary'">
                    {{ prompt.is_private ? 'lock' : 'public' }}
                  </span>
                </button>
              </Tooltip>
              <div class="flex items-center gap-1 transition-opacity">
                <slot name="actions" :prompt="prompt" />
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 分页导航 -->
    <!-- 分页导航 - 批量展开模式下隐藏 -->
    <div v-if="totalPages > 1 && !(isBatchMode && expanded)"
      class="flex items-center justify-between px-6 py-4 bg-surface-container-low/30 border-t border-slate-100">
      <div class="text-sm text-on-surface-variant">
        {{ t('pagination.showing', {
          start: filteredPrompts.length > 0 ? (currentPage - 1) * pageSizeValue + 1 : 0,
          end: Math.min(currentPage * pageSizeValue, filteredPrompts.length),
          total: filteredPrompts.length
        }) }}
      </div>
      <div class="flex items-center gap-2">
        <!-- 上一页 -->
        <button @click="prevPage" :disabled="currentPage === 1" class="p-2 rounded-lg transition-colors"
          :class="currentPage === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-surface-container-high'">
          <span class="material-symbols-outlined text-sm">chevron_left</span>
        </button>

        <!-- 页码 -->
        <div class="flex items-center gap-1">
          <template v-for="(page, index) in paginationRange" :key="index">
            <button v-if="page !== '...'" @click="goToPage(page as number)"
              class="min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-colors"
              :class="currentPage === page ? 'bg-primary text-white' : 'text-slate-600 hover:bg-surface-container-high'">
              {{ page }}
            </button>
            <span v-else class="px-2 text-slate-400">...</span>
          </template>
        </div>

        <!-- 下一页 -->
        <button @click="nextPage" :disabled="currentPage === totalPages" class="p-2 rounded-lg transition-colors"
          :class="currentPage === totalPages ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-surface-container-high'">
          <span class="material-symbols-outlined text-sm">chevron_right</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Prompt } from '@/stores/prompts'
import { useI18n } from 'vue-i18n'
import { useDateFormatter } from '@/utils/format'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Thumbnail from './Thumbnail.vue'
import Tooltip from './Tooltip.vue'

const { t, locale } = useI18n()
const { formatRelativeTime } = useDateFormatter()

// ==================== Props & Emits ====================

const props = defineProps<{
  prompts: Prompt[]
  pageSize?: number
  isBatchMode?: boolean
  selectedIds?: number[]
  expanded?: boolean
  availableCategories?: string[]
}>()

const emit = defineEmits<{
  (e: 'click', prompt: Prompt): void
  (e: 'open-image', images: string[], videos: string[], index: number): void
  (e: 'toggle-private', prompt: Prompt): void
  (e: 'select', id: number | undefined): void
  (e: 'filter-change', category: string): void
}>()

function isSelected(id: number | undefined): boolean {
  if (!id) return false
  return props.selectedIds?.includes(id) || false
}

function handleRowClick(prompt: Prompt) {
  if (props.isBatchMode) {
    emit('select', prompt.id)
  } else {
    emit('click', prompt)
  }
}

// ==================== 分类筛选逻辑 ====================

const selectedCategory = ref('')
const isCategoryDropdownOpen = ref(false)
const categoryDropdownRef = ref<HTMLElement | null>(null)

// 切换下拉菜单显示状态
function toggleCategoryDropdown() {
  isCategoryDropdownOpen.value = !isCategoryDropdownOpen.value
}

// 选择分类
function selectCategory(category: string) {
  selectedCategory.value = category
  isCategoryDropdownOpen.value = false
  currentPage.value = 1 // 筛选时重置页码
  emit('filter-change', category)
}

// 清除分类筛选
function clearCategoryFilter() {
  selectedCategory.value = ''
  currentPage.value = 1 // 清除筛选时重置页码
  emit('filter-change', '')
}

// 点击外部关闭下拉菜单
function handleClickOutside(event: MouseEvent) {
  if (categoryDropdownRef.value && !categoryDropdownRef.value.contains(event.target as Node)) {
    isCategoryDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// ==================== 分页逻辑 ====================

const currentPage = ref(1)
const defaultPageSize = 10

const pageSizeValue = computed(() => props.pageSize || defaultPageSize)

// 根据选中分类过滤后的提示词列表
const filteredPrompts = computed(() => {
  if (!selectedCategory.value) {
    return props.prompts
  }
  return props.prompts.filter(prompt => prompt.category === selectedCategory.value)
})

const totalPages = computed(() => {
  return Math.ceil(filteredPrompts.value.length / pageSizeValue.value)
})

const paginatedPrompts = computed(() => {
  // 批量模式下如果 expanded 为 true，显示所有数据
  if (props.isBatchMode && props.expanded) {
    return filteredPrompts.value
  }
  const start = (currentPage.value - 1) * pageSizeValue.value
  const end = start + pageSizeValue.value
  return filteredPrompts.value.slice(start, end)
})

const paginationRange = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const delta = 2
  const range: (number | string)[] = []

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i)
    } else if (range[range.length - 1] !== '...') {
      range.push('...')
    }
  }
  return range
})

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const thumbnailRotations = [3, -2, 4, -3, 2, -4, 5, -5, 1, -1]

function getThumbnailRotation(id: number | undefined): number {
  if (!id) return 0
  return thumbnailRotations[id % thumbnailRotations.length]
}

const categoryStyles: Record<string, { icon: string; badge: string; bg: string; textColor: string; badgeList: string }> = {
  'Image Generation': {
    icon: 'image',
    badge: 'bg-primary-container/30 text-primary-dim',
    bg: 'bg-primary-container',
    textColor: 'text-on-primary-container',
    badgeList: 'bg-blue-50 text-blue-700'
  },
  'Video Prompt': {
    icon: 'movie',
    badge: 'bg-tertiary-container/30 text-tertiary-dim',
    bg: 'bg-tertiary-container',
    textColor: 'text-on-tertiary-container',
    badgeList: 'bg-purple-50 text-purple-700'
  },
  'Coding': {
    icon: 'code',
    badge: 'bg-secondary-container/50 text-secondary-dim',
    bg: 'bg-secondary-container',
    textColor: 'text-on-secondary-container',
    badgeList: 'bg-slate-100 text-slate-700'
  },
  'General': {
    icon: 'text_snippet',
    badge: 'bg-surface-container-high text-on-surface-variant',
    bg: 'bg-surface-container-high',
    textColor: 'text-on-surface-variant',
    badgeList: 'bg-slate-100 text-slate-700'
  },
  'Concept Art': {
    icon: 'brush',
    badge: 'bg-surface-container-high text-on-surface-variant',
    bg: 'bg-surface-container-high',
    textColor: 'text-on-surface-variant',
    badgeList: 'bg-amber-50 text-amber-700'
  },
  'Layout Design': {
    icon: 'web',
    badge: 'bg-surface-container-high text-on-surface-variant',
    bg: 'bg-surface-container-high',
    textColor: 'text-on-surface-variant',
    badgeList: 'bg-emerald-50 text-emerald-700'
  }
}

function getCategoryStyle(category: string) {
  return categoryStyles[category] || categoryStyles['General']
}

// 使用 useDateFormatter 中的 formatRelativeTime 替代
</script>
