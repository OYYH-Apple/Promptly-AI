<template>
  <aside class="fixed left-0 top-0 bottom-0 w-20 bg-[#f9f9fe] border-r border-slate-200/15 flex flex-col items-center py-6">
    <div class="mb-8">
      <img src="@/public/logo.png" alt="Promptly AI" class="w-12 h-12 rounded-xl" />
    </div>

    <Tooltip text="New Prompt" placement="right" :delay="0">
      <button
        @click="router.push('/create')"
        class="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-xl active:scale-[0.98] transition-all shadow-md shadow-primary/10 mb-6"
      >
        <span class="material-symbols-outlined">add</span>
      </button>
    </Tooltip>

    <div class="flex flex-col gap-1 flex-1">
      <Tooltip
        v-for="item in navItems"
        :key="item.path"
        :text="item.label"
        placement="right"
        :delay="0"
      >
        <router-link
          :to="item.path"
          class="w-14 h-11 flex items-center justify-center rounded-xl transition-all duration-200"
          :class="$route.path === item.path || ($route.path === '/' && item.path === '/')
            ? 'bg-[#007AFF]/8 text-[#007AFF]'
            : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-900'"
        >
          <span class="material-symbols-outlined text-[22px]">{{ item.icon }}</span>
        </router-link>
      </Tooltip>
    </div>

    <div class="mt-auto flex flex-col items-center gap-3">
      <Tooltip :text="`Storage ${formatBytes(storageSize)}`" placement="right" :delay="0">
        <div class="w-8 h-8 flex items-center justify-center text-slate-400">
          <span class="material-symbols-outlined text-[20px]">database</span>
        </div>
      </Tooltip>
      <Tooltip text="User" placement="right" :delay="0">
        <div class="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden border border-slate-100">
          <div class="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500"></div>
        </div>
      </Tooltip>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePromptStore } from '@/stores/prompts'
import Tooltip from './Tooltip.vue'

const router = useRouter()
const store = usePromptStore()

const storageSize = computed(() => {
  let size = 0
  store.prompts.forEach(p => {
    size += (p.content_zh?.length || 0) * 2
    size += (p.content_en?.length || 0) * 2
    size += p.title.length * 2
    p.reference_images?.forEach(img => {
      size += img.length * 0.75
    })
  })
  return size
})

const navItems = [
  { path: '/', label: 'Prompt Library', icon: 'folder_special' },
  { path: '/favorites', label: 'Favorites', icon: 'grade' },
  { path: '/collections', label: 'Collections', icon: 'folder_copy' },
  { path: '/recent', label: 'Recent', icon: 'history' },
  { path: '/settings', label: 'Settings', icon: 'settings' }
]

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
</script>
