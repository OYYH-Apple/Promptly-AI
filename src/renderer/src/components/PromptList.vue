<template>
  <div class="bg-surface-container-lowest rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
    <table class="w-full text-left border-collapse">
      <thead>
        <tr class="bg-surface-container-low/50">
          <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant/80">Name</th>
          <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant/80">Category</th>
          <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant/80">Date Edited</th>
          <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant/80 text-right">Option</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100">
        <tr
          v-for="prompt in prompts"
          :key="prompt.id"
          class="hover:bg-surface-container-low/30 transition-colors group cursor-pointer"
          @click="$emit('click', prompt)"
        >
          <td class="px-6 py-3">
            <div class="flex items-center gap-3">
              <Thumbnail
                v-if="prompt.reference_images?.length"
                :image-url="prompt.reference_images[0]"
                :count="prompt.reference_images.length"
                :rotation="getThumbnailRotation(prompt.id)"
                @click="$emit('open-image', prompt.reference_images, 0)"
              />
              <div v-else class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" :class="getCategoryStyle(prompt.category).bg">
                <span class="material-symbols-outlined text-lg" :class="getCategoryStyle(prompt.category).textColor">{{ getCategoryStyle(prompt.category).icon }}</span>
              </div>
              <div>
                <p class="font-medium text-on-surface">{{ prompt.title }}</p>
                <p class="text-xs text-on-surface-variant line-clamp-1">{{ prompt.content_zh?.slice(0, 50) || prompt.content_en?.slice(0, 50) }}...</p>
              </div>
            </div>
          </td>
          <td class="px-6 py-3">
            <span class="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap text-center" :class="getCategoryStyle(prompt.category).badgeList" style="padding:10px;">
              {{ prompt.category }}
            </span>
          </td>
          <td class="px-6 py-3 text-sm text-on-surface-variant">
            {{ formatDate(prompt.updated_at) }}
          </td>
          <td class="px-6 py-3 text-right">
            <div class="flex items-center justify-end gap-2">
              <Tooltip :text="prompt.is_private ? 'Private - Click to make public' : 'Public - Click to make private'" placement="top">
                <button
                  @click.stop="$emit('toggle-private', prompt)"
                  class="p-1 rounded-lg hover:bg-surface-container-high transition-colors"
                >
                  <span
                    class="material-symbols-outlined text-base"
                    :class="prompt.is_private ? 'text-slate-400' : 'text-primary'"
                  >
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
  </div>
</template>

<script setup lang="ts">
import type { Prompt } from '@/stores/prompts'
import Thumbnail from './Thumbnail.vue'
import Tooltip from './Tooltip.vue'

defineProps<{
  prompts: Prompt[]
}>()

defineEmits<{
  (e: 'click', prompt: Prompt): void
  (e: 'open-image', images: string[], index: number): void
  (e: 'toggle-private', prompt: Prompt): void
}>()

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
