<template>
  <section class="flex-1 overflow-y-auto p-10 bg-surface">
    <div class="max-w-5xl mx-auto">
      <div class="mb-10 flex items-end justify-between">
        <div>
          <p class="text-primary font-bold tracking-widest text-[10px] uppercase mb-1">Activity Log</p>
          <h2 class="text-3xl font-extrabold tracking-tight text-on-surface">Recent Prompts</h2>
        </div>
      </div>

      <section v-for="(group, label) in groupedPrompts" :key="label" class="mb-12">
        <div class="flex items-center gap-4 mb-6">
          <span class="text-xs font-bold uppercase tracking-widest text-secondary/60">{{ label }}</span>
          <div class="h-[1px] flex-1 bg-slate-100"></div>
        </div>
        <div class="grid gap-4">
          <div 
            v-for="prompt in group" 
            :key="prompt.id"
            class="group relative bg-surface-container-lowest p-5 rounded-2xl flex items-center justify-between hover:scale-[1.01] transition-all duration-300 border border-transparent hover:border-slate-100 shadow-sm hover:shadow-md cursor-pointer"
            @click="router.push(`/prompt/${prompt.id}`)"
          >
            <div class="flex items-center gap-5">
              <div class="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <span class="material-symbols-outlined text-3xl">{{ getCategoryIcon(prompt.category) }}</span>
              </div>
              <div>
                <div class="flex items-center gap-3 mb-1">
                  <h3 class="text-lg font-bold text-on-surface">{{ prompt.title }}</h3>
                  <span class="px-2 py-0.5 rounded-md bg-primary-container text-on-primary-container text-[10px] font-bold uppercase tracking-wider">{{ prompt.category }}</span>
                </div>
                <p class="text-sm text-secondary font-medium flex items-center gap-2">
                  <span class="material-symbols-outlined text-sm">schedule</span>
                  {{ formatTime(prompt.updated_at) }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button @click.stop="copyPrompt(prompt.content)" class="flex items-center gap-2 px-4 py-2 bg-secondary-container text-on-secondary-container rounded-lg font-semibold text-sm hover:bg-slate-200 transition-colors">
                <span class="material-symbols-outlined text-[18px]">content_copy</span>
                <span>Copy</span>
              </button>
              <button @click.stop="router.push(`/prompt/${prompt.id}`)" class="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-semibold text-sm hover:shadow-lg transition-all active:scale-95">
                <span class="material-symbols-outlined text-[18px]">open_in_new</span>
                <span>Open</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <div v-if="Object.keys(groupedPrompts).length === 0" class="text-center py-20">
        <span class="material-symbols-outlined text-6xl text-slate-300">history</span>
        <p class="text-slate-500 mt-4">No recent activity.</p>
      </div>

      <div class="h-24"></div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePromptStore } from '@/stores/prompts'

const router = useRouter()
const store = usePromptStore()

const groupedPrompts = computed(() => {
  const groups: Record<string, any[]> = {}
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)

  store.prompts.forEach(prompt => {
    const d = new Date(prompt.updated_at!)
    const promptDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    
    let label: string
    if (promptDate.getTime() === today.getTime()) {
      label = 'Today'
    } else if (promptDate.getTime() === yesterday.getTime()) {
      label = 'Yesterday'
    } else {
      label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    if (!groups[label]) groups[label] = []
    groups[label].push(prompt)
  })

  return groups
})

function getCategoryIcon(category: string) {
  const icons: Record<string, string> = {
    'Image Generation': 'image',
    'Video Prompt': 'movie',
    'Coding': 'code',
    'General': 'text_snippet'
  }
  return icons[category] || 'text_snippet'
}

function formatTime(date?: string) {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

async function copyPrompt(content: string) {
  await navigator.clipboard.writeText(content)
  showToast('Copied to clipboard', 'success')
}

function showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
  window.dispatchEvent(new CustomEvent('show-toast', {
    detail: { message, type, duration: 2000 }
  }))
}

onMounted(() => {
  store.fetchPrompts()
})
</script>
