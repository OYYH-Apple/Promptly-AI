<template>
  <section class="flex-1 overflow-y-auto p-10 bg-surface">
    <div class="max-w-6xl mx-auto">
      <div class="mb-12 flex items-end justify-between">
        <div>
          <h1 class="text-3xl font-semibold tracking-tight text-on-surface mb-2">{{ isEdit ? 'Edit Prompt' : 'Create New Prompt' }}</h1>
          <p class="text-on-surface-variant font-medium">{{ isEdit ? 'Update your prompt details.' : 'Design your next masterpiece with precision.' }}</p>
        </div>
        <div class="flex items-center gap-3">
          <button @click="router.push('/')" class="px-6 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-surface-container-high transition-colors">Cancel</button>
          <button @click="savePrompt" class="px-8 py-2.5 rounded-xl font-medium bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
            {{ isEdit ? 'Update Prompt' : 'Save Prompt' }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-12 gap-6">
        <div class="col-span-12 lg:col-span-8 space-y-6">
          <div class="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/10">
      <div class="space-y-6">
        <div class="space-y-2">
          <label class="text-xs font-bold uppercase tracking-wider text-outline px-1">Prompt Title</label>
          <input v-model="form.title" class="w-full text-xl font-medium px-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline-variant/60" placeholder="Enter a descriptive title..." />
        </div>
        <div class="space-y-2">
          <label class="text-xs font-bold uppercase tracking-wider text-outline px-1 flex items-center gap-2">
            <span class="material-symbols-outlined text-base">translate</span>
            Chinese Prompt Content
          </label>
          <textarea v-model="form.content_zh" class="w-full text-base px-4 py-4 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline-variant/60 resize-none" placeholder="Enter Chinese prompt content..." rows="6"></textarea>
        </div>
        <div class="space-y-2">
          <label class="text-xs font-bold uppercase tracking-wider text-outline px-1 flex items-center gap-2">
            <span class="material-symbols-outlined text-base">language</span>
            English Prompt Content
          </label>
          <textarea v-model="form.content_en" class="w-full text-base px-4 py-4 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline-variant/60 resize-none" placeholder="Enter English prompt content..." rows="6"></textarea>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-6">
      <div class="col-span-2 bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/10">
        <div class="flex items-center justify-between mb-6">
          <label class="text-xs font-bold uppercase tracking-wider text-outline">Reference Media</label>
          <span class="text-xs text-outline-variant">Up to files(≤15)</span>
        </div>
<div class="grid grid-cols-4 gap-4">
      <div
        v-if="form.reference_images.length < MAX_IMAGES"
        @click="triggerFileInput"
        class="aspect-square rounded-xl border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center gap-2 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group"
      >
        <span class="material-symbols-outlined text-outline group-hover:text-primary transition-colors">add_photo_alternate</span>
        <span class="text-[10px] font-bold text-outline group-hover:text-primary uppercase tracking-widest">Upload</span>
      </div>
      <div
        v-for="(img, idx) in form.reference_images"
        :key="idx"
        class="aspect-square rounded-xl overflow-hidden relative group"
      >
        <img :src="img" :alt="`Reference ${idx + 1}`" class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button @click="removeImage(idx)" class="text-white">
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>
      </div>
    </div>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          multiple
          class="hidden"
          @change="handleFileUpload"
        />
      </div>
    </div>
  </div>

        <div class="col-span-12 lg:col-span-4 space-y-6">
<div class="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10">
      <label class="text-xs font-bold uppercase tracking-wider text-outline mb-4 block">Prompt Category</label>
      <div class="grid grid-cols-2 gap-3">
        <button
          v-for="cat in categories"
          :key="cat"
          @click="form.category = cat"
          :class="['flex flex-col items-center gap-2 p-4 rounded-xl transition-colors', form.category === cat ? 'bg-primary/10 border border-primary/20 text-primary' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high']"
        >
          <span class="material-symbols-outlined">{{ getCategoryIcon(cat) }}</span>
          <span class="text-sm font-semibold">{{ cat }}</span>
        </button>
      </div>
    </div>

    <div class="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 space-y-6">
            <div class="space-y-3">
              <label class="text-xs font-bold uppercase tracking-wider text-outline block">Add to Collection</label>
              <select v-model="form.collection_id" class="w-full px-4 py-2.5 bg-surface-container-low border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20">
                <option :value="null">No collection</option>
                <option v-for="col in store.collections" :key="col.id" :value="col.id">{{ col.name }}</option>
              </select>
            </div>
            <div class="space-y-3">
              <label class="text-xs font-bold uppercase tracking-wider text-outline block">Tags</label>
              <div class="flex flex-wrap gap-2">
                <span v-for="(tag, idx) in form.tags" :key="idx" class="px-3 py-1 rounded-full bg-surface-container-high text-xs font-medium text-on-surface-variant flex items-center gap-1">
                  {{ tag }}
                  <span @click="removeTag(idx)" class="material-symbols-outlined text-[14px] cursor-pointer hover:text-error">close</span>
                </span>
                <input 
                  v-model="newTag"
                  @keydown.enter.prevent="addTag"
                  class="px-3 py-1 rounded-full border border-dashed border-outline-variant text-xs font-medium text-outline flex items-center gap-1 focus:outline-none"
                  placeholder="Add tag..."
                />
              </div>
            </div>
          </div>

    <div class="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="material-symbols-outlined text-outline">grade</span>
        <span class="text-sm font-medium">Add to Favorites</span>
      </div>
      <label class="relative inline-flex items-center cursor-pointer">
        <input v-model="form.is_favorite" type="checkbox" class="sr-only peer" />
        <div class="w-11 h-6 bg-secondary-container peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
      </label>
    </div>

    <div class="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="material-symbols-outlined text-outline">lock</span>
        <span class="text-sm font-medium">Private Prompt</span>
      </div>
      <label class="relative inline-flex items-center cursor-pointer">
        <input v-model="form.is_private" type="checkbox" class="sr-only peer" />
        <div class="w-11 h-6 bg-secondary-container peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
      </label>
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

const route = useRoute()
const router = useRouter()
const store = usePromptStore()

const isEdit = computed(() => !!route.params.id)
const newTag = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

const MAX_IMAGES = 15
const categories = ['Image Generation', 'Video Prompt']

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

function addTag() {
  if (newTag.value.trim() && !form.value.tags.includes(newTag.value.trim())) {
    form.value.tags.push(newTag.value.trim())
    newTag.value = ''
  }
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

async function savePrompt() {
  if (!form.value.title.trim()) {
    alert('Please fill in title')
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
