<template>
  <section class="flex-1 overflow-y-auto p-10 bg-surface">
    <div class="max-w-7xl mx-auto space-y-12">
      <div class="flex items-end justify-between">
        <div>
          <h2 class="text-3xl font-bold tracking-tight text-on-surface mb-2">{{ t('library.title') }}</h2>
          <p class="text-on-surface-variant max-w-md">{{ t('library.subtitle') }}</p>
        </div>
        <div class="flex gap-2 p-1 bg-surface-container-low rounded-xl">
          <Tooltip :text="t('tooltip.gridView')" placement="bottom">
            <button
              @click="viewMode = 'grid'"
              :class="['px-4 py-1.5 font-medium rounded-lg text-sm transition-colors', viewMode === 'grid' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high']"
            >
              {{ t('view.grid') }}
            </button>
          </Tooltip>
          <Tooltip :text="t('tooltip.listView')" placement="bottom">
            <button
              @click="viewMode = 'list'"
              :class="['px-4 py-1.5 font-medium rounded-lg text-sm transition-colors', viewMode === 'list' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high']"
            >
              List
            </button>
          </Tooltip>
        </div>
      </div>

      <div v-if="store.loading" class="flex items-center justify-center py-20">
        <span class="material-symbols-outlined animate-spin text-primary">progress_activity</span>
      </div>

      <div v-else-if="store.prompts.length === 0" class="text-center py-20">
        <span class="material-symbols-outlined text-6xl text-slate-300">folder_open</span>
        <p class="text-slate-500 mt-4">{{ t('empty.noPrompts') }}</p>
        <button @click="router.push('/create')" class="mt-4 px-6 py-2 bg-primary text-white rounded-xl font-medium">
          {{ t('empty.createPrompt') }}
        </button>
      </div>

      <template v-else>
        <!-- Grid View -->
        <template v-if="viewMode === 'grid'">
          <PromptSection
            :title="t('library.imagePrompts')"
            icon="image"
            icon-color="#005bc1"
            :items="imagePrompts"
            :add-button-text="t('library.newTemplate')"
            @add="router.push({ path: '/create', query: { category: 'Image Generation' } })"
          >
            <template #default="{ items }">
              <PromptCard
                v-for="(prompt, idx) in items"
                :key="prompt.id"
                :prompt="prompt"
                :rotation-index="idx"
                @click="router.push(`/prompt/${prompt.id}`)"
                @toggle-favorite="store.toggleFavorite(prompt.id as number)"
                @toggle-private="handleTogglePrivate"
                @copy="copyPrompt"
                @open-image="openImageViewer"
                @edit="handleEdit"
                @delete="handleDelete"
              />
            </template>
          </PromptSection>

          <PromptSection
            :title="t('library.videoPrompts')"
            icon="movie"
            icon-color="#5f5c78"
            :items="videoPrompts"
            :add-button-text="t('library.newTemplate')"
            @add="router.push({ path: '/create', query: { category: 'Video Prompt' } })"
          >
            <template #default="{ items }">
              <PromptCard
                v-for="(prompt, idx) in items"
                :key="prompt.id"
                :prompt="prompt"
                :rotation-index="idx"
                @click="router.push(`/prompt/${prompt.id}`)"
                @toggle-favorite="store.toggleFavorite(prompt.id as number)"
                @toggle-private="handleTogglePrivate"
                @copy="copyPrompt"
                @open-image="openImageViewer"
                @edit="handleEdit"
                @delete="handleDelete"
              />
            </template>
          </PromptSection>
        </template>

        <!-- List View -->
        <PromptList
          v-else
          :prompts="store.filteredPrompts"
          @click="(prompt: Prompt) => router.push(`/prompt/${prompt.id}`)"
          @open-image="openImageViewer"
          @toggle-private="handleTogglePrivate"
        >
          <template #actions="{ prompt }">
            <Tooltip :text="prompt.is_favorite ? t('tooltip.removeFromFavorites') : t('tooltip.addToFavorites')" placement="top">
              <button @click.stop="store.toggleFavorite(prompt.id!)" class="p-2 rounded-full hover:bg-surface-container transition-colors text-primary">
                <span class="material-symbols-outlined text-on-surface-variant" :style="{ fontVariationSettings: prompt.is_favorite ? `'FILL' 1` : `'FILL' 0` }">grade</span>
              </button>
            </Tooltip>
            <Tooltip :text="t('tooltip.copy')" placement="top">
              <button @click.stop="copyPrompt(prompt)" class="p-2 rounded-full hover:bg-surface-container transition-colors">
                <span class="material-symbols-outlined text-on-surface-variant">content_copy</span>
              </button>
            </Tooltip>
            <Tooltip :text="t('tooltip.edit')" placement="top">
              <button @click.stop="router.push(`/edit/${prompt.id}`)" class="p-2 rounded-full hover:bg-surface-container transition-colors">
                <span class="material-symbols-outlined text-on-surface-variant">edit</span>
              </button>
            </Tooltip>
            <Tooltip :text="t('tooltip.delete')" placement="top">
              <button @click.stop="handleDelete(prompt.id!)" class="p-2 rounded-full hover:bg-surface-container transition-colors">
                <span class="material-symbols-outlined text-on-surface-variant">delete</span>
              </button>
            </Tooltip>
          </template>
        </PromptList>

        <div class="flex items-center justify-between text-on-surface-variant text-sm px-2 mt-6">
          <p>{{ t('view.showing', { filtered: store.filteredPrompts.length, total: store.prompts.length }) }}</p>
        </div>
      </template>
    </div>
    <ImageViewer v-model:visible="viewerVisible" :images="viewerImages" :initial-index="viewerIndex" @close="viewerVisible = false" />
    <ConfirmDialog
      v-model:visible="showDeleteDialog"
      type="danger"
      :title="t('dialog.deletePromptTitle')"
      :message="t('dialog.deletePromptMessage')"
      :confirm-text="t('dialog.delete')"
      :cancel-text="t('dialog.cancel')"
      @confirm="confirmDelete"
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
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import Tooltip from '@/components/Tooltip.vue'

const { t } = useI18n()

const router = useRouter()
const store = usePromptStore()
const viewMode = ref<'grid' | 'list'>('grid')
const viewerVisible = ref(false)
const viewerImages = ref<string[]>([])
const viewerIndex = ref(0)
const showDeleteDialog = ref(false)
const deletePromptId = ref<number | null>(null)
const showPrivacyDialog = ref(false)
const privacyPrompt = ref<Prompt | null>(null)

const imagePrompts = computed(() => {
  return store.prompts.filter(p => p.category === 'Image Generation')
})

const videoPrompts = computed(() => {
  return store.prompts.filter(p => p.category === 'Video Prompt')
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

function handleEdit(id: number | undefined) {
  if (id) router.push(`/edit/${id}`)
}

function handleDelete(id: number | undefined) {
  if (id) {
    deletePromptId.value = id
    showDeleteDialog.value = true
  }
}

async function confirmDelete() {
  if (deletePromptId.value) {
    await store.deletePrompt(deletePromptId.value)
    showToast(t('toast.promptDeleted'), 'success')
    deletePromptId.value = null
  }
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
