<template>
  <section class="flex-1 overflow-y-auto p-10 bg-surface">
    <div class="max-w-7xl mx-auto">
      <div class="flex items-end justify-between mb-12">
        <div>
          <h2 class="text-3xl font-bold tracking-tight text-on-surface mb-2">Favorites</h2>
          <p class="text-on-surface-variant max-w-md">Quick access to your most-used and starred prompts.</p>
        </div>
      </div>

      <div v-if="store.loading" class="flex items-center justify-center py-20">
        <span class="material-symbols-outlined animate-spin text-primary">progress_activity</span>
      </div>

      <div v-else-if="favorites.length === 0" class="text-center py-20">
        <span class="material-symbols-outlined text-6xl text-slate-300">grade</span>
        <p class="text-slate-500 mt-4">No favorites yet. Star some prompts!</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <div 
          v-for="prompt in favorites" 
          :key="prompt.id"
          class="group bg-surface-container-lowest border border-slate-100 p-6 rounded-2xl flex flex-col gap-4 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
          @click="router.push(`/prompt/${prompt.id}`)"
        >
          <div class="flex items-center justify-between">
            <span class="px-3 py-1 bg-primary-container/30 text-primary-dim text-[10px] font-bold uppercase tracking-wider rounded-full">
              {{ prompt.category }}
            </span>
            <span class="material-symbols-outlined text-primary text-xl" style="font-variation-settings: 'FILL' 1">grade</span>
          </div>
<h3 class="font-bold text-lg text-slate-800 leading-tight">{{ prompt.title }}</h3>
    <p class="text-sm text-slate-500 line-clamp-2">{{ prompt.content_zh || prompt.content_en }}</p>
    <div class="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
      <span class="text-[11px] font-medium text-slate-400">{{ formatDate(prompt.updated_at) }}</span>
      <button @click.stop="copyPrompt(prompt)" class="text-slate-300 hover:text-slate-600">
        <span class="material-symbols-outlined text-lg">content_copy</span>
      </button>
    </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePromptStore } from '@/stores/prompts'

const router = useRouter()
const store = usePromptStore()

const favorites = computed(() => store.prompts.filter(p => p.is_favorite))

function formatDate(date?: string) {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString()
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

onMounted(() => {
  store.fetchPrompts({ favorites: true })
})
</script>
