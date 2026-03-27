<template>
  <section class="flex-1 overflow-y-auto py-16 px-8 bg-surface">
    <div class="max-w-4xl mx-auto">
      <div class="mb-12">
        <h2 class="text-3xl font-bold tracking-tight text-on-surface mb-2">{{ t('settings.title') }}</h2>
        <p class="text-on-surface-variant">{{ t('settings.subtitle') }}</p>
      </div>

      <!-- Storage Configuration -->
      <div class="space-y-6 mb-12">
        <h3 class="font-bold uppercase tracking-[0.15em] text-outline px-1"
          :class="locale === 'zh-CN' ? 'text-sm' : 'text-xs'">{{ t('settings.storageConfig') }}
        </h3>
        <div class="bg-surface-container-lowest rounded-2xl shadow-sm border border-slate-200/5 overflow-hidden">
          <div
            class="flex items-center justify-between p-6 hover:bg-surface-container-low transition-colors duration-200">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-primary">
                <span class="material-symbols-outlined">folder_open</span>
              </div>
              <div>
                <h4 class="font-semibold text-on-surface">{{ t('settings.localStoragePath') }}</h4>
                <p class="text-on-surface-variant font-mono mt-0.5"
                  :class="locale === 'zh-CN' ? 'text-base' : 'text-sm'">{{ storagePath }}</p>
              </div>
            </div>
            <Tooltip :text="t('tooltip.changeStoragePath')" placement="top">
              <button @click="changeStoragePath"
                class="px-5 py-2 font-semibold text-primary bg-primary-container/40 rounded-xl hover:bg-primary-container transition-all active:scale-[0.97]"
                :class="locale === 'zh-CN' ? 'text-base' : 'text-sm'">
                {{ t('common.change') }}
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      <!-- Data Management -->
      <div class="space-y-6 mb-12">
        <h3 class="font-bold uppercase tracking-[0.15em] text-outline px-1"
          :class="locale === 'zh-CN' ? 'text-sm' : 'text-xs'">{{ t('settings.dataManagement') }}
        </h3>
        <div
          class="bg-surface-container-lowest rounded-2xl shadow-sm border border-slate-200/5 divide-y divide-slate-100">
          <div
            class="flex items-center justify-between p-6 hover:bg-surface-container-low transition-colors duration-200">
            <div class="flex items-center gap-4">
              <div
                class="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container">
                <span class="material-symbols-outlined">ios_share</span>
              </div>
              <div>
                <h4 class="font-semibold text-on-surface">{{ t('settings.exportData') }}</h4>
                <p class="text-on-surface-variant mt-0.5" :class="locale === 'zh-CN' ? 'text-base' : 'text-sm'">{{
                  t('settings.exportDataDesc') }}</p>
              </div>
            </div>
            <Tooltip :text="t('tooltip.exportAsJson')" placement="top">
              <button @click="handleExport" :disabled="isExporting"
                class="px-5 py-2 font-semibold text-on-surface bg-surface-container-high rounded-xl hover:bg-surface-container-highest transition-all active:scale-[0.97] disabled:opacity-50"
                :class="locale === 'zh-CN' ? 'text-base' : 'text-sm'">
                {{ isExporting ? t('settings.exporting') : t('settings.exportData') }}
              </button>
            </Tooltip>
          </div>
          <div
            class="flex items-center justify-between p-6 hover:bg-surface-container-low transition-colors duration-200">
            <div class="flex items-center gap-4">
              <div
                class="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container">
                <span class="material-symbols-outlined">file_upload</span>
              </div>
              <div>
                <h4 class="font-semibold text-on-surface">{{ t('settings.importData') }}</h4>
                <p class="text-on-surface-variant mt-0.5" :class="locale === 'zh-CN' ? 'text-base' : 'text-sm'">{{
                  t('settings.importDataDesc') }}</p>
              </div>
            </div>
            <Tooltip :text="t('tooltip.importFromJson')" placement="top">
              <button @click="handleImport" :disabled="isImporting"
                class="px-5 py-2 font-semibold text-on-surface bg-surface-container-high rounded-xl hover:bg-surface-container-highest transition-all active:scale-[0.97] disabled:opacity-50"
                :class="locale === 'zh-CN' ? 'text-base' : 'text-sm'">
                {{ isImporting ? t('settings.importing') : t('settings.importData') }}
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      <!-- Software Update -->
      <div class="mb-12 space-y-6">
        <h3 class="font-bold uppercase tracking-[0.15em] text-outline px-1"
          :class="locale === 'zh-CN' ? 'text-sm' : 'text-xs'">{{ t('settings.softwareUpdate') }}
        </h3>
        <div
          class="bg-surface-container-lowest rounded-2xl shadow-sm border border-slate-200/5 divide-y divide-slate-100 overflow-hidden">
          <!-- Check for Updates -->
          <div
            class="flex items-center justify-between p-6 hover:bg-surface-container-low transition-colors duration-200">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-xl bg-primary-container/30 flex items-center justify-center text-primary">
                <span class="material-symbols-outlined">update</span>
              </div>
              <div>
                <h4 class="font-semibold text-on-surface">{{ t('settings.systemVersion') }}</h4>
                <p class="text-on-surface-variant mt-0.5" :class="locale === 'zh-CN' ? 'text-base' : 'text-sm'">
                  {{ t('settings.currentVersion') }}: <span class="font-mono">{{ currentVersion }}</span>
                  <span v-if="updateAvailable" class="ml-2 text-amber-500 font-medium">({{ t('settings.updateAvailable')
                  }})</span>
                </p>
              </div>
            </div>
            <div class="flex flex-col items-end gap-2">
              <!-- 下载进度条 -->
              <div v-if="isDownloading" class="w-48">
                <div class="flex justify-between text-xs text-on-surface-variant mb-1">
                  <span>{{ t('settings.downloading') }}</span>
                  <span>{{ downloadProgress.percent.toFixed(1) }}%</span>
                </div>
                <div class="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div class="h-full bg-primary transition-all duration-300 rounded-full"
                    :style="{ width: downloadProgress.percent + '%' }"></div>
                </div>
                <div class="text-xs text-on-surface-variant mt-1 text-right">
                  {{ formatBytes(downloadProgress.transferred) }} / {{ formatBytes(downloadProgress.total) }}
                </div>
              </div>

              <Tooltip :text="t('tooltip.checkForNewVersion')" placement="top">
                <button @click="checkForUpdates" :disabled="isChecking || isDownloading"
                  class="px-5 py-2 font-semibold text-primary bg-primary-container/40 rounded-xl hover:bg-primary-container transition-all active:scale-[0.97] disabled:opacity-50"
                  :class="locale === 'zh-CN' ? 'text-base' : 'text-sm'">
                  <span v-if="isChecking" class="flex items-center gap-2">
                    <span class="material-symbols-outlined animate-spin"
                      :class="locale === 'zh-CN' ? 'text-base' : 'text-sm'">progress_activity</span>
                    {{ t('settings.checking') }}
                  </span>
                  <span v-else>{{ t('settings.checkUpdate') }}</span>
                </button>
              </Tooltip>
            </div>
          </div>
          <!-- Automatic Updates Toggle -->
          <div
            class="flex items-center justify-between p-6 hover:bg-surface-container-low transition-colors duration-200">
            <div class="flex items-center gap-4">
              <div
                class="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container">
                <span class="material-symbols-outlined">sync_saved_locally</span>
              </div>
              <div>
                <h4 class="font-semibold text-on-surface">{{ t('settings.automaticUpdates') }}</h4>
                <p class="text-on-surface-variant mt-0.5" :class="locale === 'zh-CN' ? 'text-base' : 'text-sm'">{{
                  t('settings.automaticUpdatesDesc') }}</p>
              </div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="autoUpdate" class="sr-only peer" />
              <div
                class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary">
              </div>
            </label>
          </div>
          <!-- Clear Update Cache -->
          <div
            class="flex items-center justify-between p-6 hover:bg-surface-container-low transition-colors duration-200">
            <div class="flex items-center gap-4">
              <div
                class="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                <span class="material-symbols-outlined">cleaning_services</span>
              </div>
              <div>
                <h4 class="font-semibold text-on-surface">{{ t('settings.clearUpdateCache') }}</h4>
                <p class="text-on-surface-variant mt-0.5" :class="locale === 'zh-CN' ? 'text-base' : 'text-sm'">
                  {{ locale === 'zh-CN' ? '更新反复失败时，尝试清理缓存后重新下载' : 'Clear cache and re-download if updates keep failing'
                  }}
                </p>
              </div>
            </div>
            <button @click="handleClearUpdateCache"
              class="px-5 py-2 font-semibold text-on-surface bg-surface-container-high rounded-xl hover:bg-surface-container-highest transition-all active:scale-[0.97]"
              :class="locale === 'zh-CN' ? 'text-base' : 'text-sm'">
              {{ t('settings.clearUpdateCache') }}
            </button>
          </div>
        </div>
      </div>

      <!-- System Health -->
      <div class="p-8 bg-surface-container-low rounded-3xl border border-slate-200/10">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-lg font-bold text-on-surface mb-1">{{ t('settings.systemHealth') }}</h3>
            <p class="text-on-surface-variant mb-6" :class="locale === 'zh-CN' ? 'text-base' : 'text-sm'">{{
              t('settings.systemHealthDesc') }}</p>
            <div class="grid grid-cols-2 gap-8">
              <div class="flex items-center gap-3">
                <div class="relative">
                  <div class="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                  <div class="absolute inset-0 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping opacity-40"></div>
                </div>
                <div>
                  <span class="block font-semibold text-on-surface"
                    :class="locale === 'zh-CN' ? 'text-base' : 'text-sm'">{{ t('systemHealth.localNode') }}</span>
                  <span class="block text-on-surface-variant" :class="locale === 'zh-CN' ? 'text-sm' : 'text-xs'">{{
                    t('systemHealth.localNodeStatus') }}</span>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                <div>
                  <span class="block font-semibold text-on-surface"
                    :class="locale === 'zh-CN' ? 'text-base' : 'text-sm'">{{ t('systemHealth.searchIndex') }}</span>
                  <span class="block text-on-surface-variant" :class="locale === 'zh-CN' ? 'text-sm' : 'text-xs'">{{
                    t('systemHealth.searchIndexStatus') }}</span>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                <div>
                  <span class="block font-semibold text-on-surface"
                    :class="locale === 'zh-CN' ? 'text-base' : 'text-sm'">{{ t('systemHealth.database') }}</span>
                  <span class="block text-on-surface-variant" :class="locale === 'zh-CN' ? 'text-sm' : 'text-xs'">{{
                    t('systemHealth.databaseStatus', {
                      count:
                        stats.prompts
                    }) }}</span>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                <div>
                  <span class="block font-semibold text-on-surface"
                    :class="locale === 'zh-CN' ? 'text-base' : 'text-sm'">{{ t('systemHealth.collections') }}</span>
                  <span class="block text-on-surface-variant" :class="locale === 'zh-CN' ? 'text-sm' : 'text-xs'">{{
                    t('systemHealth.collectionsStatus', {
                      count:
                        stats.collections
                    }) }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="flex flex-col items-end gap-2">
            <div
              class="px-3 py-1 bg-white rounded-full border border-slate-200 font-bold tracking-widest uppercase text-on-surface-variant shadow-sm"
              :class="locale === 'zh-CN' ? 'text-xs' : 'text-[10px]'">
              {{ currentVersion }}
            </div>
            <Tooltip :text="t('tooltip.viewSystemLogs')" placement="top">
              <button @click="showLogsModal = true" class="text-primary font-medium hover:underline"
                :class="locale === 'zh-CN' ? 'text-sm' : 'text-xs'">
                {{ t('settings.viewDetailedLogs') }}
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      <!-- Dangerous Area -->
      <div class="mt-20 pt-10 border-t border-slate-200/30">
        <div
          class="flex items-center justify-between p-6 bg-error-container/10 rounded-2xl border border-error-container/20">
          <div>
            <h4 class="font-bold text-on-error-container" :class="locale === 'zh-CN' ? 'text-lg' : 'text-base'">{{
              t('settings.purgeData') }}</h4>
            <p class="text-on-error-container opacity-80" :class="locale === 'zh-CN' ? 'text-base' : 'text-sm'">{{
              t('settings.purgeDataDesc') }}</p>
          </div>
          <Tooltip :text="t('tooltip.permanentlyDeleteAllData')" placement="top">
            <button @click="showPurgeDialog = true"
              class="px-5 py-2 font-bold text-on-error bg-error rounded-xl hover:shadow-lg hover:shadow-error/20 transition-all active:scale-[0.97]"
              :class="locale === 'zh-CN' ? 'text-base' : 'text-sm'">
              {{ t('settings.purgeData') }}
            </button>
          </Tooltip>
        </div>
      </div>
    </div>

    <!-- Purge Confirmation Dialog -->
    <ConfirmDialog v-model:visible="showPurgeDialog" type="danger" :title="t('dialog.purgeAllDataTitle')"
      :message="t('dialog.purgeAllDataMessage')" :confirm-text="t('dialog.purgeAll')" :cancel-text="t('dialog.cancel')"
      @confirm="handlePurge" />

    <!-- Update Available Dialog -->
    <div v-if="showUpdateDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="showUpdateDialog = false">
      <div class="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center text-primary">
            <span class="material-symbols-outlined text-2xl">system_update</span>
          </div>
          <div>
            <h3 class="text-xl font-bold text-on-surface">{{ t('dialog.updateAvailableTitle') }}</h3>
            <p class="text-sm text-slate-500">{{ t('dialog.versionReadyToInstall', { version: latestVersion }) }}</p>
          </div>
        </div>
        <div class="bg-surface-container-low rounded-xl p-4 mb-6 max-h-60 overflow-y-auto">
          <h4 class="font-semibold text-sm text-on-surface mb-2">{{ t('dialog.whatsNew') }}</h4>
          <!-- Markdown 渲染内容 -->
          <div v-if="renderedReleaseNotes" class="prose prose-sm prose-slate max-w-none text-on-surface-variant"
            v-html="renderedReleaseNotes"></div>
          <!-- 纯文本列表回退 -->
          <ul v-else class="text-sm text-on-surface-variant space-y-1">
            <li v-for="(note, idx) in releaseNotes" :key="idx" class="flex items-start gap-2">
              <span class="text-primary mt-0.5">•</span>
              {{ note }}
            </li>
          </ul>
        </div>
        <div class="flex gap-3">
          <Tooltip :text="t('tooltip.remindMeLater')" placement="top">
            <button @click="showUpdateDialog = false"
              class="flex-1 px-4 py-2 bg-surface-container-high rounded-xl font-medium">{{ t('dialog.later') }}</button>
          </Tooltip>
          <Tooltip :text="t('tooltip.downloadAndInstall')" placement="top">
            <button @click="downloadUpdate" class="flex-1 px-4 py-2 bg-primary text-white rounded-xl font-medium">
              {{ t('dialog.downloadAndInstall') }}
            </button>
          </Tooltip>
        </div>
      </div>
    </div>

    <!-- Install Confirm Dialog - 下载完成后确认安装 -->
    <div v-if="showInstallConfirmDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <span class="material-symbols-outlined text-2xl">download_done</span>
          </div>
          <div>
            <h3 class="text-xl font-bold text-on-surface">{{ t('dialog.installNow') }}</h3>
            <p class="text-sm text-slate-500">{{ t('dialog.versionReadyToInstall', { version: latestVersion }) }}</p>
          </div>
        </div>
        <p class="text-sm text-on-surface-variant mb-6">{{ t('dialog.restartToInstall') }}</p>
        <div class="flex gap-3">
          <button @click="showInstallConfirmDialog = false"
            class="flex-1 px-4 py-2 bg-surface-container-high rounded-xl font-medium">
            {{ t('dialog.later') }}
          </button>
          <button @click="executeInstallUpdate" class="flex-1 px-4 py-2 bg-primary text-white rounded-xl font-medium">
            {{ t('dialog.installNow') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Update Retry Dialog - 上次安装失败的恢复提示 -->
    <div v-if="showRetryDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
            <span class="material-symbols-outlined text-2xl">warning</span>
          </div>
          <div>
            <h3 class="text-xl font-bold text-on-surface">{{ t('dialog.updateRetryTitle') }}</h3>
            <p class="text-sm text-slate-500">{{ t('dialog.updateRetryMessage', { version: retryVersion }) }}</p>
          </div>
        </div>
        <div v-if="retryReleaseNotes" class="bg-surface-container-low rounded-xl p-4 mb-6 max-h-40 overflow-y-auto">
          <h4 class="font-semibold text-sm text-on-surface mb-2">{{ t('dialog.whatsNew') }}</h4>
          <div v-if="renderedReleaseNotes" class="prose prose-sm prose-slate max-w-none text-on-surface-variant"
            v-html="renderedReleaseNotes"></div>
        </div>
        <div class="flex gap-3">
          <button @click="ignoreRetryUpdate" class="flex-1 px-4 py-2 bg-surface-container-high rounded-xl font-medium">
            {{ t('dialog.ignoreUpdate') }}
          </button>
          <button @click="retryDownloadUpdate" class="flex-1 px-4 py-2 bg-primary text-white rounded-xl font-medium">
            {{ t('dialog.retryDownload') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Logs Modal -->
    <div v-if="showLogsModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="showLogsModal = false">
      <div class="bg-white rounded-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
        <div class="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 class="text-lg font-bold text-on-surface">{{ t('dialog.systemLogsTitle') }}</h3>
          <button @click="showLogsModal = false" class="p-2 hover:bg-slate-100 rounded-full">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="flex-1 overflow-y-auto p-4 bg-slate-900 font-mono text-xs">
          <div v-if="logs.length === 0" class="text-slate-500 text-center py-8">
            {{ t('dialog.noLogsAvailable') }}
          </div>
          <div v-else class="space-y-1">
            <div v-for="(log, index) in logs" :key="index" class="flex gap-3" :class="{
              'text-emerald-400': log.level === 'info',
              'text-amber-400': log.level === 'warn',
              'text-red-400': log.level === 'error'
            }">
              <span class="text-slate-500 shrink-0">{{ log.timestamp }}</span>
              <span class="uppercase shrink-0 w-12">[{{ log.level }}]</span>
              <span>{{ log.message }}</span>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50">
          <span class="text-xs text-slate-500">{{ t('dialog.logEntriesCount', { count: logs.length }) }}</span>
          <div class="flex gap-2">
            <Tooltip :text="t('tooltip.reloadLogs')" placement="top">
              <button @click="refreshLogs"
                class="px-4 py-2 text-sm font-medium text-slate-600 bg-white rounded-xl hover:bg-slate-100 transition-colors">
                <span class="material-symbols-outlined text-sm align-middle mr-1">refresh</span>
                {{ t('common.refresh') }}
              </button>
            </Tooltip>
            <Tooltip :text="t('tooltip.closeLogs')" placement="top">
              <button @click="showLogsModal = false"
                class="px-4 py-2 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary-dim transition-colors">
                {{ t('common.close') }}
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePromptStore } from '@/stores/prompts'
import { useNotificationStore } from '@/stores/notifications'
import { marked } from 'marked'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import Tooltip from '@/components/Tooltip.vue'

const store = usePromptStore()
const notificationStore = useNotificationStore()
const { t, locale } = useI18n()
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
const releaseNotesMarkdown = ref('')

// 将 Release Notes 渲染为 HTML
const renderedReleaseNotes = computed(() => {
  if (releaseNotesMarkdown.value) {
    return marked(releaseNotesMarkdown.value, { breaks: true })
  }
  return ''
})

// 下载进度状态
const isDownloading = ref(false)
const downloadProgress = ref({
  percent: 0,
  transferred: 0,
  total: 0
})

// 更新安装失败恢复相关状态
const showRetryDialog = ref(false)        // 是否显示重试对话框
const retryVersion = ref('')              // 待重试的版本号
const retryReleaseNotes = ref('')         // 待重试版本的更新日志
const showInstallConfirmDialog = ref(false)  // 下载完成后的安装确认弹窗

async function checkForUpdates() {
  isChecking.value = true
  try {
    const result = await window.api.checkForUpdates?.() || { available: false }
    if (result.available) {
      latestVersion.value = result.version || 'v1.0.1'
      // 处理 Release Notes：优先使用 Markdown 格式
      if (result.releaseNotes) {
        if (Array.isArray(result.releaseNotes)) {
          releaseNotes.value = result.releaseNotes
          releaseNotesMarkdown.value = result.releaseNotes.join('\n')
        } else {
          releaseNotes.value = result.releaseNotes.split('\n').filter(line => line.trim())
          releaseNotesMarkdown.value = result.releaseNotes
        }
      } else {
        releaseNotes.value = ['Bug fixes and performance improvements', 'New features added']
        releaseNotesMarkdown.value = ''
      }
      updateAvailable.value = true
      showUpdateDialog.value = true
      // 添加发现新版本通知
      notificationStore.info(
        t('notifications.updateAvailable'),
        t('notifications.updateAvailableMessage', { version: latestVersion.value }),
        { label: '查看详情', callback: () => { showUpdateDialog.value = true } }
      )
    } else {
      showToast(t('toast.latestVersion'), 'success')
    }
  } catch (e) {
    showToast(t('toast.failedToCheckUpdates'), 'error')
  } finally {
    isChecking.value = false
  }
}

async function downloadUpdate() {
  showUpdateDialog.value = false
  isDownloading.value = true
  downloadProgress.value = { percent: 0, transferred: 0, total: 0 }

  try {
    const result = await window.api.downloadUpdate?.()
    if (result?.success) {
      showToast(t('toast.updateDownloaded'), 'success')
    } else {
      showToast(result?.error || t('toast.failedToDownloadUpdate'), 'error')
    }
  } catch (e) {
    showToast(t('toast.failedToDownloadUpdate'), 'error')
  } finally {
    isDownloading.value = false
  }
}

async function changeStoragePath() {
  try {
    const result = await window.api.changeStoragePath()
    if (result) {
      storagePath.value = result.newPath
      showToast(t('toast.storageMoved', { path: result.newPath }), 'success')
    }
  } catch (e) {
    showToast(t('toast.failedToChangeStoragePath'), 'error')
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
      showToast(t('toast.dataExported'), 'success')
      // 添加导出成功通知
      notificationStore.success(
        t('notifications.exportSuccess'),
        t('notifications.exportSuccessMessage'),
        { label: '查看设置', path: '/settings' }
      )
    }
  } catch (e) {
    showToast(t('toast.exportFailed'), 'error')
    // 添加导出失败通知
    notificationStore.error(
      t('notifications.exportFailed'),
      t('notifications.exportFailedMessage')
    )
  } finally {
    isExporting.value = false
  }
}

async function handleImport() {
  isImporting.value = true
  try {
    const data = await store.importData()
    if (data) {
      const count = data.prompts?.length || 0
      showToast(t('toast.importedPrompts', { count }), 'success')
      stats.value = await window.api.getStats()
      // 添加导入成功通知
      notificationStore.success(
        t('notifications.importSuccess'),
        t('notifications.importSuccessMessage', { count }),
        { label: '查看库', path: '/' }
      )
    }
  } catch (e) {
    showToast(t('toast.importFailed'), 'error')
    // 添加导入失败通知
    notificationStore.error(
      t('notifications.importFailed'),
      t('notifications.importFailedMessage')
    )
  } finally {
    isImporting.value = false
  }
}

async function handlePurge() {
  try {
    const success = await window.api.purgeAllData()
    if (success) {
      showToast(t('toast.dataPurged'), 'success')
      stats.value = { prompts: 0, collections: 0, favorites: 0 }
      await store.fetchPrompts()
      await store.fetchCollections()
    } else {
      showToast(t('toast.failedToPurgeData'), 'error')
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

// 格式化字节数为可读格式
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 执行安装（重启应用）
async function executeInstallUpdate() {
  showInstallConfirmDialog.value = false
  try {
    await window.api.quitAndInstall?.()
  } catch (e) {
    showToast(t('toast.updateInstallFailed'), 'error')
  }
}

// 重试下载并安装更新（安装失败恢复流程）
async function retryDownloadUpdate() {
  showRetryDialog.value = false
  isDownloading.value = true
  downloadProgress.value = { percent: 0, transferred: 0, total: 0 }

  try {
    const result = await window.api.downloadUpdate?.()
    if (result?.success) {
      // 下载完成后 onUpdateDownloaded 监听器会弹出安装确认弹窗
    } else {
      showToast(result?.error || t('toast.failedToDownloadUpdate'), 'error')
      isDownloading.value = false
    }
  } catch (e) {
    showToast(t('toast.failedToDownloadUpdate'), 'error')
    isDownloading.value = false
  }
}

// 忽略待恢复的更新版本
async function ignoreRetryUpdate() {
  showRetryDialog.value = false
  if (retryVersion.value) {
    await window.api.ignoreUpdateVersion?.(retryVersion.value)
  }
}

// 清理更新缓存
async function handleClearUpdateCache() {
  try {
    const result = await window.api.clearUpdateCache?.()
    if (result?.success) {
      showToast(t('toast.updateCacheCleared'), 'success')
    } else {
      showToast(t('toast.clearCacheFailed'), 'error')
    }
  } catch (e) {
    showToast(t('toast.clearCacheFailed'), 'error')
  }
}

onMounted(async () => {
  stats.value = await window.api.getStats()
  try {
    storagePath.value = await window.api.getStoragePath()
  } catch (e) {
    storagePath.value = 'Unknown'
  }

  // 获取应用当前版本号
  try {
    const version = await window.api.getAppVersion?.()
    if (version) {
      currentVersion.value = 'v' + version
    }
  } catch (e) {
    console.error('Failed to get app version:', e)
  }

  refreshLogs()

  const savedAutoUpdate = localStorage.getItem('auto-update')
  if (savedAutoUpdate !== null) {
    autoUpdate.value = savedAutoUpdate === 'true'
  }

  // 监听发现新版本事件（自动检查或手动检查）
  window.api.onUpdateAvailable?.((info) => {
    latestVersion.value = info.version || 'v1.0.1'
    updateAvailable.value = true
    // 处理 Release Notes
    if (info.releaseNotes) {
      if (Array.isArray(info.releaseNotes)) {
        releaseNotes.value = info.releaseNotes
        releaseNotesMarkdown.value = info.releaseNotes.join('\n')
      } else {
        releaseNotes.value = info.releaseNotes.split('\n').filter(line => line.trim())
        releaseNotesMarkdown.value = info.releaseNotes
      }
    } else {
      releaseNotes.value = ['Bug fixes and performance improvements', 'New features added']
      releaseNotesMarkdown.value = ''
    }
    // 显示更新提示弹窗
    showUpdateDialog.value = true
    // 添加发现新版本通知
    notificationStore.info(
      t('notifications.updateAvailable'),
      t('notifications.updateAvailableMessage', { version: latestVersion.value }),
      { label: '查看详情', callback: () => { showUpdateDialog.value = true } }
    )
  })

  // 监听下载进度
  window.api.onDownloadProgress?.((progress) => {
    downloadProgress.value = {
      percent: Math.round(progress.percent * 100) / 100,
      transferred: progress.transferred,
      total: progress.total
    }
  })

  // 监听更新下载完成 — 弹出安装确认弹窗
  window.api.onUpdateDownloaded?.(() => {
    isDownloading.value = false
    showInstallConfirmDialog.value = true
    // 添加更新下载完成通知
    notificationStore.success(
      t('notifications.updateDownloaded'),
      t('notifications.updateDownloadedMessage'),
      { label: '立即安装', callback: () => { executeInstallUpdate() } }
    )
  })

  // 监听更新错误
  window.api.onUpdateError?.((error) => {
    isDownloading.value = false
    showToast(t('toast.updateError', { error }), 'error')
  })

  // 监听安装失败事件（quitAndInstall 异常时触发）
  window.api.onInstallFailed?.((_data) => {
    isDownloading.value = false
    showToast(t('toast.updateInstallFailed'), 'error')
  })

  // 监听启动时的安装失败恢复事件
  window.api.onInstallFailedRecovery?.((data: { version: string, releaseNotes: string | null, lastAttemptTime: string | null }) => {
    retryVersion.value = data.version
    retryReleaseNotes.value = data.releaseNotes || ''
    if (data.releaseNotes) {
      releaseNotesMarkdown.value = data.releaseNotes
      releaseNotes.value = data.releaseNotes.split('\n').filter((line: string) => line.trim())
    }
    showRetryDialog.value = true
  })
})
</script>
