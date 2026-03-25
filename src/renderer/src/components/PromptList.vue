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
          <th class="px-6 py-4 font-semibold uppercase tracking-wider text-on-surface-variant/80 text-left"
            :class="locale === 'zh-CN' ? 'text-sm' : 'text-xs'">{{
              t('table.category') }}</th>
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
                @click="$emit('open-image', prompt.reference_images, 0)" />
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
          start: (currentPage - 1) * pageSizeValue + 1, end: Math.min(currentPage *
            pageSizeValue, prompts.length), total: prompts.length
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
import { ref, computed } from 'vue'
import Thumbnail from './Thumbnail.vue'
import Tooltip from './Tooltip.vue'

const { t, locale } = useI18n()
const { formatRelativeTime } = useDateFormatter()

const props = defineProps<{
  prompts: Prompt[]
  pageSize?: number
  isBatchMode?: boolean
  selectedIds?: number[]
  expanded?: boolean
}>()

const emit = defineEmits<{
  (e: 'click', prompt: Prompt): void
  (e: 'open-image', images: string[], index: number): void
  (e: 'toggle-private', prompt: Prompt): void
  (e: 'select', id: number | undefined): void
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

// ==================== 分页逻辑 ====================

const currentPage = ref(1)
const defaultPageSize = 10

const pageSizeValue = computed(() => props.pageSize || defaultPageSize)

const totalPages = computed(() => {
  return Math.ceil(props.prompts.length / pageSizeValue.value)
})

const paginatedPrompts = computed(() => {
  // 批量模式下如果 expanded 为 true，显示所有数据
  if (props.isBatchMode && props.expanded) {
    return props.prompts
  }
  const start = (currentPage.value - 1) * pageSizeValue.value
  const end = start + pageSizeValue.value
  return props.prompts.slice(start, end)
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
