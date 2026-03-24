<template>
  <section class="flex-1 overflow-y-auto p-10 bg-surface">
    <div class="max-w-5xl mx-auto">
      <div class="mb-10 flex items-end justify-between">
        <div>
          <p class="text-primary font-bold tracking-widest text-[10px] uppercase mb-1">Activity Log</p>
          <h2 class="text-3xl font-extrabold tracking-tight text-on-surface">Recent Prompts</h2>
        </div>
        <div class="flex items-center gap-2 bg-surface-container-low p-1 rounded-xl">
          <Tooltip
            v-for="cat in categories"
            :key="cat.value"
            :text="cat.tooltip"
            placement="bottom"
          >
            <button
              @click="selectedCategory = cat.value"
              class="px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors"
              :class="selectedCategory === cat.value ? 'bg-white shadow-sm text-primary' : 'text-secondary hover:text-on-surface'"
            >
              {{ cat.label }}
            </button>
          </Tooltip>
        </div>
      </div>

      <section v-for="(group, label) in groupedPrompts" :key="label" class="mb-12">
        <div class="flex items-center gap-4 mb-6">
          <span class="text-xs font-bold uppercase tracking-widest text-secondary/60">{{ label }}</span>
          <div class="h-[1px] flex-1 bg-slate-100"></div>
        </div>
        <div class="grid gap-4" :class="isToday(label) ? '' : 'opacity-80'">
          <div
            v-for="prompt in group"
            :key="prompt.id"
            class="group relative p-5 rounded-2xl flex items-center justify-between hover:scale-[1.01] transition-all duration-300 border border-transparent hover:border-slate-100 shadow-sm hover:shadow-md cursor-pointer"
            :class="isToday(label) ? 'bg-surface-container-lowest' : 'bg-surface-container-low/50 hover:bg-surface-container-lowest'"
            @click="router.push(`/prompt/${prompt.id}`)"
          >
            <div class="flex items-center gap-5">
              <div
                class="w-14 h-14 rounded-xl flex items-center justify-center"
                :style="{ backgroundColor: getCategoryBgColor(prompt.category), color: getCategoryTextColor(prompt.category) }"
              >
                <span class="material-symbols-outlined text-3xl">{{ getCategoryIcon(prompt.category) }}</span>
              </div>
              <div>
                <div class="flex items-center gap-3 mb-1">
                  <h3 class="text-lg font-bold text-on-surface">{{ prompt.title }}</h3>
                  <span
                    class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
                    :class="getCategoryBadgeClass(prompt.category)"
                  >
                    {{ getCategoryLabel(prompt.category) }}
                  </span>
                </div>
                <p class="text-sm text-secondary font-medium flex items-center gap-2">
                  <span class="material-symbols-outlined text-sm">schedule</span>
                  {{ formatTime(prompt.updated_at, label) }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                @click.stop="copyPrompt(prompt)"
                class="flex items-center gap-2 px-4 py-2 bg-secondary-container text-on-secondary-container rounded-lg font-semibold text-sm hover:bg-slate-200 transition-colors"
              >
                <span class="material-symbols-outlined text-[18px]">content_copy</span>
                <span>Copy</span>
              </button>
              <button
                @click.stop="router.push(`/prompt/${prompt.id}`)"
                class="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-semibold text-sm hover:shadow-lg transition-all active:scale-95"
              >
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePromptStore } from '@/stores/prompts'
import Tooltip from '@/components/Tooltip.vue'

const router = useRouter()
const store = usePromptStore()
const selectedCategory = ref('All')

const categories = [
  { value: 'All', label: 'All', tooltip: 'Show all prompts' },
  { value: 'Image Generation', label: 'Image', tooltip: 'Show image prompts' },
  { value: 'Video Prompt', label: 'Video', tooltip: 'Show video prompts' }
]

const filteredPrompts = computed(() => {
  if (selectedCategory.value === 'All') return store.prompts
  return store.prompts.filter(p => p.category === selectedCategory.value)
})

const groupedPrompts = computed(() => {
  const groups: Record<string, any[]> = {}
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)

  const sortedPrompts = [...filteredPrompts.value].sort((a, b) => {
    return new Date(b.updated_at!).getTime() - new Date(a.updated_at!).getTime()
  })

  sortedPrompts.forEach(prompt => {
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

function isToday(label: string) {
  return label === 'Today'
}

function getCategoryIcon(category: string) {
  const icons: Record<string, string> = {
    'Image Generation': 'image',
    'Video Prompt': 'movie_filter',
    'Coding': 'code',
    'General': 'text_snippet'
  }
  return icons[category] || 'text_snippet'
}

function getCategoryBgColor(category: string) {
  const colors: Record<string, string> = {
    'Image Generation': '#eff6ff',
    'Video Prompt': '#f3e8ff',
    'Coding': '#f1f5f9',
    'General': '#f5f5f5'
  }
  return colors[category] || '#f5f5f5'
}

function getCategoryTextColor(category: string) {
  const colors: Record<string, string> = {
    'Image Generation': '#2563eb',
    'Video Prompt': '#9333ea',
    'Coding': '#475569',
    'General': '#525252'
  }
  return colors[category] || '#525252'
}

function getCategoryBadgeClass(category: string) {
  const classes: Record<string, string> = {
    'Image Generation': 'bg-primary-container text-on-primary-container',
    'Video Prompt': 'bg-tertiary-container text-on-tertiary-container',
    'Coding': 'bg-secondary-container text-on-secondary-container',
    'General': 'bg-surface-container-high text-on-surface-variant'
  }
  return classes[category] || 'bg-surface-container-high text-on-surface-variant'
}

function getCategoryLabel(category: string) {
  const labels: Record<string, string> = {
    'Image Generation': 'Image',
    'Video Prompt': 'Video',
    'Coding': 'Code',
    'General': 'General'
  }
  return labels[category] || category
}

function formatTime(date?: string, groupLabel?: string) {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))

  if (groupLabel === 'Today') {
    if (hours < 1) return 'Just now'
    return `${hours}h ago`
  }

  if (groupLabel === 'Yesterday') {
    return `Yesterday at ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
  }

  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
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
  store.fetchPrompts()
})
</script>
