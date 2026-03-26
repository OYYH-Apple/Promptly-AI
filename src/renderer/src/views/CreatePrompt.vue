<template>
  <section class="flex-1 overflow-y-auto p-10 bg-surface">
    <div class="max-w-6xl mx-auto">
      <div class="mb-12 flex items-end justify-between">
        <div>
          <h1 class="text-3xl font-semibold tracking-tight text-on-surface mb-2">{{ isEdit ? t('prompt.editTitle') :
            t('prompt.createTitle') }}</h1>
          <p class="text-on-surface-variant font-medium">{{ isEdit ? t('prompt.editSubtitle') :
            t('prompt.createSubtitle') }}</p>
        </div>
        <div class="flex items-center gap-3">
          <Tooltip :text="t('tooltip.cancelWithoutSaving')" placement="bottom">
            <button @click="handleCancel"
              class="px-6 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-surface-container-high transition-colors">{{
                t('common.cancel') }}</button>
          </Tooltip>
          <Tooltip :text="isEdit ? t('tooltip.saveChanges') : t('tooltip.createNewPrompt')" placement="bottom">
            <button @click="savePrompt"
              class="px-8 py-2.5 rounded-xl font-medium bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
              {{ isEdit ? t('prompt.updatePrompt') : t('prompt.savePrompt') }}
            </button>
          </Tooltip>
        </div>
      </div>

      <div class="grid grid-cols-12 gap-6">
        <div class="col-span-12 lg:col-span-8 space-y-6">
          <div class="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/10">
            <div class="space-y-6">
              <div class="space-y-2">
                <label class="font-bold uppercase tracking-wider text-outline px-1"
                  :class="locale === 'zh-CN' ? 'text-sm' : 'text-xs'">{{ t('prompt.titleLabel') }}
                  <span class="text-error">*</span></label>
                <input v-model="form.title"
                  :class="['w-full text-xl font-medium px-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 transition-all placeholder:text-outline-variant/60', errors.title ? 'ring-2 ring-error/50' : 'focus:ring-primary/20']"
                  :placeholder="t('prompt.titlePlaceholder')" />
                <p v-if="errors.title" class="text-xs text-error px-1">{{ errors.title }}</p>
              </div>
              <div class="space-y-2">
                <label class="font-bold uppercase tracking-wider text-outline px-1 flex items-center gap-2"
                  :class="locale === 'zh-CN' ? 'text-sm' : 'text-xs'">
                  <span class="material-symbols-outlined text-base">translate</span>
                  {{ t('prompt.contentZhLabel') }} <span v-if="!form.content_en.trim()" class="text-error">*</span>
                </label>
                <textarea v-model="form.content_zh"
                  :class="['w-full text-base px-4 py-4 bg-surface-container-low border-none rounded-xl focus:ring-2 transition-all placeholder:text-outline-variant/60 resize-none', errors.content ? 'ring-2 ring-error/50' : 'focus:ring-primary/20']"
                  :placeholder="t('prompt.contentZhPlaceholder')" rows="6"></textarea>
              </div>
              <div class="space-y-2">
                <label class="font-bold uppercase tracking-wider text-outline px-1 flex items-center gap-2"
                  :class="locale === 'zh-CN' ? 'text-sm' : 'text-xs'">
                  <span class="material-symbols-outlined text-base">language</span>
                  {{ t('prompt.contentEnLabel') }} <span v-if="!form.content_zh.trim()" class="text-error">*</span>
                </label>
                <textarea v-model="form.content_en"
                  :class="['w-full text-base px-4 py-4 bg-surface-container-low border-none rounded-xl focus:ring-2 transition-all placeholder:text-outline-variant/60 resize-none', errors.content ? 'ring-2 ring-error/50' : 'focus:ring-primary/20']"
                  :placeholder="t('prompt.contentEnPlaceholder')" rows="6"></textarea>
                <p v-if="errors.content" class="text-xs text-error px-1">{{ t('form.contentRequired') }}</p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div class="col-span-2 bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/10">
              <div class="flex items-center justify-between mb-6">
                <label class="font-bold uppercase tracking-wider text-outline"
                  :class="locale === 'zh-CN' ? 'text-sm' : 'text-xs'">{{ t('prompt.referenceMedia')
                  }}</label>
                <span class="text-outline-variant" :class="locale === 'zh-CN' ? 'text-sm' : 'text-xs]'">{{
                  form.reference_images.length }}/{{ MAX_IMAGES }}
                  {{ t('prompt.images') }}</span>
              </div>
              <div class="grid grid-cols-4 gap-4 min-h-[155px]">
                <Tooltip
                  :text="form.reference_images.length >= MAX_IMAGES ? t('tooltip.maximumImagesReached') : t('tooltip.uploadImages')"
                  placement="top">
                  <div @click="triggerFileInput" :class="[
                    'aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all group',
                    form.reference_images.length >= MAX_IMAGES
                      ? 'border-outline-variant/20 opacity-50 cursor-not-allowed'
                      : 'border-outline-variant/30 hover:border-primary/40 hover:bg-primary/5 cursor-pointer'
                  ]">
                    <span
                      class="material-symbols-outlined text-outline group-hover:text-primary transition-colors">add_photo_alternate</span>
                    <span :class="locale === 'zh-CN' ? 'text-sm' : 'text-xs'"
                      class="text-[10px] font-bold text-outline group-hover:text-primary uppercase tracking-widest">{{
                        t('common.upload') }}</span>
                  </div>
                </Tooltip>
                <div v-for="(img, idx) in form.reference_images" :key="idx" draggable="true"
                  @dragstart="handleDragStart($event, idx)" @dragend="handleDragEnd"
                  @dragover.prevent="handleDragOver($event, idx)" @drop.prevent="handleDrop($event, idx)"
                  @dragleave="handleDragLeave($event)"
                  class="aspect-square rounded-xl overflow-hidden relative group cursor-move transition-all"
                  :class="[draggedIndex === idx ? 'opacity-50 scale-95' : '', dragOverIndex === idx ? 'ring-2 ring-primary ring-offset-2' : '']">
                  <img :src="img" :alt="t('prompt.referenceImage', { number: idx + 1 })"
                    class="w-full h-full object-cover" />
                  <!-- 操作按钮组 - 右上角 -->
                  <div class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Tooltip :text="t('tooltip.dragToReorder')" placement="top">
                      <div
                        class="w-7 h-7 flex items-center justify-center rounded-full bg-black/60 text-white cursor-grab active:cursor-grabbing hover:bg-blue-500  transition-all hover:-rotate-90">
                        <span class="material-symbols-outlined text-sm">drag_indicator</span>
                      </div>
                    </Tooltip>
                    <Tooltip :text="t('tooltip.delete')" placement="top">
                      <button @click.stop="removeImage(idx)"
                        class="w-7 h-7 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-red-500 transition-all hover:rotate-90">
                        <span class="material-symbols-outlined text-sm">close</span>
                      </button>
                    </Tooltip>
                  </div>
                  <!-- 序号 -->
                  <div
                    class="absolute top-2 left-2 w-6 h-6 flex items-center justify-center rounded-full bg-black/40 text-white text-xs font-medium">
                    {{ idx + 1 }}
                  </div>
                </div>
              </div>
              <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="handleFileUpload" />
            </div>
          </div>

          <!-- 视频上传区域 - 仅在视频提示词分类时显示 -->
          <div v-if="form.category === 'Video Prompt'"
            class="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/10">
            <div class="flex items-center justify-between mb-6">
              <label :class="locale === 'zh-CN' ? 'text-sm' : 'text-xs'"
                class="font-bold uppercase tracking-wider text-outline">{{ t('prompt.referenceVideos')
                }}</label>
              <span :class="locale === 'zh-CN' ? 'text-sm' : 'text-xs'" class="text-outline-variant">{{
                form.reference_videos.length }}/{{ MAX_VIDEOS }} {{
                  t('prompt.videos') }}</span>
            </div>
            <div class="grid grid-cols-2 gap-4 min-h-[155px]">
              <Tooltip
                :text="form.reference_videos.length >= MAX_VIDEOS ? t('toast.maximumVideosAllowed', { max: MAX_VIDEOS }) : t('tooltip.uploadVideo')"
                placement="top">
                <div @click="triggerVideoInput" :class="[
                  'aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all group',
                  form.reference_videos.length >= MAX_VIDEOS
                    ? 'border-outline-variant/20 opacity-50 cursor-not-allowed'
                    : 'border-outline-variant/30 hover:border-primary/40 hover:bg-primary/5 cursor-pointer'
                ]">
                  <span
                    class="material-symbols-outlined text-outline group-hover:text-primary transition-colors">videocam</span>
                  <span :class="locale === 'zh-CN' ? 'text-sm' : 'text-xs'"
                    class="font-bold text-outline group-hover:text-primary uppercase tracking-widest">{{
                      t('common.upload') }}</span>
                </div>
              </Tooltip>
              <div v-for="(video, idx) in form.reference_videos" :key="idx"
                class="aspect-video rounded-xl overflow-hidden relative group bg-black">
                <!-- 使用 app-video 自定义协议加载本地视频，通过 encodeURIComponent 处理中文和特殊字符 -->
                <video :src="'app-video://' + encodeURIComponent(video)" class="w-full h-full object-contain"
                  controls />
                <button @click="removeVideo(idx)"
                  class="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500">
                  <span class="material-symbols-outlined text-sm">close</span>
                </button>
                <!-- 序号 -->
                <div
                  class="absolute top-2 left-2 w-6 h-6 flex items-center justify-center rounded-full bg-black/40 text-white text-xs font-medium">
                  {{ idx + 1 }}
                </div>
              </div>
            </div>
            <input ref="videoFileInput" type="file"
              accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska" multiple class="hidden"
              @change="handleVideoUpload" />
          </div>
        </div>

        <div class="col-span-12 lg:col-span-4 space-y-6">
          <div class="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10">
            <label class="font-bold uppercase tracking-wider text-outline mb-4 block"
              :class="locale === 'zh-CN' ? 'text-sm' : 'text-xs'">{{
                t('prompt.categoryLabel') }}</label>
            <div class="grid grid-cols-2 gap-3">
              <button v-for="cat in categories" :key="cat" @click="form.category = cat"
                :class="['flex flex-col items-center gap-2 p-4 rounded-xl transition-colors h-[88px] justify-center', form.category === cat ? 'bg-primary/10 border border-primary/20 text-primary' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high']">
                <span class="material-symbols-outlined">{{ getCategoryIcon(cat) }}</span>
                <span class="font-semibold text-center leading-tight line-clamp-2"
                  :class="locale === 'zh-CN' ? 'text-sm' : 'text-xs'">{{
                    t(`categoryLabels.${cat.replace(' ', '')}`) }}</span>
              </button>
            </div>
          </div>

          <div class="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 space-y-6">
            <div class="space-y-3">
              <label class="font-bold uppercase tracking-wider text-outline block"
                :class="locale === 'zh-CN' ? 'text-sm' : 'text-xs]'">{{
                  t('prompt.addToCollection') }}</label>
              <select v-model="form.collection_id"
                class="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20">
                <option :value="null">{{ t('prompt.noCollection') }}</option>
                <option v-for="col in store.collections" :key="col.id" :value="col.id">{{ col.name }}</option>
              </select>
            </div>
            <div class="space-y-3">
              <label class="font-bold uppercase tracking-wider text-outline block"
                :class="locale === 'zh-CN' ? 'text-sm' : 'text-xs'">{{ t('prompt.tags')
                }}</label>
              <div class="flex flex-wrap gap-2">
                <span v-for="(tag, idx) in form.tags" :key="idx"
                  class="px-3 py-1 rounded-full bg-surface-container-high text-xs font-medium text-on-surface-variant flex items-center gap-1">
                  {{ tag }}
                  <span @click="removeTag(idx)"
                    class="material-symbols-outlined cursor-pointer hover:text-red-500 hover:rotate-90 transition-all"
                    style="font-size: 14px;">close</span>
                </span>
                <div class="relative">
                  <input ref="tagInputRef" v-model="newTag" @keydown.enter.prevent="addTag" @focus="handleTagInputFocus"
                    @blur="handleTagInputBlur"
                    class="px-3 py-1 rounded-full border border-dashed border-outline-variant text-xs font-medium text-outline flex items-center gap-1 focus:outline-none focus:border-primary"
                    :placeholder="t('prompt.addTag')" />
                  <div v-if="showTagSuggestions && filteredTags.length > 0 && isTagInputFocused"
                    class="absolute top-full left-0 mt-2 w-48 max-h-40 overflow-y-auto bg-white rounded-xl shadow-lg border border-slate-100 z-10"
                    @mousedown.prevent>
                    <button v-for="tag in filteredTags" :key="tag" @mousedown.prevent="selectTag(tag)"
                      class="w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-primary/5 hover:text-primary transition-colors">
                      {{ tag }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div
              class="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-outline">grade</span>
                <span class="font-medium" :class="locale === 'zh-CN' ? 'text-sm' : 'text-xs'">{{
                  t('prompt.addToFavorites') }}</span>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input v-model="form.is_favorite" type="checkbox" class="sr-only peer" />
                <div
                  class="w-11 h-6 bg-secondary-container peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary">
                </div>
              </label>
            </div>

            <div
              class="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-outline">lock</span>
                <span class="font-medium" :class="locale === 'zh-CN' ? 'text-sm' : 'text-xs'">{{
                  t('prompt.privatePrompt') }}</span>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input v-model="form.is_private" type="checkbox" class="sr-only peer" />
                <div
                  class="w-11 h-6 bg-secondary-container peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary">
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePromptStore } from '@/stores/prompts'
import Tooltip from '@/components/Tooltip.vue'

const route = useRoute()
const router = useRouter()
const store = usePromptStore()
const { t, locale } = useI18n()

const isEdit = computed(() => !!route.params.id)
const newTag = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const showTagSuggestions = ref(false)
const isTagInputFocused = ref(false)
const errors = ref<{ title?: string; content?: string }>({})

const MAX_IMAGES = 15
const MAX_VIDEOS = 5
const videoFileInput = ref<HTMLInputElement | null>(null)
const categories = ['Image Generation', 'Video Prompt']
const draggedIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

// ==================== 视频格式支持配置 ====================
// 允许的视频 MIME 类型
const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime', // MOV
  'video/x-msvideo', // AVI
  'video/x-matroska', // MKV
]

// 允许的视频扩展名（作为 MIME 类型的 fallback）
const ALLOWED_VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.avi', '.mkv']

/**
 * 验证文件是否为允许的视频格式
 * 优先检查 MIME 类型，不可靠时回退到扩展名检查
 */
function isValidVideoFile(file: File): boolean {
  // 优先检查 MIME 类型
  if (ALLOWED_VIDEO_TYPES.includes(file.type)) return true

  // MIME 类型不可靠时，检查扩展名
  const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
  return ALLOWED_VIDEO_EXTENSIONS.includes(ext)
}

// ==================== 待删除视频管理 ====================
/** 编辑模式下暂存的待删除视频路径，保存时统一清理 */
const pendingDeleteVideos = ref<string[]>([])

function showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
  window.dispatchEvent(new CustomEvent('show-toast', {
    detail: { message, type, duration: 2000 }
  }))
}

const form = ref({
  title: '',
  content_zh: '',
  content_en: '',
  category: 'Image Generation',
  tags: [] as string[],
  collection_id: null as number | null,
  is_favorite: false,
  is_private: true,
  reference_images: [] as string[],
  reference_videos: [] as string[]
})

function getCategoryIcon(category: string) {
  const icons: Record<string, string> = {
    'Image Generation': 'image',
    'Video Prompt': 'movie'
  }
  return icons[category] || 'text_snippet'
}

const filteredTags = computed(() => {
  const existingTags = new Set(form.value.tags)
  return store.allTags.filter(tag =>
    !existingTags.has(tag) &&
    (newTag.value === '' || tag.toLowerCase().includes(newTag.value.toLowerCase()))
  )
})

function addTag() {
  if (newTag.value.trim() && !form.value.tags.includes(newTag.value.trim())) {
    form.value.tags.push(newTag.value.trim())
    newTag.value = ''
  }
}

function selectTag(tag: string) {
  if (!form.value.tags.includes(tag)) {
    form.value.tags.push(tag)
  }
  newTag.value = ''
}

function handleTagInputFocus() {
  showTagSuggestions.value = true
  isTagInputFocused.value = true
}

function handleTagInputBlur() {
  isTagInputFocused.value = false
}

function removeTag(index: number) {
  form.value.tags.splice(index, 1)
}

function triggerFileInput() {
  if (form.value.reference_images.length >= MAX_IMAGES) {
    showToast(t('toast.maximumImagesAllowed', { max: MAX_IMAGES }), 'warning')
    return
  }
  fileInput.value?.click()
}

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files) return

  const remaining = MAX_IMAGES - form.value.reference_images.length
  const filesArray = Array.from(files)
  let addedCount = 0
  let duplicateCount = 0

  filesArray.slice(0, remaining).forEach(file => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result && form.value.reference_images.length < MAX_IMAGES) {
        const newImage = e.target.result as string
        if (form.value.reference_images.includes(newImage)) {
          duplicateCount++
          return
        }
        form.value.reference_images.push(newImage)
        addedCount++
      }
    }
    reader.readAsDataURL(file)
  })

  setTimeout(() => {
    if (duplicateCount > 0) {
      showToast(t('toast.duplicateImagesSkipped', { count: duplicateCount }), 'warning')
    }
  }, 100)

  target.value = ''
}

function removeImage(index: number) {
  form.value.reference_images.splice(index, 1)
}

// ==================== 视频上传相关 ====================

function triggerVideoInput() {
  if (form.value.reference_videos.length >= MAX_VIDEOS) {
    showToast(t('toast.maximumVideosAllowed', { max: MAX_VIDEOS }), 'warning')
    return
  }
  videoFileInput.value?.click()
}

async function handleVideoUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files) return

  const remaining = MAX_VIDEOS - form.value.reference_videos.length
  const filesToProcess = Array.from(files).slice(0, remaining)

  for (const file of filesToProcess) {
    // 校验视频格式
    if (!isValidVideoFile(file)) {
      showToast(`不支持的文件格式: ${file.name}`, 'warning')
      continue
    }

    try {
      // Electron 环境下 File 对象包含 path 属性，直接传递路径让主进程复制文件
      const electronFile = file as File & { path: string }
      const filePath = await window.api.saveVideo({
        fileName: file.name,
        filePath: electronFile.path
      })
      form.value.reference_videos.push(filePath)
    } catch (error) {
      console.error('视频保存失败:', error)
      showToast(t('toast.videoSaveFailed'), 'error')
    }
  }

  target.value = ''
}

function removeVideo(index: number) {
  const videoPath = form.value.reference_videos[index]
  if (videoPath) {
    // 编辑模式：暂存到待删除列表，保存时统一清理
    if (isEdit.value) {
      pendingDeleteVideos.value.push(videoPath)
    } else {
      // 新建模式：立即删除（因为还未保存到数据库）
      window.api.deleteVideo(videoPath).catch((err: Error) => {
        console.error('删除视频失败:', err)
      })
    }
    form.value.reference_videos.splice(index, 1)
  }
}

function handleDragStart(event: DragEvent, index: number) {
  draggedIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', index.toString())
  }
}

function handleDragEnd() {
  draggedIndex.value = null
  dragOverIndex.value = null
}

function handleDragOver(event: DragEvent, index: number) {
  event.preventDefault()
  if (draggedIndex.value !== null && draggedIndex.value !== index) {
    dragOverIndex.value = index
  }
}

function handleDragLeave(event: DragEvent) {
  const relatedTarget = event.relatedTarget as HTMLElement
  if (!event.currentTarget || !(event.currentTarget as HTMLElement).contains(relatedTarget)) {
    dragOverIndex.value = null
  }
}

function handleDrop(event: DragEvent, dropIndex: number) {
  event.preventDefault()
  if (draggedIndex.value === null || draggedIndex.value === dropIndex) return

  const images = [...form.value.reference_images]
  const [draggedItem] = images.splice(draggedIndex.value, 1)
  images.splice(dropIndex, 0, draggedItem)
  form.value.reference_images = images

  draggedIndex.value = null
  dragOverIndex.value = null
}

async function savePrompt() {
  errors.value = {}

  if (!form.value.title.trim()) {
    errors.value.title = t('form.titleRequired')
  } else {
    // 检查标题唯一性（排除当前编辑的提示词）
    const existingPrompt = store.prompts.find(p =>
      p.title.trim().toLowerCase() === form.value.title.trim().toLowerCase() &&
      p.id !== Number(route.params.id)
    )
    if (existingPrompt) {
      errors.value.title = t('form.titleExists')
    }
  }

  if (!form.value.content_zh.trim() && !form.value.content_en.trim()) {
    errors.value.content = t('form.contentRequired')
  }

  if (Object.keys(errors.value).length > 0) {
    return
  }

  if (isEdit.value) {
    await store.updatePrompt(Number(route.params.id), form.value)
  } else {
    await store.createPrompt(form.value)
  }

  // 保存成功后，清理待删除的视频文件
  if (pendingDeleteVideos.value.length > 0) {
    for (const videoPath of pendingDeleteVideos.value) {
      try {
        await window.api.deleteVideo(videoPath)
      } catch (err) {
        console.error('清理视频失败:', err)
      }
    }
    pendingDeleteVideos.value = []
  }

  router.push('/')
}

function handleCancel() {
  // 清空待删除视频列表，避免取消后误删文件
  pendingDeleteVideos.value = []
  router.push('/')
}

onMounted(async () => {
  await store.fetchCollections()

  // 从 query 参数中读取分类
  const categoryParam = route.query.category as string
  if (categoryParam && categories.includes(categoryParam)) {
    form.value.category = categoryParam
  }

  if (isEdit.value) {
    const prompt = await store.fetchPrompt(Number(route.params.id))
    if (prompt) {
      form.value = {
        title: prompt.title,
        content_zh: prompt.content_zh || '',
        content_en: prompt.content_en || '',
        category: prompt.category || 'Image Generation',
        tags: [...prompt.tags],
        collection_id: prompt.collection_id ?? null,
        is_favorite: prompt.is_favorite,
        is_private: prompt.is_private ?? true,
        reference_images: [...prompt.reference_images],
        reference_videos: [...(prompt.reference_videos || [])]
      }
    }
  }
})
</script>
