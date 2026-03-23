<template>
  <aside class="fixed left-0 top-0 h-full w-72 border-r border-slate-200/15 bg-[#f9f9fe] flex flex-col p-6">
    <div class="flex items-center gap-3 mb-10 px-2">
      <img src="@/public/logo.png" alt="Promptly AI" class="w-12 h-12 rounded-xl" />
      <div>
        <h1 class="text-xl font-bold tracking-tight text-slate-900">Promptly AI</h1>
        <p class="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Personal Workspace</p>
      </div>
    </div>

    <button 
      @click="router.push('/create')"
      class="mb-8 w-full flex items-center justify-center gap-2 py-3 bg-primary text-white font-semibold rounded-xl active:scale-[0.98] transition-transform shadow-md shadow-primary/10"
    >
      <span class="material-symbols-outlined text-sm">add</span>
      New Prompt
    </button>

    <nav class="flex-1 space-y-1">
      <router-link 
        v-for="item in navItems" 
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200"
        :class="[
          $route.path === item.path || ($route.path === '/' && item.path === '/')
            ? 'bg-[#007AFF]/8 text-[#007AFF] font-semibold'
            : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-900'
        ]"
      >
        <span class="material-symbols-outlined">{{ item.icon }}</span>
        {{ item.label }}
      </router-link>
    </nav>

    <div class="mt-auto space-y-4 pt-6 border-t border-slate-200/50">
      <div class="flex items-center gap-3 px-4 py-2 text-slate-500">
        <span class="material-symbols-outlined text-sm">database</span>
        <span class="text-xs">Storage {{ formatBytes(storageSize) }}</span>
      </div>
      <div class="flex items-center gap-3 px-2">
        <div class="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden border border-slate-100">
          <div class="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500"></div>
        </div>
        <div class="flex-1">
          <p class="text-xs font-bold text-slate-900 leading-none">User</p>
          <p class="text-[10px] text-slate-400">Local Storage</p>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const storageSize = ref(0)

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

onMounted(async () => {
  const stats = await window.api.getStats()
  storageSize.value = stats.prompts * 1024
})
</script>
