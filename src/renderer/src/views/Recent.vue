<template>
  <section class="flex-1 overflow-y-auto p-10 bg-surface">
    <div class="max-w-5xl mx-auto">
      <div class="mb-10 flex items-end justify-between">
        <div>
          <p class="text-primary font-bold tracking-widest uppercase mb-1"
            :class="locale === 'zh-CN' ? 'text-xs' : 'text-[10px]'">{{ t('recent.activityLog') }}</p>
          <h2 class="text-3xl font-extrabold tracking-tight text-on-surface">{{ t('recent.title') }}</h2>
        </div>
        <div class="flex items-center gap-2 bg-surface-container-low p-1 rounded-xl">
          <Tooltip v-for="cat in categories" :key="cat.value" :text="cat.tooltip" placement="bottom">
            <button @click="selectedCategory = cat.value" class="px-4 py-1.5 font-semibold rounded-lg transition-colors"
              :class="[selectedCategory === cat.value ? 'bg-white shadow-sm text-primary' : 'text-secondary hover:text-on-surface', locale === 'zh-CN' ? 'text-sm' : 'text-xs']">
              {{ cat.label }}
            </button>
          </Tooltip>
        </div>
      </div>

      <section v-for="(group, label) in groupedPrompts" :key="label" class="mb-12">
        <div class="flex items-center gap-4 mb-6">
          <span class="font-bold uppercase tracking-widest text-secondary/60"
            :class="locale === 'zh-CN' ? 'text-sm' : 'text-xs'">{{ label }}</span>
          <div class="h-[1px] flex-1 bg-slate-100"></div>
        </div>
        <PromptList :prompts="group" @click="(prompt: Prompt) => router.push(`/prompt/${prompt.id}`)"
          @open-image="openImageViewer" @toggle-private="handleTogglePrivate">
          <template #actions="{ prompt }">
            <button @click.stop="copyPrompt(prompt)"
              class="flex items-center gap-2 px-4 py-2 bg-secondary-container text-on-secondary-container rounded-lg font-semibold hover:bg-slate-200 transition-colors"
              :class="locale === 'zh-CN' ? 'text-sm' : 'text-sm'">
              <span class="material-symbols-outlined text-[18px]">content_copy</span>
              <span class="min-w-[30px]">{{ t('common.copy') }}</span>
            </button>
            <button @click.stop="router.push(`/prompt/${prompt.id}`)"
              class="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-semibold hover:shadow-lg transition-all active:scale-95"
              :class="locale === 'zh-CN' ? 'text-sm' : 'text-sm'">
              <span class="material-symbols-outlined text-[18px]">open_in_new</span>
              <span class="min-w-[30px]">{{ t('common.open') }}</span>
            </button>
          </template>
        </PromptList>
      </section>

      <div v-if="Object.keys(groupedPrompts).length === 0" class="text-center py-20">
        <span class="material-symbols-outlined text-6xl text-slate-300">history</span>
        <p class="text-slate-500 mt-4">{{ t('recent.noRecentActivity') }}</p>
      </div>

      <div class="h-24"></div>
    </div>

    <ImageViewer v-model:visible="viewerVisible" :images="viewerImages" :initial-index="viewerIndex"
      @close="viewerVisible = false" />
    <ConfirmDialog v-model:visible="showPrivacyDialog" type="warning"
      :title="privacyPrompt?.is_private ? t('dialog.makePublicTitle') : t('dialog.makePrivateTitle')"
      :message="privacyPrompt?.is_private ? t('dialog.makePublicMessage') : t('dialog.makePrivateMessage')"
      :confirm-text="privacyPrompt?.is_private ? t('dialog.makePublicTitle') : t('dialog.makePrivateTitle')"
      :cancel-text="t('dialog.cancel')" @confirm="confirmTogglePrivate" />
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePromptStore, type Prompt } from '@/stores/prompts'
import ImageViewer from '@/components/ImageViewer.vue'
import PromptList from '@/components/PromptList.vue'
import Tooltip from '@/components/Tooltip.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const router = useRouter()
const store = usePromptStore()
const { t, locale } = useI18n()
const selectedCategory = ref('All')
const viewerVisible = ref(false)
const viewerImages = ref<string[]>([])
const viewerIndex = ref(0)
const showPrivacyDialog = ref(false)
const privacyPrompt = ref<Prompt | null>(null)

const categories = computed(() => [
  { value: 'All', label: t('recent.all'), tooltip: t('recent.showAllPrompts') },
  { value: 'Image Generation', label: t('recent.image'), tooltip: t('recent.showImagePrompts') },
  { value: 'Video Prompt', label: t('recent.video'), tooltip: t('recent.showVideoPrompts') }
])

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
      label = t('time.today')
    } else if (promptDate.getTime() === yesterday.getTime()) {
      label = t('time.yesterday')
    } else {
      label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    if (!groups[label]) groups[label] = []
    groups[label].push(prompt)
  })

  return groups
})

async function copyPrompt(prompt: any) {
  const content = prompt.content_zh || prompt.content_en
  if (content) {
    await navigator.clipboard.writeText(content)
    showToast(t('toast.copied'), 'success')
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
    showToast(privacyPrompt.value.is_private ? t('toast.promptNowPublic') : t('toast.promptNowPrivate'), 'success')
    privacyPrompt.value = null
  }
}

onMounted(() => {
  store.fetchPrompts()
})
</script>
