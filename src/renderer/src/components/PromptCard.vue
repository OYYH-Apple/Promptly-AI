<template>
  <div
    class="group bg-surface-container-lowest border border-slate-100 p-6 rounded-2xl flex flex-col gap-4 hover:scale-[1.02] transition-all duration-300 relative cursor-pointer"
    @click="$emit('click')"
  >
    <div
      v-if="prompt.reference_images?.length"
      class="absolute -top-2 -right-2 z-10"
      @click.stop="$emit('open-image', prompt.reference_images, 0)"
      :style="{
        transform: `rotate(${thumbnailRotations[rotationIndex % thumbnailRotations.length]}deg)`
      }"
    >
      <div
        class="thumb-peel shadow-lg border-2 border-white rounded-sm overflow-visible bg-white"
        :style="{
          height: '112px',
          width: 'fit-content',
          padding: '3px',
          cursor: 'zoom-in'
        }"
      >
        <img :src="prompt.reference_images[0]" alt="Thumbnail" class="w-full h-full object-contain" />
        <span
          class="material-symbols-outlined absolute -top-3 text-slate-400 rotate-[40deg] scale-x-[-1] z-20 font-light"
          style="font-variation-settings: 'wght' 300; font-size: 28px; --tw-translate-x: 22px;"
        >
          attachment
        </span>
      </div>
    </div>

    <div class="flex items-center justify-between">
      <span
        class="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full"
        :class="getCategoryStyle(prompt.category).badge"
      >
        {{ prompt.category }}
      </span>
      <span class="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors text-xl">
        {{ getCategoryStyle(prompt.category).icon }}
      </span>
    </div>

    <h3 class="font-bold text-lg text-slate-800 leading-tight">{{ prompt.title }}</h3>
    <p class="text-sm text-slate-500 line-clamp-6" style="min-height: 120px;">{{ prompt.content_zh || prompt.content_en }}</p>

    <div class="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
      <span class="text-[11px] font-medium text-slate-400">{{ formatDate(prompt.updated_at) }}</span>
      <div class="flex items-center gap-1">
        <slot name="actions" :prompt="prompt">
          <Tooltip :text="prompt.is_favorite ? 'Remove from favorites' : 'Add to favorites'" placement="top">
            <button
              @click.stop="$emit('toggle-favorite', prompt.id)"
              class="text-x1 text-primary transition-colors p-1"
            >
              <span
                class="material-symbols-outlined text-xl"
                :style="{ fontVariationSettings: prompt.is_favorite ? `'FILL' 1` : `'FILL' 0` }"
              >
                grade
              </span>
            </button>
          </Tooltip>
          <Tooltip text="Copy" placement="top">
            <button
              @click.stop="$emit('copy', prompt)"
              class="text-slate-300 hover:text-slate-600 transition-colors p-1"
            >
              <span class="material-symbols-outlined text-lg">content_copy</span>
            </button>
          </Tooltip>
          <Tooltip text="Edit" placement="top">
            <button
              @click.stop="$emit('edit', prompt.id)"
              class="text-slate-300 hover:text-blue-500 transition-colors p-1"
            >
              <span class="material-symbols-outlined text-lg">edit</span>
            </button>
          </Tooltip>
          <Tooltip text="Delete" placement="top">
            <button
              @click.stop="$emit('delete', prompt.id)"
              class="text-slate-300 hover:text-red-500 transition-colors p-1"
            >
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
import Tooltip from './Tooltip.vue'

withDefaults(defineProps<{
  prompt: Prompt
  rotationIndex?: number
}>(), {
  rotationIndex: 0
})

defineEmits<{
  (e: 'click'): void
  (e: 'toggle-favorite', id: number | undefined): void
  (e: 'copy', prompt: Prompt): void
  (e: 'open-image', images: string[], index: number): void
  (e: 'edit', id: number | undefined): void
  (e: 'delete', id: number | undefined): void
}>()

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

function formatDate(date?: string) {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<style scoped>
.thumb-peel {
  position: relative;
  transform-origin: 50% 0%;
  transition:
    transform 0.35s ease,
    box-shadow 0.35s ease,
    filter 0.35s ease;
  transform: perspective(800px) rotateX(0deg) rotateY(0deg);
  will-change: transform;
}

.thumb-peel:hover {
  transform: perspective(800px) rotateX(14deg) rotateY(-16deg);
  box-shadow: 0 16px 28px rgba(0, 0, 0, 0.18);
  filter: brightness(1.02);
}
</style>
