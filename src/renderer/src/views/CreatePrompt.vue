<template>
  <section class="flex-1 overflow-y-auto p-10 bg-surface">
    <div class="max-w-6xl mx-auto">
      <div class="mb-12 flex items-end justify-between">
        <div>
<h1 class="text-3xl font-semibold tracking-tight text-on-surface mb-2">{{ isEdit ? 'Edit Prompt' : 'Create New Prompt' }}</h1>
<p class="text-on-surface-variant font-medium">{{ isEdit ? 'Update your prompt details.' : 'Design your next masterpiece with precision.' }}</p>
        </div>
        <div class="flex items-center gap-3">
          <Tooltip text="Cancel without saving" placement="bottom">
            <button @click="router.push('/')"
              class="px-6 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-surface-container-high transition-colors">Cancel</button>
          </Tooltip>
          <Tooltip :text="isEdit ? 'Save changes' : 'Create new prompt'" placement="bottom">
            <button @click="savePrompt"
              class="px-8 py-2.5 rounded-xl font-medium bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
              {{ isEdit ? 'Update Prompt' : 'Save Prompt' }}
            </button>
          </Tooltip>
        </div>
      </div>

      <div class="grid grid-cols-12 gap-6">
        <div class="col-span-12 lg:col-span-8 space-y-6">
          <div class="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/10">
            <div class="space-y-6">
              <div class="space-y-2">
                <label class="text-xs font-bold uppercase tracking-wider text-outline px-1">Prompt Title <span
                    class="text-error">*</span></label>
                <input v-model="form.title"
                  :class="['w-full text-xl font-medium px-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 transition-all placeholder:text-outline-variant/60', errors.title ? 'ring-2 ring-error/50' : 'focus:ring-primary/20']"
                  placeholder="Enter a descriptive title..." />
                <p v-if="errors.title" class="text-xs text-error px-1">{{ errors.title }}</p>
              </div>
              <div class="space-y-2">
                <label class="text-xs font-bold uppercase tracking-wider text-outline px-1 flex items-center gap-2">
                  <span class="material-symbols-outlined text-base">translate</span>
                  Chinese Prompt Content <span v-if="!form.content_en.trim()" class="text-error">*</span>
                </label>
                <textarea v-model="form.content_zh"
                  :class="['w-full text-base px-4 py-4 bg-surface-container-low border-none rounded-xl focus:ring-2 transition-all placeholder:text-outline-variant/60 resize-none', errors.content ? 'ring-2 ring-error/50' : 'focus:ring-primary/20']"
                  placeholder="Enter Chinese prompt content..." rows="6"></textarea>
              </div>
              <div class="space-y-2">
                <label class="text-xs font-bold uppercase tracking-wider text-outline px-1 flex items-center gap-2">
                  <span class="material-symbols-outlined text-base">language</span>
                  English Prompt Content <span v-if="!form.content_zh.trim()" class="text-error">*</span>
                </label>
                <textarea v-model="form.content_en"
                  :class="['w-full text-base px-4 py-4 bg-surface-container-low border-none rounded-xl focus:ring-2 transition-all placeholder:text-outline-variant/60 resize-none', errors.content ? 'ring-2 ring-error/50' : 'focus:ring-primary/20']"
                  placeholder="Enter English prompt content..." rows="6"></textarea>
                <p v-if="errors.content" class="text-xs text-error px-1">{{ errors.content }}</p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div class="col-span-2 bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/10">
              <div class="flex items-center justify-between mb-6">
                <label class="text-xs font-bold uppercase tracking-wider text-outline">Reference Media</label>
                <span class="text-xs text-outline-variant">Up to files(≤15)</span>
              </div>
              <div class="grid grid-cols-4 gap-4 min-h-[155px]">
                <Tooltip text="Upload images" placement="top">
                  <div @click="triggerFileInput" :class="[
                    'aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group',
                    form.reference_images.length >= MAX_IMAGES
                      ? 'border-outline-variant/20 opacity-50 cursor-not-allowed'
                      : 'border-outline-variant/30 hover:border-primary/40 hover:bg-primary/5'
                  ]">
                    <span
                      class="material-symbols-outlined text-outline group-hover:text-primary transition-colors">add_photo_alternate</span>
                    <span
                      class="text-[10px] font-bold text-outline group-hover:text-primary uppercase tracking-widest">Upload</span>
                  </div>
                </Tooltip>
                <div v-for="(img, idx) in form.reference_images" :key="idx" draggable="true"
                  @dragstart="handleDragStart($event, idx)" @dragend="handleDragEnd"
                  @dragover.prevent="handleDragOver($event, idx)" @drop.prevent="handleDrop($event, idx)"
                  @dragleave="handleDragLeave($event)"
                  :class="['aspect-square rounded-xl overflow-hidden relative group cursor-move transition-all', draggedIndex === idx ? 'opacity-50 scale-95' : '', dragOverIndex === idx ? 'ring-2 ring-primary ring-offset-2' : '']">
                  <img :src="img" :alt="`Reference ${idx + 1}`" class="w-full h-full object-cover" />
                  <div
                    class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Tooltip text="Delete" placement="top">
                      <button @click.stop="removeImage(idx)" class="text-white p-1">
                        <span class="material-symbols-outlined">delete</span>
                      </button>
                    </Tooltip>
                    <Tooltip text="Drag to reorder" placement="top">
                      <div class="text-white p-1 cursor-grab active:cursor-grabbing">
                        <span class="material-symbols-outlined">drag_indicator</span>
                      </div>
                    </Tooltip>
                  </div>
                </div>
              </div>
              <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="handleFileUpload" />
            </div>
          </div>
        </div>

        <div class="col-span-12 lg:col-span-4 space-y-6">
          <div class="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10">
            <label class="text-xs font-bold uppercase tracking-wider text-outline mb-4 block">Prompt Category</label>
            <div class="grid grid-cols-2 gap-3">
              <button v-for="cat in categories" :key="cat" @click="form.category = cat"
                :class="['flex flex-col items-center gap-2 p-4 rounded-xl transition-colors', form.category === cat ? 'bg-primary/10 border border-primary/20 text-primary' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high']">
                <span class="material-symbols-outlined">{{ getCategoryIcon(cat) }}</span>
                <span class="text-sm font-semibold">{{ cat }}</span>
              </button>
            </div>
          </div>

          <div class="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 space-y-6">
            <div class="space-y-3">
              <label class="text-xs font-bold uppercase tracking-wider text-outline block">Add to Collection</label>
              <select v-model="form.collection_id"
                class="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20">
                <option :value="null">No collection</option>
                <option v-for="col in store.collections" :key="col.id" :value="col.id">{{ col.name }}</option>
              </select>
            </div>
            <div class="space-y-3">
              <label class="text-xs font-bold uppercase tracking-wider text-outline block">Tags</label>
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
                    placeholder="Add tag..." />
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
                <span class="text-sm font-medium">Add to Favorites</span>
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
                <span class="text-sm font-medium">Private Prompt</span>
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
import { usePromptStore } from '@/stores/prompts'
import Tooltip from '@/components/Tooltip.vue'

const route = useRoute()
const router = useRouter()
const store = usePromptStore()

const isEdit = computed(() => !!route.params.id)
const newTag = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const showTagSuggestions = ref(false)
const isTagInputFocused = ref(false)
const tagInputRef = ref<HTMLInputElement | null>(null)
const errors = ref<{ title?: string; content?: string }>({})

const MAX_IMAGES = 15
const categories = ['Image Generation', 'Video Prompt']
const draggedIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

const form = ref({
  title: '',
  content_zh: '',
  content_en: '',
  category: 'Image Generation',
  tags: [] as string[],
  collection_id: null as number | null,
  is_favorite: false,
  is_private: true,
  reference_images: [] as string[]
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
  fileInput.value?.click()
}

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files) return

  const remaining = MAX_IMAGES - form.value.reference_images.length
  const filesToProcess = Array.from(files).slice(0, remaining)

  filesToProcess.forEach(file => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result && form.value.reference_images.length < MAX_IMAGES) {
        form.value.reference_images.push(e.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  })

  target.value = ''
}

function removeImage(index: number) {
  form.value.reference_images.splice(index, 1)
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
    errors.value.title = 'Title is required'
  }

  if (!form.value.content_zh.trim() && !form.value.content_en.trim()) {
    errors.value.content = 'Please fill in at least one prompt content'
  }

  if (Object.keys(errors.value).length > 0) {
    return
  }

  if (isEdit.value) {
    await store.updatePrompt(Number(route.params.id), form.value)
  } else {
    await store.createPrompt(form.value)
  }
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
        reference_images: [...prompt.reference_images]
      }
    }
  }
})
</script>
