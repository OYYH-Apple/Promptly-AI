<template>
  <section class="flex-1 overflow-y-auto p-10 bg-surface">
    <div class="max-w-7xl mx-auto">
      <div class="flex items-end justify-between mb-12">
        <div>
          <h2 class="text-3xl font-bold tracking-tight text-on-surface mb-2">Favorites</h2>
          <p class="text-on-surface-variant max-w-md">Quick access to your most-used and starred prompts.</p>
        </div>
        <div class="flex gap-2 p-1 bg-surface-container-low rounded-xl">
          <button
            @click="viewMode = 'grid'"
            :class="['px-4 py-1.5 font-medium rounded-lg text-sm transition-colors', viewMode === 'grid' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high']"
          >Grid</button>
          <button
            @click="viewMode = 'list'"
            :class="['px-4 py-1.5 font-medium rounded-lg text-sm transition-colors', viewMode === 'list' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high']"
          >List</button>
        </div>
      </div>

      <div v-if="store.loading" class="flex items-center justify-center py-20">
        <span class="material-symbols-outlined animate-spin text-primary">progress_activity</span>
      </div>

      <div v-else-if="favorites.length === 0" class="text-center py-20">
        <span class="material-symbols-outlined text-6xl text-slate-300">grade</span>
        <p class="text-slate-500 mt-4">No favorites yet. Star some prompts!</p>
      </div>

      <template v-else>
        <div v-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <div
            v-for="(prompt, idx) in favorites"
            :key="prompt.id"
            class="group bg-surface-container-lowest border border-slate-100 p-6 rounded-2xl flex flex-col gap-4 hover:scale-[1.02] transition-all duration-300 relative cursor-pointer"
            @click="router.push(`/prompt/${prompt.id}`)"
          >
            <div
              v-if="prompt.reference_images?.length"
              class="absolute -top-2 -right-2 shadow-lg border-2 border-white rounded-sm overflow-visible z-10 transition-transform group-hover:rotate-0 bg-white"
              :style="{
                height: '112px',
                width: '90px',
                padding: '3px',
                transform: `rotate(${thumbnailRotations[idx % thumbnailRotations.length]}deg)`,
                cursor: 'zoom-in'
              }"
              @click.stop="openImageViewer(prompt.reference_images, 0)"
            >
              <img
                :src="prompt.reference_images[0]"
                alt="Thumbnail"
                class="w-full h-full object-contain"
              />
              <span
                class="material-symbols-outlined absolute -top-3 text-slate-400 rotate-[40deg] scale-x-[-1] z-20 font-light"
                style="font-variation-settings: 'wght' 300; font-size: 28px; --tw-translate-x: 22px;"
              >attachment</span>
            </div>

            <div class="flex items-center justify-between">
              <span
                class="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full"
                :class="getCategoryStyle(prompt.category).badge"
              >
                {{ prompt.category }}
              </span>
              <span
                class="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors text-xl"
              >
                {{ getCategoryStyle(prompt.category).icon }}
              </span>
            </div>
            <h3 class="font-bold text-lg text-slate-800 leading-tight">{{ prompt.title }}</h3>
            <p class="text-sm text-slate-500 line-clamp-6">{{ prompt.content_zh || prompt.content_en }}</p>
            <div class="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
              <span class="text-[11px] font-medium text-slate-400">{{ formatDate(prompt.updated_at) }}</span>
              <div class="flex items-center gap-1">
                <button
                  @click.stop="store.toggleFavorite(prompt.id!)"
                  class="text-primary transition-colors p-1"
                >
                  <span
                    class="material-symbols-outlined text-xl"
                    :style="{ fontVariationSettings: prompt.is_favorite ? `'FILL' 1` : `'FILL' 0` }"
                  >grade</span>
                </button>
                <button
                  @click.stop="copyPrompt(prompt)"
                  class="text-slate-300 hover:text-slate-600 transition-colors p-1"
                >
                  <span class="material-symbols-outlined text-lg">content_copy</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="bg-surface-container-lowest rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-surface-container-low/50">
                <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant/80">Name</th>
                <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant/80">Category</th>
                <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant/80">Date Edited</th>
                <th class="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="prompt in favorites"
                :key="prompt.id"
                class="hover:bg-surface-container-low/30 transition-colors group cursor-pointer"
                @click="router.push(`/prompt/${prompt.id}`)"
              >
                <td class="px-6 py-5">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-10 h-10 rounded-lg flex items-center justify-center"
                      :class="getCategoryStyle(prompt.category).bg"
                      style="min-width:40px;"
                    >
                      <span class="material-symbols-outlined text-lg" :class="getCategoryStyle(prompt.category).textColor">{{ getCategoryStyle(prompt.category).icon }}</span>
                    </div>
                    <div>
                      <p class="font-medium text-on-surface">{{ prompt.title }}</p>
                      <p class="text-xs text-on-surface-variant line-clamp-1">{{ prompt.content_zh?.slice(0, 50) || prompt.content_en?.slice(0, 50) }}...</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-5">
                  <span
                    class="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap text-center"
                    :class="getCategoryStyle(prompt.category).badgeList"
                    style="padding:10px;"
                  >
                    {{ prompt.category }}
                  </span>
                </td>
                <td class="px-6 py-5 text-sm text-on-surface-variant">
                  {{ formatDate(prompt.updated_at) }}
                </td>
                <td class="px-6 py-5 text-right">
                  <div class="flex items-center justify-center gap-1 transition-opacity">
                    <button
                      @click.stop="store.toggleFavorite(prompt.id!)"
                      class="p-2 rounded-full hover:bg-surface-container transition-colors"
                    >
                      <span
                        class="material-symbols-outlined text-primary"
                        :style="{ fontVariationSettings: prompt.is_favorite ? `'FILL' 1` : `'FILL' 0` }"
                      >grade</span>
                    </button>
                    <button
                      @click.stop="copyPrompt(prompt)"
                      class="p-2 rounded-full hover:bg-surface-container transition-colors"
                    >
                      <span class="material-symbols-outlined text-on-surface-variant">content_copy</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex items-center justify-between text-on-surface-variant text-sm px-2 mt-6">
          <p>Showing {{ favorites.length }} favorites</p>
        </div>
      </template>
    </div>

    <ImageViewer
      v-model:visible="viewerVisible"
      :images="viewerImages"
      :initial-index="viewerIndex"
      @close="viewerVisible = false"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePromptStore } from '@/stores/prompts'
import ImageViewer from '@/components/ImageViewer.vue'

const router = useRouter()
const store = usePromptStore()

const viewMode = ref<'grid' | 'list'>('grid')
const viewerVisible = ref(false)
const viewerImages = ref<string[]>([])
const viewerIndex = ref(0)

const thumbnailRotations = [3, -2, 4, -3, 2, -4]

const favorites = computed(() => store.prompts.filter(p => p.is_favorite))

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

async function copyPrompt(prompt: any) {
  const content = prompt.content_zh || prompt.content_en
  if (content) {
    await navigator.clipboard.writeText(content)
    showToast('Copied to clipboard', 'success')
  }
}

function showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
  window.dispatchEvent(new CustomEvent('show-toast', {
    detail: { message, type, duration: 2000 }
  }))
}

function openImageViewer(images: string[], index: number) {
  viewerImages.value = images
  viewerIndex.value = index
  viewerVisible.value = true
}

onMounted(() => {
  store.fetchPrompts({ favorites: true })
})
</script>
