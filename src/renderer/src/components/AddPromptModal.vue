<template>
  <div v-if="visible" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    @click.self="$emit('update:visible', false)">
    <div class="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold">{{ t('addPromptModal.title', { name: collectionName }) }}</h3>
        <button @click="$emit('update:visible', false)" class="p-2 hover:bg-slate-100 rounded-full">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div class="mb-4 flex items-center gap-3">
        <div class="relative flex-1">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input v-model="searchQuery"
            class="w-full pl-10 pr-10 py-2 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20"
            :placeholder="t('addPromptModal.searchPlaceholder')" />
          <button v-if="searchQuery" @click="searchQuery = ''"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="relative" ref="filterDropdownRef">
          <button @click="showFilters = !showFilters"
            class="px-3 py-2 text-sm font-medium rounded-xl transition-colors flex items-center gap-1"
            :class="hasActiveFilters ? 'bg-primary/10 text-primary' : 'bg-surface-container-low text-slate-600 hover:bg-surface-container'">
            <span class="material-symbols-outlined text-lg">filter_list</span>
            {{ t('addPromptModal.filter') }}
            <span v-if="hasActiveFilters" class="w-2 h-2 rounded-full bg-primary"></span>
          </button>
          <div v-if="showFilters"
            class="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-10">
            <div class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{{
                  t('addPromptModal.category') }}</label>
                <select v-model="filterCategory" class="w-full px-3 py-2 bg-surface-container-low rounded-lg text-sm">
                  <option value="">{{ t('addPromptModal.allCategories') }}</option>
                  <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{{
                  t('addPromptModal.tags') }}</label>
                <select v-model="filterTag" class="w-full px-3 py-2 bg-surface-container-low rounded-lg text-sm">
                  <option value="">{{ t('addPromptModal.allTags') }}</option>
                  <option v-for="tag in allTags" :key="tag" :value="tag">{{ tag }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{{
                  t('addPromptModal.collectionStatus') }}</label>
                <select v-model="filterCollectionStatus"
                  class="w-full px-3 py-2 bg-surface-container-low rounded-lg text-sm">
                  <option value="">{{ t('addPromptModal.all') }}</option>
                  <option value="none">{{ t('addPromptModal.notInAnyCollection') }}</option>
                  <option value="other">{{ t('addPromptModal.inOtherCollection') }}</option>
                  <option value="current">{{ t('addPromptModal.inCurrentCollection') }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{{
                  t('addPromptModal.specificCollection') }}</label>
                <select v-model="filterCollectionId"
                  class="w-full px-3 py-2 bg-surface-container-low rounded-lg text-sm">
                  <option value="">{{ t('addPromptModal.allCollections') }}</option>
                  <option v-for="col in otherCollections" :key="col.id" :value="col.id">{{ col.name }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <button @click="toggleSelectAll" class="px-4 py-2 text-sm font-medium rounded-xl transition-colors"
          :class="isAllSelected ? 'bg-primary text-white' : 'bg-surface-container-low text-slate-600 hover:bg-surface-container'">
          {{ isAllSelected ? t('addPromptModal.deselectAll') : t('addPromptModal.selectAll') }}
        </button>
      </div>
      <div class="flex-1 overflow-y-auto space-y-2 p-3" style="min-height: 300px;">
        <div v-if="selectablePrompts.length === 0" class="text-center py-10 text-slate-400">
          <span class="material-symbols-outlined text-4xl mb-2">folder_open</span>
          <p>{{ t('addPromptModal.noPromptsAvailable') }}</p>
        </div>
        <div v-for="prompt in selectablePrompts" :key="prompt.id"
          class="flex items-center gap-3 p-3 rounded-xl transition-colors" :class="[
            isInCurrentCollection(prompt)
              ? 'bg-slate-100 opacity-50 cursor-not-allowed'
              : selectedPromptIds.includes(prompt.id as number)
                ? 'ring-2 ring-primary bg-primary/5 cursor-pointer'
                : 'bg-surface-container-low hover:bg-surface-container cursor-pointer'
          ]" @click="handlePromptClick(prompt)">
          <div class="flex-1 min-w-0">
            <p class="font-medium text-slate-900 truncate">{{ prompt.title }}</p>
            <p class="text-xs text-slate-500 truncate">{{ prompt.content_zh?.slice(0, 60) || prompt.content_en?.slice(0,
              60) }}...</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{{ prompt.category }}</span>
            <span v-if="isInCurrentCollection(prompt)"
              class="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">{{ t('addPromptModal.inCollection')
              }}</span>
            <span v-else-if="prompt.collection_id" class="text-xs px-2 py-1 bg-slate-100 text-slate-500 rounded-full">{{
              t('addPromptModal.inOther') }}</span>
          </div>
        </div>
      </div>
      <div class="flex gap-3 mt-4 pt-4 border-t">
        <span class="text-sm text-slate-500">{{ t('addPromptModal.selectedCount', { count: selectedPromptIds.length })
          }}</span>
        <div class="flex-1"></div>
        <button @click="$emit('update:visible', false)"
          class="px-4 py-2 bg-surface-container-high rounded-xl font-medium">{{ t('dialog.cancel') }}</button>
        <button @click="handleAdd" class="px-4 py-2 bg-primary text-white rounded-xl font-medium"
          :disabled="selectedPromptIds.length === 0">
          {{ t('addPromptModal.addPrompts', { count: selectedPromptIds.length }) }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePromptStore } from '@/stores/prompts'

const props = defineProps<{
  visible: boolean
  collectionId: number
  collectionName: string
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'added'): void
}>()

const store = usePromptStore()
const { t } = useI18n()
const searchQuery = ref('')
const selectedPromptIds = ref<number[]>([])
const showFilters = ref(false)
const filterCategory = ref('')
const filterTag = ref('')
const filterCollectionStatus = ref('')
const filterCollectionId = ref<number | ''>('')
const filterDropdownRef = ref<HTMLElement | null>(null)

const categories = computed(() => {
  const cats = new Set(store.prompts.map(p => p.category))
  return Array.from(cats).filter(Boolean)
})

const allTags = computed(() => {
  const tags = new Set<string>()
  store.prompts.forEach(p => {
    p.tags?.forEach(t => tags.add(t))
  })
  return Array.from(tags).sort()
})

const otherCollections = computed(() => {
  return store.collections.filter(c => c.id !== props.collectionId)
})

const hasActiveFilters = computed(() => {
  return !!filterCategory.value || !!filterTag.value || !!filterCollectionStatus.value || filterCollectionId.value !== ''
})

const selectablePrompts = computed(() => {
  let prompts = store.prompts

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    prompts = prompts.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.content_zh?.toLowerCase().includes(q) ||
      p.content_en?.toLowerCase().includes(q) ||
      p.tags?.some(t => t.toLowerCase().includes(q))
    )
  }

  if (filterCategory.value) {
    prompts = prompts.filter(p => p.category === filterCategory.value)
  }

  if (filterTag.value) {
    prompts = prompts.filter(p => p.tags?.includes(filterTag.value))
  }

  if (filterCollectionStatus.value) {
    if (filterCollectionStatus.value === 'none') {
      prompts = prompts.filter(p => !p.collection_id)
    } else if (filterCollectionStatus.value === 'other') {
      prompts = prompts.filter(p => p.collection_id && p.collection_id !== props.collectionId)
    } else if (filterCollectionStatus.value === 'current') {
      prompts = prompts.filter(p => p.collection_id === props.collectionId)
    }
  }

  if (filterCollectionId.value !== '') {
    prompts = prompts.filter(p => p.collection_id === filterCollectionId.value)
  }

  return prompts
})

const selectablePromptsNotInCollection = computed(() => {
  return selectablePrompts.value.filter(p => !isInCurrentCollection(p))
})

const isAllSelected = computed(() => {
  if (selectablePromptsNotInCollection.value.length === 0) return false
  return selectablePromptsNotInCollection.value.every(p => selectedPromptIds.value.includes(p.id as number))
})

function isInCurrentCollection(prompt: any) {
  return prompt.collection_id === props.collectionId
}

function handlePromptClick(prompt: any) {
  if (isInCurrentCollection(prompt)) return
  toggleSelection(prompt.id as number)
}

function toggleSelection(promptId: number) {
  const index = selectedPromptIds.value.indexOf(promptId)
  if (index > -1) {
    selectedPromptIds.value.splice(index, 1)
  } else {
    selectedPromptIds.value.push(promptId)
  }
}

function toggleSelectAll() {
  const selectableIds = selectablePromptsNotInCollection.value.map(p => p.id as number)
  if (isAllSelected.value) {
    selectedPromptIds.value = selectedPromptIds.value.filter(id => !selectableIds.includes(id))
  } else {
    selectableIds.forEach(id => {
      if (!selectedPromptIds.value.includes(id)) {
        selectedPromptIds.value.push(id)
      }
    })
  }
}

async function handleAdd() {
  const idsToAdd = selectedPromptIds.value.filter(id => {
    const prompt = store.prompts.find(p => p.id === id)
    return prompt && !isInCurrentCollection(prompt)
  })

  if (idsToAdd.length === 0) return

  // 使用批量 API 一次性添加所有提示词到集合，避免逐条 IPC 调用
  // 使用 .slice() 将数组转换为纯数据，避免 Vue Proxy 导致的 IPC 序列化问题
  await store.batchUpdatePrompts(idsToAdd.slice(), { collection_id: props.collectionId })

  emit('update:visible', false)
  selectedPromptIds.value = []
  searchQuery.value = ''
  resetFilters()
  emit('added')
}

function resetFilters() {
  filterCategory.value = ''
  filterTag.value = ''
  filterCollectionStatus.value = ''
  filterCollectionId.value = ''
  showFilters.value = false
}

function handleClickOutside(event: MouseEvent) {
  if (filterDropdownRef.value && !filterDropdownRef.value.contains(event.target as Node)) {
    showFilters.value = false
  }
}

watch(() => props.visible, (val) => {
  if (val) {
    selectedPromptIds.value = []
    searchQuery.value = ''
    resetFilters()
  }
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
