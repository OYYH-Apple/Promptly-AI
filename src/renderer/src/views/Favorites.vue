<template>
  <section class="flex-1 overflow-y-auto p-10 bg-surface">
    <div class="max-w-7xl mx-auto space-y-12">
      <div class="flex items-end justify-between">
        <div>
          <h2 class="text-3xl font-bold tracking-tight text-on-surface mb-2">{{ t('favorites.title') }}</h2>
          <p class="text-on-surface-variant max-w-md">{{ t('favorites.subtitle') }}</p>
        </div>
        <div class="flex gap-2 p-1 bg-surface-container-low rounded-xl">
          <Tooltip :text="t('tooltip.gridView')" placement="bottom">
            <button
              @click="viewMode = 'grid'"
              :class="['px-4 py-1.5 font-medium rounded-lg text-sm transition-colors', viewMode === 'grid' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high']"
            >{{ t('view.grid') }}</button>
          </Tooltip>
          <Tooltip :text="t('tooltip.listView')" placement="bottom">
            <button
              @click="viewMode = 'list'"
              :class="['px-4 py-1.5 font-medium rounded-lg text-sm transition-colors', viewMode === 'list' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high']"
            >{{ t('view.list') }}</button>
          </Tooltip>
        </div>
      </div>

      <div v-if="store.loading" class="flex items-center justify-center py-20">
        <span class="material-symbols-outlined animate-spin text-primary">progress_activity</span>
      </div>

      <div v-else-if="favorites.length === 0" class="text-center py-20">
        <span class="material-symbols-outlined text-6xl text-slate-300">grade</span>
        <p class="text-slate-500 mt-4">{{ t('empty.noFavorites') }}</p>
      </div>

      <template v-else>
        <!-- Grid View -->
        <template v-if="viewMode === 'grid'">
          <PromptSection
            :title="t('library.imagePrompts')"
            icon="image"
            icon-color="#005bc1"
            :items="imageFavorites"
            :show-add-button="false"
          >
<template #default="{ items }">
      <PromptCard
        v-for="(prompt, idx) in items"
        :key="prompt.id"
        :prompt="prompt"
        :rotation-index="idx"
        @click="router.push(`/prompt/${prompt.id}`)"
        @toggle-favorite="prompt.id && store.toggleFavorite(prompt.id)"
        @toggle-private="handleTogglePrivate"
        @copy="copyPrompt"
        @open-image="openImageViewer"
      />
    </template>
    </PromptSection>

    <PromptSection
      :title="t('library.videoPrompts')"
      icon="movie"
      icon-color="#5f5c78"
      :items="videoFavorites"
      :show-add-button="false"
    >
    <template #default="{ items }">
      <PromptCard
        v-for="(prompt, idx) in items"
        :key="prompt.id"
        :prompt="prompt"
        :rotation-index="idx"
        @click="router.push(`/prompt/${prompt.id}`)"
        @toggle-favorite="prompt.id && store.toggleFavorite(prompt.id)"
        @toggle-private="handleTogglePrivate"
        @copy="copyPrompt"
        @open-image="openImageViewer"
      />
    </template>
    </PromptSection>
        </template>

        <!-- List View -->
        <PromptList
          v-else
          :prompts="favorites"
          @click="(prompt: Prompt) => router.push(`/prompt/${prompt.id}`)"
          @open-image="openImageViewer"
          @toggle-private="handleTogglePrivate"
        >
          <template #actions="{ prompt }">
            <Tooltip :text="t('tooltip.removeFromFavorites')" placement="top">
              <button
                @click.stop="store.toggleFavorite(prompt.id!)"
                class="p-2 rounded-full hover:bg-surface-container transition-colors"
              >
                <span
                  class="material-symbols-outlined text-primary"
                  :style="{ fontVariationSettings: prompt.is_favorite ? `'FILL' 1` : `'FILL' 0` }"
                >grade</span>
              </button>
            </Tooltip>
            <Tooltip :text="t('tooltip.copy')" placement="top">
              <button
                @click.stop="copyPrompt(prompt)"
                class="p-2 rounded-full hover:bg-surface-container transition-colors"
              >
                <span class="material-symbols-outlined text-on-surface-variant">content_copy</span>
              </button>
            </Tooltip>
          </template>
        </PromptList>

        <div class="flex items-center justify-between text-on-surface-variant text-sm px-2 mt-6">
          <p>{{ t('view.showingFavorites', { count: favorites.length }) }}</p>
        </div>
      </template>
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
      :title="privacyPrompt?.is_private ? t('dialog.makePublicTitle') : t('dialog.makePrivateTitle')"
      :message="privacyPrompt?.is_private ? t('dialog.makePublicMessage') : t('dialog.makePrivateMessage')"
      :confirm-text="privacyPrompt?.is_private ? t('dialog.makePublicTitle') : t('dialog.makePrivateTitle')"
      :cancel-text="t('dialog.cancel')"
      @confirm="confirmTogglePrivate"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePromptStore, type Prompt } from '@/stores/prompts'
import ImageViewer from '@/components/ImageViewer.vue'
import PromptCard from '@/components/PromptCard.vue'
import PromptSection from '@/components/PromptSection.vue'
import PromptList from '@/components/PromptList.vue'
import Tooltip from '@/components/Tooltip.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const router = useRouter()
const store = usePromptStore()
const { t } = useI18n()

const viewMode = ref<'grid' | 'list'>('grid')
const viewerVisible = ref(false)
const viewerImages = ref<string[]>([])
const viewerIndex = ref(0)
const showPrivacyDialog = ref(false)
const privacyPrompt = ref<Prompt | null>(null)

const favorites = computed(() => store.prompts.filter(p => p.is_favorite))

const imageFavorites = computed(() => {
  return favorites.value.filter(p => p.category === 'Image Generation')
})

const videoFavorites = computed(() => {
  return favorites.value.filter(p => p.category === 'Video Prompt')
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
  store.fetchPrompts({ favorites: true })
})
</script>
