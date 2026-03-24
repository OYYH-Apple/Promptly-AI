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
        <PromptList
          :prompts="group"
          @click="(prompt: Prompt) => router.push(`/prompt/${prompt.id}`)"
          @open-image="openImageViewer"
          @toggle-private="handleTogglePrivate"
        >
          <template #actions="{ prompt }">
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
          </template>
        </PromptList>
      </section>

      <div v-if="Object.keys(groupedPrompts).length === 0" class="text-center py-20">
        <span class="material-symbols-outlined text-6xl text-slate-300">history</span>
        <p class="text-slate-500 mt-4">No recent activity.</p>
      </div>

      <div class="h-24"></div>
    </div>

    <ImageViewer
      v-model:visible="viewerVisible"
      :images="viewerImages"
      :initial-index="viewerIndex"
      @close="viewerVisible = false"
    />
    <ConfirmDialog
      v-model:visible="showPrivacyDialog"
      type="warning"
      :title="privacyPrompt?.is_private ? 'Make Public' : 'Make Private'"
      :message="privacyPrompt?.is_private ? 'This prompt will be visible to others when sharing features are enabled. Are you sure?' : 'This prompt will be hidden from others. Are you sure?'"
      :confirm-text="privacyPrompt?.is_private ? 'Make Public' : 'Make Private'"
      cancel-text="Cancel"
      @confirm="confirmTogglePrivate"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePromptStore, type Prompt } from '@/stores/prompts'
import ImageViewer from '@/components/ImageViewer.vue'
import PromptList from '@/components/PromptList.vue'
import Tooltip from '@/components/Tooltip.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const router = useRouter()
const store = usePromptStore()
const selectedCategory = ref('All')
const viewerVisible = ref(false)
const viewerImages = ref<string[]>([])
const viewerIndex = ref(0)
const showPrivacyDialog = ref(false)
const privacyPrompt = ref<Prompt | null>(null)

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

function openImageViewer(images: string[], index: number) {
  viewerImages.value = images
  viewerIndex.value = index
  viewerVisible.value = true
}

function handleTogglePrivate(prompt: Prompt) {
  privacyPrompt.value = prompt
  showPrivacyDialog.value = true
}

async function confirmTogglePrivate() {
  if (privacyPrompt.value) {
    await store.updatePrompt(privacyPrompt.value.id!, {
      is_private: !privacyPrompt.value.is_private
    })
    showToast(privacyPrompt.value.is_private ? 'Prompt is now public' : 'Prompt is now private', 'success')
    privacyPrompt.value = null
  }
}

onMounted(() => {
  store.fetchPrompts()
})
</script>
