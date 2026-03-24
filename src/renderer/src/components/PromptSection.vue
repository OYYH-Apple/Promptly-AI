<template>
  <section class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
          <span class="material-symbols-outlined" :style="{ color: iconColor }">
            {{ icon }}
          </span>
          {{ title }}
          <span v-if="totalCount > maxVisible" class="text-sm font-normal text-slate-400 ml-2">
            ({{ totalCount }})
          </span>
        </h3>
        <div class="flex items-center gap-1 bg-surface-container-low rounded-lg p-0.5">
          <Tooltip :text="t('tooltip.sortByNewest')" placement="top">
            <button
              @click="sortBy = 'newest'"
              :class="[
                'px-2 py-1 text-xs font-medium rounded-md transition-colors',
                sortBy === 'newest' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
              ]"
            >
              {{ t('library.newest') }}
            </button>
          </Tooltip>
          <Tooltip :text="t('tooltip.sortByOldest')" placement="top">
            <button
              @click="sortBy = 'oldest'"
              :class="[
                'px-2 py-1 text-xs font-medium rounded-md transition-colors',
                sortBy === 'oldest' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
              ]"
            >
              {{ t('library.oldest') }}
            </button>
          </Tooltip>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <span v-if="!isExpanded && totalCount > maxVisible" class="text-xs text-slate-400">
          {{ t('view.showingOf', { visible: maxVisible, total: totalCount }) }}
        </span>
        <Tooltip v-if="showViewAll && totalCount > maxVisible" :text="isExpanded ? t('tooltip.collapseSection') : t('tooltip.showAllItems')" placement="top">
          <button
            @click="toggleExpand"
            class="text-primary text-xs font-semibold hover:underline"
          >
            {{ isExpanded ? t('library.showLess') : t('library.viewAll', { count: totalCount }) }}
          </button>
        </Tooltip>
      </div>
    </div>
    <div
      class="grid gap-6"
      :class="gridClass"
    >
      <button
        v-if="showAddButton"
        @click="$emit('add')"
        class="group border-2 border-dashed border-slate-200 p-6 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer min-h-[180px]"
      >
        <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors">
          <span class="material-symbols-outlined">add</span>
        </div>
        <span class="text-sm font-semibold text-slate-400 group-hover:text-primary">
          {{ addButtonText }}
        </span>
      </button>
      <slot :items="displayItems"></slot>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Tooltip from './Tooltip.vue'

const { t } = useI18n()

const props = withDefaults(defineProps<{
  title: string
  icon: string
  iconColor?: string
  items: any[]
  showViewAll?: boolean
  showAddButton?: boolean
  addButtonText?: string
  columns?: number
  maxRows?: number
}>(), {
  iconColor: '#005bc1',
  showViewAll: true,
  showAddButton: true,
  addButtonText: 'New Item',
  columns: 4,
  maxRows: 2
})

defineEmits<{
  (e: 'view-all'): void
  (e: 'add'): void
}>()

const isExpanded = ref(false)
const sortBy = ref<'newest' | 'oldest'>('newest')

const maxVisible = computed(() => {
  return props.columns * props.maxRows - 1
})

const totalCount = computed(() => props.items.length)

const sortedItems = computed(() => {
  const items = [...props.items]
  if (sortBy.value === 'newest') {
    return items.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
      return dateB - dateA
    })
  } else {
    return items.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
      return dateA - dateB
    })
  }
})

const displayItems = computed(() => {
  if (isExpanded.value) {
    return sortedItems.value
  }
  return sortedItems.value.slice(0, maxVisible.value)
})

const gridClass = computed(() => {
  const colMap: Record<number, string> = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
  }
  return colMap[props.columns] || colMap[4]
})

function toggleExpand() {
  isExpanded.value = !isExpanded.value
}
</script>
