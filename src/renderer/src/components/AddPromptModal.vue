<template>
  <div v-if="visible" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="$emit('update:visible', false)">
    <div class="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold">Add Prompts to "{{ collectionName }}"</h3>
        <button @click="$emit('update:visible', false)" class="p-2 hover:bg-slate-100 rounded-full">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div class="mb-4">
        <input
          v-model="searchQuery"
          class="w-full px-4 py-2 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20"
          placeholder="Search prompts..."
        />
      </div>
      <div class="flex-1 overflow-y-auto space-y-2">
        <div
          v-for="prompt in filteredPrompts"
          :key="prompt.id"
          class="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl hover:bg-surface-container transition-colors cursor-pointer"
          :class="{ 'ring-2 ring-primary bg-primary/5': selectedPromptIds.includes(prompt.id as number) }"
          @click="toggleSelection(prompt.id as number)"
        >
          <div class="flex-1 min-w-0">
            <p class="font-medium text-slate-900 truncate">{{ prompt.title }}</p>
            <p class="text-xs text-slate-500 truncate">{{ prompt.content_zh?.slice(0, 60) || prompt.content_en?.slice(0, 60) }}...</p>
          </div>
          <span
            v-if="prompt.collection_id === collectionId"
            class="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full"
          >In collection</span>
          <span
            v-else-if="prompt.collection_id"
            class="text-xs px-2 py-1 bg-slate-100 text-slate-500 rounded-full"
          >In other</span>
        </div>
      </div>
      <div class="flex gap-3 mt-4 pt-4 border-t">
        <span class="text-sm text-slate-500">{{ selectedPromptIds.length }} selected</span>
        <div class="flex-1"></div>
        <button @click="$emit('update:visible', false)" class="px-4 py-2 bg-surface-container-high rounded-xl font-medium">Cancel</button>
        <button @click="handleAdd" class="px-4 py-2 bg-primary text-white rounded-xl font-medium" :disabled="selectedPromptIds.length === 0">
          Add {{ selectedPromptIds.length || '' }} Prompts
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
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
const searchQuery = ref('')
const selectedPromptIds = ref<number[]>([])

const filteredPrompts = computed(() => {
  let prompts = store.prompts
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    prompts = prompts.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.content_zh?.toLowerCase().includes(q) ||
      p.content_en?.toLowerCase().includes(q)
    )
  }
  return prompts
})

function toggleSelection(promptId: number) {
  const index = selectedPromptIds.value.indexOf(promptId)
  if (index > -1) {
    selectedPromptIds.value.splice(index, 1)
  } else {
    selectedPromptIds.value.push(promptId)
  }
}

async function handleAdd() {
  if (selectedPromptIds.value.length === 0) return

  for (const promptId of selectedPromptIds.value) {
    if (promptId !== undefined && promptId !== null) {
      await store.updatePrompt(promptId, { collection_id: props.collectionId })
    }
  }

  emit('update:visible', false)
  selectedPromptIds.value = []
  searchQuery.value = ''
  emit('added')
}

watch(() => props.visible, (val) => {
  if (val) {
    selectedPromptIds.value = store.prompts
      .filter(p => p.collection_id === props.collectionId && p.id !== undefined)
      .map(p => p.id as number)
    searchQuery.value = ''
  }
})
</script>
