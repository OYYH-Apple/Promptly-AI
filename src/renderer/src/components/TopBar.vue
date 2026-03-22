<template>
  <header class="w-full h-16 sticky top-0 z-40 bg-white/70 backdrop-blur-xl flex items-center justify-between px-8 border-b border-slate-200/15 shadow-sm">
    <div class="flex items-center gap-4 flex-1">
      <div class="relative w-full max-w-md group">
        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
        <input 
          v-model="store.searchQuery"
          @input="store.fetchPrompts()"
          class="w-full bg-surface-container-low border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-1 ring-[#007AFF]/20 transition-all placeholder:text-slate-400"
          placeholder="Search prompts..."
          type="text"
        />
      </div>
    </div>
    <div class="flex items-center gap-6">
      <div class="flex items-center gap-4">
        <button class="text-slate-400 hover:text-slate-900 transition-colors">
          <span class="material-symbols-outlined">filter_list</span>
        </button>
        <button class="text-slate-400 hover:text-slate-900 transition-colors">
          <span class="material-symbols-outlined">help</span>
        </button>
      </div>
      <div class="h-8 w-px bg-slate-200"></div>
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden border border-slate-100">
          <div class="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500"></div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { usePromptStore } from '@/stores/prompts'

const store = usePromptStore()
</script>
