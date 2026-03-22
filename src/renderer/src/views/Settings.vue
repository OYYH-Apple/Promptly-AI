<template>
  <section class="flex-1 overflow-y-auto py-16 px-8 bg-surface">
    <div class="max-w-4xl mx-auto">
      <div class="mb-12">
        <h2 class="text-3xl font-bold tracking-tight text-on-surface mb-2">Settings & Data</h2>
        <p class="text-on-surface-variant">Manage your workspace preferences and data portability.</p>
      </div>

      <div class="space-y-6 mb-12">
        <h3 class="text-xs font-bold uppercase tracking-[0.15em] text-outline px-1">Data Management</h3>
        <div class="bg-surface-container-lowest rounded-2xl shadow-sm border border-slate-200/5 divide-y divide-slate-100">
          <div class="flex items-center justify-between p-6 hover:bg-surface-container-low transition-colors duration-200">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container">
                <span class="material-symbols-outlined">ios_share</span>
              </div>
              <div>
                <h4 class="font-semibold text-on-surface">Export Workspace Data</h4>
                <p class="text-sm text-on-surface-variant mt-0.5">Download a JSON archive of all your prompts and collections.</p>
              </div>
            </div>
            <button @click="handleExport" class="px-5 py-2 text-sm font-semibold text-on-surface bg-surface-container-high rounded-xl hover:bg-surface-container-highest transition-all active:scale-[0.97]">
              Export Data
            </button>
          </div>
          <div class="flex items-center justify-between p-6 hover:bg-surface-container-low transition-colors duration-200">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container">
                <span class="material-symbols-outlined">file_upload</span>
              </div>
              <div>
                <h4 class="font-semibold text-on-surface">Import Data</h4>
                <p class="text-sm text-on-surface-variant mt-0.5">Merge existing archives into your current workspace.</p>
              </div>
            </div>
            <button @click="handleImport" class="px-5 py-2 text-sm font-semibold text-on-surface bg-surface-container-high rounded-xl hover:bg-surface-container-highest transition-all active:scale-[0.97]">
              Import Data
            </button>
          </div>
        </div>
      </div>

      <div class="p-8 bg-surface-container-low rounded-3xl border border-slate-200/10">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-lg font-bold text-on-surface mb-1">System Health</h3>
            <p class="text-sm text-on-surface-variant mb-6">Real-time status of your local environment.</p>
            <div class="grid grid-cols-2 gap-8">
              <div class="flex items-center gap-3">
                <div class="relative">
                  <div class="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                  <div class="absolute inset-0 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping opacity-40"></div>
                </div>
                <div>
                  <span class="block text-sm font-semibold text-on-surface">Database</span>
                  <span class="block text-xs text-on-surface-variant">SQLite Connected</span>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                <div>
                  <span class="block text-sm font-semibold text-on-surface">Prompts</span>
                  <span class="block text-xs text-on-surface-variant">{{ stats.prompts }} items stored</span>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                <div>
                  <span class="block text-sm font-semibold text-on-surface">Collections</span>
                  <span class="block text-xs text-on-surface-variant">{{ stats.collections }} collections</span>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                <div>
                  <span class="block text-sm font-semibold text-on-surface">Favorites</span>
                  <span class="block text-xs text-on-surface-variant">{{ stats.favorites }} starred</span>
                </div>
              </div>
            </div>
          </div>
          <div class="flex flex-col items-end gap-2">
            <div class="px-3 py-1 bg-white rounded-full border border-slate-200 text-[10px] font-bold tracking-widest uppercase text-on-surface-variant shadow-sm">v1.0.0</div>
          </div>
        </div>
      </div>

      <div class="mt-20 pt-10 border-t border-slate-200/30">
        <div class="flex items-center justify-between p-6 bg-error-container/10 rounded-2xl border border-error-container/20">
          <div>
            <h4 class="font-bold text-on-error-container">Purge All Workspace Data</h4>
            <p class="text-sm text-on-error-container opacity-80">This action is irreversible. All local prompts and indexes will be permanently deleted.</p>
          </div>
          <button class="px-5 py-2 text-sm font-bold text-on-error bg-error rounded-xl hover:shadow-lg hover:shadow-error/20 transition-all active:scale-[0.97]">
            Purge Data
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePromptStore } from '@/stores/prompts'

const store = usePromptStore()
const stats = ref({ prompts: 0, collections: 0, favorites: 0 })

async function handleExport() {
  const path = await store.exportData()
  if (path) {
    alert(`Data exported successfully to:\n${path}`)
  }
}

async function handleImport() {
  const data = await store.importData()
  if (data) {
    alert(`Imported ${data.prompts?.length || 0} prompts and ${data.collections?.length || 0} collections`)
  }
}

onMounted(async () => {
  stats.value = await window.api.getStats()
})
</script>
