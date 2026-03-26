<template>
  <section class="flex-1 overflow-y-auto p-10 bg-surface">
    <div class="max-w-7xl mx-auto" v-if="prompt">
      <nav class="mb-6 flex items-center gap-2 text-sm text-slate-500">
        <span @click="router.push('/')" class="hover:text-primary cursor-pointer transition-colors">{{ t('nav.library')
        }}</span>
        <span class="material-symbols-outlined text-[16px]">chevron_right</span>
        <span class="text-on-surface font-semibold">{{ prompt.title }}</span>
      </nav>

      <div class="flex items-start justify-between mb-10">
        <div>
          <h2 class="text-4xl font-extrabold tracking-tight text-on-surface mb-3">{{ prompt.title }}</h2>
          <p class="text-slate-500 flex items-center gap-2 text-sm font-medium">
            <span class="material-symbols-outlined text-[18px]">schedule</span>
            {{ t('prompt.lastUpdated') }} {{ formatRelativeTime(prompt.updated_at) }}
          </p>
        </div>
        <div class="flex gap-2">
          <Tooltip :text="prompt.is_favorite ? t('tooltip.removeFromFavorites') : t('tooltip.addToFavorites')"
            placement="bottom">
            <button @click="handleToggleFavorite"
              class="p-2.5 text-primary hover:bg-primary/5 rounded-xl transition-all">
              <span class="material-symbols-outlined" :style="{
                fontVariationSettings: prompt.is_favorite ? `'FILL' 1` : `'FILL' 0`
              }">
                grade
              </span>
            </button>
          </Tooltip>
          <Tooltip :text="t('tooltip.editPrompt')" placement="bottom">
            <button @click="router.push(`/edit/${prompt.id}`)"
              class="p-2.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
              <span class="material-symbols-outlined">edit</span>
            </button>
          </Tooltip>
          <Tooltip :text="t('tooltip.deletePrompt')" placement="bottom">
            <button @click="showDeleteDialog = true"
              class="p-2.5 text-slate-400 hover:text-error hover:bg-error-container/20 rounded-xl transition-all">
              <span class="material-symbols-outlined">delete</span>
            </button>
          </Tooltip>
        </div>
      </div>

      <div class="flex flex-col lg:flex-row gap-12">
        <div class="flex-1">
          <div class="prompt-card bg-surface-container-lowest rounded-2xl shadow-sm mb-12 overflow-hidden">
            <div class="tab-header flex">
              <button @click="activeTab = 'zh'" :class="['tab-item', { active: activeTab === 'zh' }]">
                <span class="tab-title flex items-center gap-2">
                  <span class="material-symbols-outlined text-[16px]">translate</span>
                  {{ t('common.chinese') }}
                </span>
              </button>
              <button @click="activeTab = 'en'" :class="['tab-item', { active: activeTab === 'en' }]">
                <span class="tab-title flex items-center gap-2">
                  <span class="material-symbols-outlined text-[16px]">language</span>
                  {{ t('common.english') }}
                </span>
              </button>
              <div class="flex-1 flex justify-end items-center px-4 py-3">
                <Tooltip :text="t('tooltip.copyToClipboard')" placement="left">
                  <button @click="copyPrompt(activeTab)"
                    class="flex items-center gap-2 px-3 py-1.5 bg-surface-container-low text-slate-600 hover:text-primary hover:bg-primary-container/30 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all">
                    <span class="material-symbols-outlined text-[14px]">content_copy</span>
                    {{ t('common.copy') }}
                  </button>
                </Tooltip>
              </div>
            </div>

            <div class="p-8 bg-surface-container-lowest">
              <p v-if="activeTab === 'zh' && prompt.content_zh"
                class="text-xl leading-relaxed text-slate-800 font-light whitespace-pre-wrap">
                {{ prompt.content_zh }}
              </p>
              <p v-else-if="activeTab === 'en' && prompt.content_en"
                class="text-xl leading-relaxed text-slate-800 font-light whitespace-pre-wrap">
                {{ prompt.content_en }}
              </p>
              <p v-else class="text-xl leading-relaxed text-slate-400 font-light italic">
                {{ t('prompt.noContent') }}
              </p>
            </div>
          </div>

          <section v-if="prompt.reference_images?.length">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-bold text-on-surface">{{ t('prompt.referenceOutput') }}</h3>
              <div class="flex gap-2">
                <Tooltip :text="t('tooltip.previousPage')" placement="bottom">
                  <button @click="prevImagePage" :disabled="currentImagePage === 0"
                    :class="['w-8 h-8 flex items-center justify-center rounded-full transition-all', currentImagePage === 0 ? 'bg-slate-50 text-slate-300' : 'bg-slate-100 text-slate-400 hover:bg-slate-200']">
                    <span class="material-symbols-outlined text-[16px]">arrow_back_ios_new</span>
                  </button>
                </Tooltip>
                <Tooltip :text="t('tooltip.nextPage')" placement="bottom">
                  <button @click="nextImagePage"
                    :disabled="(currentImagePage + 1) * 3 >= prompt.reference_images.length"
                    :class="['w-8 h-8 flex items-center justify-center rounded-full transition-all', (currentImagePage + 1) * 3 >= prompt.reference_images.length ? 'bg-slate-50 text-slate-300' : 'bg-slate-100 text-slate-400 hover:bg-slate-200']">
                    <span class="material-symbols-outlined text-[16px]">arrow_forward_ios</span>
                  </button>
                </Tooltip>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div v-for="(img, idx) in visibleImages" :key="idx"
                class="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 cursor-pointer"
                @click="openViewer(Number(currentImagePage) * 3 + Number(idx))">
                <img :src="img"
                  :alt="t('prompt.referenceImage', { number: Number(currentImagePage) * 3 + Number(idx) + 1 })"
                  class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div
                  class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex items-end pointer-events-none">
                  <span class="text-white text-[10px] font-bold uppercase tracking-wider">{{ t('prompt.clickToView')
                  }}</span>
                </div>
              </div>
            </div>
          </section>

          <!-- 视频显示区域 -->
          <section v-if="prompt.reference_videos?.length" class="mt-8">
            <h3 class="text-lg font-bold text-on-surface mb-6">{{ t('prompt.referenceVideos') }}</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div v-for="(video, idx) in prompt.reference_videos" :key="idx"
                class="aspect-video rounded-2xl overflow-hidden bg-black">
                <!-- 使用 app-video 自定义协议加载本地视频，通过 encodeURIComponent 处理中文和特殊字符 -->
                <video :src="'app-video://' + encodeURIComponent(video)" class="w-full h-full object-contain"
                  controls />
              </div>
            </div>
          </section>
        </div>

        <aside class="w-full lg:w-80 space-y-8">
          <div class="bg-surface-container-low/50 border border-slate-100 rounded-2xl p-6">
            <h4 class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6">{{ t('metadata.title') }}
            </h4>
            <div class="space-y-6">
              <div>
                <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{{
                  t('metadata.category') }}</label>
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-primary"></span>
                  <span class="text-sm font-semibold text-slate-800">{{ prompt.category }}</span>
                </div>
              </div>
              <div v-if="prompt.tags?.length">
                <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{{
                  t('metadata.tags') }}</label>
                <div class="flex flex-wrap gap-2">
                  <span v-for="tag in prompt.tags" :key="tag"
                    class="px-2.5 py-1 bg-white border border-slate-100 rounded-lg text-[11px] font-medium text-slate-600">{{
                      tag }}</span>
                </div>
              </div>
              <div>
                <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{{
                  t('metadata.dateCreated') }}</label>
                <p class="text-sm font-semibold text-slate-800">{{ formatDateFull(prompt.created_at) }}</p>
              </div>
              <div>
                <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{{
                  t('metadata.visibility') }}</label>
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-[14px]"
                    :class="prompt.is_private ? 'text-slate-400' : 'text-primary'">
                    {{ prompt.is_private ? 'lock' : 'public' }}
                  </span>
                  <span class="text-sm font-semibold text-slate-800">{{ prompt.is_private ? t('metadata.private') :
                    t('metadata.public') }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-primary/5 rounded-2xl p-6 border border-primary/10">
            <div class="flex items-center gap-3 mb-4">
              <span class="material-symbols-outlined text-primary text-[20px]">auto_awesome</span>
              <h4 class="text-[11px] font-bold uppercase tracking-wider text-primary">{{ t('metadata.quickTip') }}</h4>
            </div>
            <p class="text-[12px] text-slate-600 leading-relaxed font-medium">
              {{ t('metadata.quickTipContent') }}
            </p>
          </div>
        </aside>
      </div>
    </div>

    <div v-else class="flex items-center justify-center h-full">
      <span class="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
    </div>

    <MediaViewer v-model:visible="viewerVisible" :images="prompt?.reference_images || []"
      :videos="prompt?.reference_videos || []" :initial-index="viewerIndex" @close="viewerVisible = false" />

    <ConfirmDialog v-model:visible="showDeleteDialog" type="danger" :title="t('dialog.deletePromptTitle')"
      :message="t('dialog.deletePromptMessage')" :confirm-text="t('dialog.delete')" :cancel-text="t('dialog.cancel')"
      @confirm="handleDelete" />
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useDateFormatter } from '@/utils/format'
import { usePromptStore } from '@/stores/prompts'
import MediaViewer from '@/components/MediaViewer.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import Tooltip from '@/components/Tooltip.vue'

const route = useRoute()
const router = useRouter()
const store = usePromptStore()
const { t } = useI18n()
const { formatRelativeTime, formatFullDate: formatDateFull } = useDateFormatter()
const prompt = ref<any>(null)
const showDeleteDialog = ref(false)

const currentImagePage = ref(0)
const viewerVisible = ref(false)
const viewerIndex = ref(0)
const activeTab = ref<'zh' | 'en'>('zh')

const visibleImages = computed(() => {
  if (!prompt.value?.reference_images) return []
  const start = currentImagePage.value * 3
  return prompt.value.reference_images.slice(start, start + 3)
})

function prevImagePage() {
  if (currentImagePage.value > 0) {
    currentImagePage.value--
  }
}

function nextImagePage() {
  if (prompt.value && (currentImagePage.value + 1) * 3 < prompt.value.reference_images.length) {
    currentImagePage.value++
  }
}

function openViewer(index: number) {
  viewerIndex.value = index
  viewerVisible.value = true
}

async function handleToggleFavorite() {
  if (prompt.value?.id) {
    const newStatus = !prompt.value.is_favorite
    await store.toggleFavorite(prompt.value.id)
    prompt.value = { ...prompt.value, is_favorite: newStatus }
  }
}

// 使用 useDateFormatter 替代

async function copyPrompt(lang: 'zh' | 'en') {
  if (prompt.value) {
    const content = lang === 'zh' ? prompt.value.content_zh : prompt.value.content_en
    if (content) {
      await navigator.clipboard.writeText(content)
      showToast(t('toast.copied'), 'success')
    }
  }
}

function showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
  window.dispatchEvent(new CustomEvent('show-toast', {
    detail: { message, type, duration: 2000 }
  }))
}

async function handleDelete() {
  if (prompt.value?.id) {
    await store.deletePrompt(prompt.value.id)
    router.push('/')
  }
}

onMounted(async () => {
  const id = Number(route.params.id)
  prompt.value = await store.fetchPrompt(id)
})
</script>

<style scoped>
.prompt-card {
  border: 1px solid rgb(241 245 249);
}

.tab-header {
  background-color: #f2f3fa;
}

.tab-item {
  position: relative;
  display: inline-block;
  padding: 10px 20px;
  background-color: transparent;
  border: none;
  cursor: pointer;
  color: #64748b;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
  border-radius: 12px 12px 0 0;
}

.tab-item:hover {
  color: #475569;
  background-color: rgba(255, 255, 255, 0.5);
}

.tab-item.active {
  background-color: #ffffff;
  color: #005bc1;
}

.tab-item::before,
.tab-item::after {
  content: "";
  position: absolute;
  bottom: 0;
  width: 16px;
  height: 16px;
}

.tab-item::before {
  left: -16px;
  background: radial-gradient(circle at 0 0, transparent 16px, #ffffff 16px);
}

.tab-item::after {
  right: -16px;
  background: radial-gradient(circle at 100% 0, transparent 16px, #ffffff 16px);
}

.tab-item:not(.active)::before {
  background: radial-gradient(circle at 0 0, transparent 16px, #ffffff 16px);
}

.tab-item:not(.active)::after {
  background: radial-gradient(circle at 100% 0, transparent 16px, #f2f3fa 16px);
}

.tab-item:not(.active):hover::after {
  background: radial-gradient(circle at 100% 0, transparent 16px, #f9f9fd 16px);
}

.tab-item:first-child::before {
  display: none;
}

.tab-item:first-child {
  border-radius: 0 12px 0 0;
}
</style>
