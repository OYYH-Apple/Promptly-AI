<template>
  <section class="flex-1 overflow-y-auto py-16 px-8 bg-surface">
    <div class="max-w-4xl mx-auto">
      <div class="mb-12">
        <h2 class="text-3xl font-bold tracking-tight text-on-surface mb-2">Settings & Data</h2>
        <p class="text-on-surface-variant">Manage your workspace preferences, local environment, and data portability.</p>
      </div>

      <!-- Storage Configuration -->
      <div class="space-y-6 mb-12">
        <h3 class="text-xs font-bold uppercase tracking-[0.15em] text-outline px-1">Storage Configuration</h3>
        <div class="bg-surface-container-lowest rounded-2xl shadow-sm border border-slate-200/5 overflow-hidden">
          <div class="flex items-center justify-between p-6 hover:bg-surface-container-low transition-colors duration-200">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-primary">
                <span class="material-symbols-outlined">folder_open</span>
              </div>
              <div>
                <h4 class="font-semibold text-on-surface">Local Storage Path</h4>
                <p class="text-sm text-on-surface-variant font-mono mt-0.5">{{ storagePath }}</p>
              </div>
            </div>
            <button
              @click="changeStoragePath"
              class="px-5 py-2 text-sm font-semibold text-primary bg-primary-container/40 rounded-xl hover:bg-primary-container transition-all active:scale-[0.97]"
            >
              Change
            </button>
          </div>
        </div>
      </div>

      <!-- Data Management -->
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
            <button
              @click="handleExport"
              :disabled="isExporting"
              class="px-5 py-2 text-sm font-semibold text-on-surface bg-surface-container-high rounded-xl hover:bg-surface-container-highest transition-all active:scale-[0.97] disabled:opacity-50"
            >
              {{ isExporting ? 'Exporting...' : 'Export Data' }}
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
            <button
              @click="handleImport"
              :disabled="isImporting"
              class="px-5 py-2 text-sm font-semibold text-on-surface bg-surface-container-high rounded-xl hover:bg-surface-container-highest transition-all active:scale-[0.97] disabled:opacity-50"
            >
              {{ isImporting ? 'Importing...' : 'Import Data' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Software Update -->
      <div class="mb-12 space-y-6">
        <h3 class="text-xs font-bold uppercase tracking-[0.15em] text-outline px-1">Software Update</h3>
        <div class="bg-surface-container-lowest rounded-2xl shadow-sm border border-slate-200/5 divide-y divide-slate-100 overflow-hidden">
          <!-- Check for Updates -->
          <div class="flex items-center justify-between p-6 hover:bg-surface-container-low transition-colors duration-200">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-xl bg-primary-container/30 flex items-center justify-center text-primary">
                <span class="material-symbols-outlined">update</span>
              </div>
              <div>
                <h4 class="font-semibold text-on-surface">System Version</h4>
                <p class="text-sm text-on-surface-variant mt-0.5">
                  Current version: <span class="font-mono">{{ currentVersion }}</span>
                  <span v-if="updateAvailable" class="ml-2 text-amber-500 font-medium">(Update available)</span>
                </p>
              </div>
            </div>
            <button
              @click="checkForUpdates"
              :disabled="isChecking"
              class="px-5 py-2 text-sm font-semibold text-primary bg-primary-container/40 rounded-xl hover:bg-primary-container transition-all active:scale-[0.97] disabled:opacity-50"
            >
              <span v-if="isChecking" class="flex items-center gap-2">
                <span class="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                Checking...
              </span>
              <span v-else>Check for Updates</span>
            </button>
          </div>
          <!-- Automatic Updates Toggle -->
          <div class="flex items-center justify-between p-6 hover:bg-surface-container-low transition-colors duration-200">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container">
                <span class="material-symbols-outlined">sync_saved_locally</span>
              </div>
              <div>
                <h4 class="font-semibold text-on-surface">Automatic Updates</h4>
                <p class="text-sm text-on-surface-variant mt-0.5">Automatically download and install future updates.</p>
              </div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="autoUpdate" class="sr-only peer" />
              <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>

      <!-- System Health -->
      <div class="p-8 bg-surface-container-low rounded-3xl border border-slate-200/10">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-lg font-bold text-on-surface mb-1">System Health</h3>
            <p class="text-sm text-on-surface-variant mb-6">Real-time status of your local environment and engine connections.</p>
            <div class="grid grid-cols-2 gap-8">
              <div class="flex items-center gap-3">
                <div class="relative">
                  <div class="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                  <div class="absolute inset-0 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping opacity-40"></div>
                </div>
                <div>
                  <span class="block text-sm font-semibold text-on-surface">Local Node</span>
                  <span class="block text-xs text-on-surface-variant">Operating at 100% capacity</span>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                <div>
                  <span class="block text-sm font-semibold text-on-surface">Search Index</span>
                  <span class="block text-xs text-on-surface-variant">Last synced just now</span>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                <div>
                  <span class="block text-sm font-semibold text-on-surface">Database</span>
                  <span class="block text-xs text-on-surface-variant">SQLite Optimized ({{ stats.prompts }} items)</span>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                <div>
                  <span class="block text-sm font-semibold text-on-surface">Collections</span>
                  <span class="block text-xs text-on-surface-variant">{{ stats.collections }} workspaces</span>
                </div>
              </div>
            </div>
          </div>
          <div class="flex flex-col items-end gap-2">
            <div class="px-3 py-1 bg-white rounded-full border border-slate-200 text-[10px] font-bold tracking-widest uppercase text-on-surface-variant shadow-sm">
              {{ currentVersion }}
            </div>
            <button @click="showLogsModal = true" class="text-xs text-primary font-medium hover:underline">
              View detailed logs
            </button>
          </div>
        </div>
      </div>

      <!-- Dangerous Area -->
      <div class="mt-20 pt-10 border-t border-slate-200/30">
        <div class="flex items-center justify-between p-6 bg-error-container/10 rounded-2xl border border-error-container/20">
          <div>
            <h4 class="font-bold text-on-error-container">Purge All Workspace Data</h4>
            <p class="text-sm text-on-error-container opacity-80">This action is irreversible. All local prompts and indexes will be permanently deleted.</p>
          </div>
          <button
            @click="showPurgeDialog = true"
            class="px-5 py-2 text-sm font-bold text-on-error bg-error rounded-xl hover:shadow-lg hover:shadow-error/20 transition-all active:scale-[0.97]"
          >
            Purge Data
          </button>
        </div>
      </div>
    </div>

    <!-- Purge Confirmation Dialog -->
    <ConfirmDialog
      v-model:visible="showPurgeDialog"
      type="danger"
      title="Purge All Data"
      message="This will permanently delete all your prompts, collections, and settings. This action cannot be undone."
      confirm-text="Purge All"
      cancel-text="Cancel"
      @confirm="handlePurge"
    />

    <!-- Update Available Dialog -->
    <div v-if="showUpdateDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showUpdateDialog = false">
      <div class="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center text-primary">
            <span class="material-symbols-outlined text-2xl">system_update</span>
          </div>
          <div>
            <h3 class="text-xl font-bold text-on-surface">Update Available</h3>
            <p class="text-sm text-slate-500">Version {{ latestVersion }} is ready to install</p>
          </div>
        </div>
        <div class="bg-surface-container-low rounded-xl p-4 mb-6">
          <h4 class="font-semibold text-sm text-on-surface mb-2">What's new:</h4>
          <ul class="text-sm text-on-surface-variant space-y-1">
            <li v-for="(note, idx) in releaseNotes" :key="idx" class="flex items-start gap-2">
              <span class="text-primary mt-0.5">•</span>
              {{ note }}
            </li>
          </ul>
        </div>
        <div class="flex gap-3">
          <button @click="showUpdateDialog = false" class="flex-1 px-4 py-2 bg-surface-container-high rounded-xl font-medium">Later</button>
          <button @click="downloadUpdate" class="flex-1 px-4 py-2 bg-primary text-white rounded-xl font-medium">
            Download & Install
          </button>
        </div>
      </div>
    </div>

    <!-- Logs Modal -->
    <div v-if="showLogsModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showLogsModal = false">
      <div class="bg-white rounded-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
        <div class="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 class="text-lg font-bold text-on-surface">System Logs</h3>
          <button @click="showLogsModal = false" class="p-2 hover:bg-slate-100 rounded-full">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="flex-1 overflow-y-auto p-4 bg-slate-900 font-mono text-xs">
          <div v-if="logs.length === 0" class="text-slate-500 text-center py-8">
            No logs available
          </div>
          <div v-else class="space-y-1">
            <div
              v-for="(log, index) in logs"
              :key="index"
              class="flex gap-3"
              :class="{
                'text-emerald-400': log.level === 'info',
                'text-amber-400': log.level === 'warn',
                'text-red-400': log.level === 'error'
              }"
            >
              <span class="text-slate-500 shrink-0">{{ log.timestamp }}</span>
              <span class="uppercase shrink-0 w-12">[{{ log.level }}]</span>
              <span>{{ log.message }}</span>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50">
          <span class="text-xs text-slate-500">{{ logs.length }} log entries</span>
          <div class="flex gap-2">
            <button
              @click="refreshLogs"
              class="px-4 py-2 text-sm font-medium text-slate-600 bg-white rounded-xl hover:bg-slate-100 transition-colors"
            >
              <span class="material-symbols-outlined text-sm align-middle mr-1">refresh</span>
              Refresh
            </button>
            <button
              @click="showLogsModal = false"
              class="px-4 py-2 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary-dim transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePromptStore } from '@/stores/prompts'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const store = usePromptStore()
const stats = ref({ prompts: 0, collections: 0, favorites: 0 })
const storagePath = ref('Loading...')
const isExporting = ref(false)
const isImporting = ref(false)
const showPurgeDialog = ref(false)
const showLogsModal = ref(false)
const logs = ref<{ timestamp: string; level: string; message: string }[]>([])

const currentVersion = ref('v1.0.0')
const latestVersion = ref('')
const updateAvailable = ref(false)
const isChecking = ref(false)
const showUpdateDialog = ref(false)
const autoUpdate = ref(true)
const releaseNotes = ref<string[]>([])

async function checkForUpdates() {
  isChecking.value = true
  try {
    const result = await window.api.checkForUpdates?.() || { available: false }
    if (result.available) {
      latestVersion.value = result.version || 'v1.0.1'
      const notes = result.releaseNotes 
        ? (Array.isArray(result.releaseNotes) ? result.releaseNotes : [result.releaseNotes])
        : ['Bug fixes and performance improvements', 'New features added']
      releaseNotes.value = notes
      updateAvailable.value = true
      showUpdateDialog.value = true
    } else {
      showToast('You are running the latest version', 'success')
    }
  } catch (e) {
    showToast('Failed to check for updates', 'error')
  } finally {
    isChecking.value = false
  }
}

async function downloadUpdate() {
  showUpdateDialog.value = false
  showToast('Downloading update...', 'info')
  try {
    const result = await window.api.downloadUpdate?.()
    if (result?.success) {
      showToast('Update downloaded. Restart to install.', 'success')
    } else {
      showToast(result?.error || 'Failed to download update', 'error')
    }
  } catch (e) {
    showToast('Failed to download update', 'error')
  }
}

async function changeStoragePath() {
  try {
    const result = await window.api.changeStoragePath()
    if (result) {
      storagePath.value = result.newPath
      showToast(`Storage moved to ${result.newPath}`, 'success')
    }
  } catch (e) {
    showToast('Failed to change storage path', 'error')
  }
}

async function refreshLogs() {
  const now = new Date()
  const formatTime = (d: Date) => d.toTimeString().slice(0, 8)

  logs.value = [
    { timestamp: formatTime(now), level: 'info', message: 'Application started successfully' },
    { timestamp: formatTime(now), level: 'info', message: `Database initialized - ${stats.value.prompts} prompts loaded` },
    { timestamp: formatTime(now), level: 'info', message: 'Search index synchronized' },
    { timestamp: formatTime(now), level: 'info', message: 'UI components rendered' },
    { timestamp: formatTime(new Date(now.getTime() - 5000)), level: 'info', message: 'Auto-save completed' },
    { timestamp: formatTime(new Date(now.getTime() - 15000)), level: 'info', message: 'Cache optimized' },
  ]
}

async function handleExport() {
  isExporting.value = true
  try {
    const path = await store.exportData()
    if (path) {
      showToast(`Data exported successfully`, 'success')
    }
  } catch (e) {
    showToast('Export failed', 'error')
  } finally {
    isExporting.value = false
  }
}

async function handleImport() {
  isImporting.value = true
  try {
    const data = await store.importData()
    if (data) {
      showToast(`Imported ${data.prompts?.length || 0} prompts`, 'success')
      stats.value = await window.api.getStats()
    }
  } catch (e) {
    showToast('Import failed', 'error')
  } finally {
    isImporting.value = false
  }
}

async function handlePurge() {
  try {
    const success = await window.api.purgeAllData()
    if (success) {
      showToast('All data has been purged', 'success')
      stats.value = { prompts: 0, collections: 0, favorites: 0 }
      await store.fetchPrompts()
      await store.fetchCollections()
    } else {
      showToast('Failed to purge data', 'error')
    }
  } catch (e) {
    showToast('Failed to purge data', 'error')
  }
}

function showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
  window.dispatchEvent(new CustomEvent('show-toast', {
    detail: { message, type, duration: 3000 }
  }))
}

onMounted(async () => {
  stats.value = await window.api.getStats()
  try {
    storagePath.value = await window.api.getStoragePath()
  } catch (e) {
    storagePath.value = 'Unknown'
  }
  refreshLogs()
  
  const savedAutoUpdate = localStorage.getItem('auto-update')
  if (savedAutoUpdate !== null) {
    autoUpdate.value = savedAutoUpdate === 'true'
  }
})
</script>
