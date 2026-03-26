<template>
  <div
    class="group bg-surface-container-lowest border border-slate-100 p-6 rounded-2xl flex flex-col gap-4 hover:scale-[1.02] transition-all duration-300 relative cursor-pointer"
    :class="{ 'ring-2 ring-primary': isBatchMode && isSelected }" @click="handleClick">
    <!-- 批量选择框 - 选中后固定显示，未选中时鼠标移入显示 -->
    <div v-if="isBatchMode" class="absolute -top-3 -left-3 z-20 transition-all duration-300"
      :class="isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
      @click.stop="$emit('select', prompt.id)">
      <div
        class="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-transform duration-300 hover:rotate-12"
        :class="isSelected ? 'bg-primary text-white shadow-lg' : 'bg-white shadow-md'">
        <span v-if="isSelected" class="material-symbols-outlined text-lg">check</span>
        <span v-else class="material-symbols-outlined text-slate-300 text-lg">check_box_outline_blank</span>
      </div>
    </div>

    <!-- 缩略图区域：有图片时显示 Thumbnail 组件 -->
    <div v-if="prompt.reference_images?.length" class="absolute -top-2 -right-2 z-10">
      <Thumbnail :image-url="prompt.reference_images[0]" :count="prompt.reference_images.length"
        :rotation="thumbnailRotations[rotationIndex % thumbnailRotations.length]" size="large"
        @click="$emit('open-image', prompt.reference_images || [], prompt.reference_videos || [], 0)" />
      <!-- 当同时有图片和视频时显示视频小角标 -->
      <div v-if="prompt.reference_videos?.length"
        class="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center shadow z-20">
        <span class="material-symbols-outlined text-white" style="font-size: 12px;">videocam</span>
      </div>
    </div>
    <!-- 仅有视频无图片时显示视频缩略图/预览 -->
    <div v-else-if="prompt.reference_videos?.length" class="absolute -top-2 -right-2 z-10">
      <div
        class="relative w-14 h-14 rounded-xl overflow-hidden cursor-pointer"
        @mouseenter="startVideoPreview"
        @mouseleave="stopVideoPreview"
      >
        <!-- 缩略图（默认显示） -->
        <img
          v-if="!isPreviewing && videoThumbnailUrl"
          :src="videoThumbnailUrl"
          class="w-full h-full object-cover"
          @error="handleThumbnailError"
        />
        <!-- 缩略图加载中或失败时显示视频图标 -->
        <div v-else-if="!isPreviewing"
          class="w-full h-full bg-black/80 flex items-center justify-center shadow-lg border-2 border-white/20">
          <span class="material-symbols-outlined text-white text-xl">videocam</span>
        </div>
        <!-- 视频预览（hover 时显示） -->
        <video
          v-else
          ref="previewVideoRef"
          :src="videoPreviewUrl"
          class="w-full h-full object-cover"
          muted
          loop
          autoplay
        />
        <!-- 视频标识角标 -->
        <div class="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center">
          <span class="material-symbols-outlined text-white text-xs">videocam</span>
        </div>
      </div>
    </div>

    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Tooltip :text="prompt.is_private ? t('tooltip.makePrivate') : t('tooltip.makePublic')" placement="top">
          <button @click.stop="$emit('toggle-private', prompt)"
            class="p-1 rounded-lg hover:bg-surface-container-high transition-colors">
            <span class="material-symbols-outlined text-base"
              :class="prompt.is_private ? 'text-slate-400' : 'text-primary'">
              {{ prompt.is_private ? 'lock' : 'public' }}
            </span>
          </button>
        </Tooltip>
        <span class="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full"
          :class="getCategoryStyle(prompt.category).badge">
          {{ getShortCategory(prompt.category) }}
        </span>
      </div>
      <span class="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors text-xl">
        {{ getCategoryStyle(prompt.category).icon }}
      </span>
    </div>

    <h3 class="font-bold text-lg text-slate-800 leading-tight">{{ prompt.title }}</h3>
    <p class="text-sm text-slate-500 line-clamp-6" style="min-height: 120px;">{{ prompt.content_zh || prompt.content_en
    }}</p>

    <div class="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
      <span class="text-[11px] font-medium text-slate-400">{{ formatRelativeTime(prompt.updated_at) }}</span>
      <div class="flex items-center gap-1">
        <slot name="actions" :prompt="prompt">
          <Tooltip :text="prompt.is_favorite ? t('tooltip.removeFromFavorites') : t('tooltip.addToFavorites')"
            placement="top">
            <button @click.stop="$emit('toggle-favorite', prompt.id)"
              class="text-x1 text-primary transition-colors p-1">
              <span class="material-symbols-outlined text-xl"
                :style="{ fontVariationSettings: prompt.is_favorite ? `'FILL' 1` : `'FILL' 0` }">
                grade
              </span>
            </button>
          </Tooltip>
          <Tooltip :text="t('tooltip.copy')" placement="top">
            <button @click.stop="$emit('copy', prompt)"
              class="text-slate-300 hover:text-slate-600 transition-colors p-1">
              <span class="material-symbols-outlined text-lg">content_copy</span>
            </button>
          </Tooltip>
          <Tooltip :text="t('tooltip.edit')" placement="top">
            <button @click.stop="$emit('edit', prompt.id)"
              class="text-slate-300 hover:text-blue-500 transition-colors p-1">
              <span class="material-symbols-outlined text-lg">edit</span>
            </button>
          </Tooltip>
          <Tooltip :text="t('tooltip.delete')" placement="top">
            <button @click.stop="$emit('delete', prompt.id)"
              class="text-slate-300 hover:text-red-500 transition-colors p-1">
              <span class="material-symbols-outlined text-lg">delete</span>
            </button>
          </Tooltip>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Prompt } from '@/stores/prompts'
import { useI18n } from 'vue-i18n'
import { useDateFormatter } from '@/utils/format'
import { ref, onMounted } from 'vue'
import Tooltip from './Tooltip.vue'
import Thumbnail from './Thumbnail.vue'

const { t } = useI18n()
const { formatRelativeTime } = useDateFormatter()

// ==================== 视频缩略图 ====================
const videoThumbnailUrl = ref<string>('')

// 加载视频缩略图（仅当有视频无图片时）
onMounted(async () => {
  if (props.prompt.reference_videos?.length && !props.prompt.reference_images?.length) {
    try {
      const thumbnailPath = await window.api.generateThumbnail(props.prompt.reference_videos[0])
      if (thumbnailPath) {
        videoThumbnailUrl.value = `app-video://${encodeURIComponent(thumbnailPath)}`
      }
    } catch (error) {
      console.error('加载视频缩略图失败:', error)
    }
  }
})

// ==================== 视频预览 ====================
const isPreviewing = ref(false)
const previewVideoRef = ref<HTMLVideoElement | null>(null)
const videoPreviewUrl = ref<string>('')

// 开始视频预览
function startVideoPreview() {
  if (props.prompt.reference_videos?.length) {
    videoPreviewUrl.value = `app-video://${encodeURIComponent(props.prompt.reference_videos[0])}`
    isPreviewing.value = true
  }
}

// 停止视频预览
function stopVideoPreview() {
  isPreviewing.value = false
  if (previewVideoRef.value) {
    previewVideoRef.value.pause()
    previewVideoRef.value.currentTime = 0
  }
}

// 缩略图加载失败处理
function handleThumbnailError() {
  videoThumbnailUrl.value = ''
}

const props = withDefaults(defineProps<{
  prompt: Prompt
  rotationIndex?: number
  isSelected?: boolean
  isBatchMode?: boolean
}>(), {
  rotationIndex: 0,
  isSelected: false,
  isBatchMode: false
})

const emit = defineEmits<{
  (e: 'click'): void
  (e: 'toggle-favorite', id: number | undefined): void
  (e: 'toggle-private', prompt: Prompt): void
  (e: 'copy', prompt: Prompt): void
  (e: 'open-image', images: string[], videos: string[], index: number): void
  (e: 'edit', id: number | undefined): void
  (e: 'delete', id: number | undefined): void
  (e: 'select', id: number | undefined): void
}>()

function handleClick() {
  if (props.isBatchMode) {
    emit('select', props.prompt.id)
  } else {
    emit('click')
  }
}

const thumbnailRotations = [3, -2, 4, -3, 2, -4]

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

function getShortCategory(category: string): string {
  const shortNames: Record<string, string> = {
    'Image Generation': 'IMAGE',
    'Video Prompt': 'VIDEO',
    'Coding': 'CODE',
    'General': 'GENERAL',
    'Concept Art': 'ART',
    'Layout Design': 'LAYOUT'
  }
  return shortNames[category] || category.toUpperCase()
}
</script>
