<template>
  <header class="w-full h-16 sticky top-0 z-40 bg-white/70 backdrop-blur-xl flex items-center justify-between px-8 border-b border-slate-200/15 shadow-sm">
    <div class="flex items-center gap-4 flex-1">
      <div class="relative w-full max-w-md group">
        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg group-focus-within:text-primary transition-colors">search</span>
        <input
          v-model="store.searchQuery"
          @input="handleSearch"
          class="w-full bg-surface-container-low border-none rounded-xl pl-10 pr-10 py-2 text-sm focus:ring-1 ring-[#007AFF]/20 transition-all placeholder:text-slate-400"
          :placeholder="t('common.searchPrompts')"
          type="text"
        />
        <Tooltip :text="t('tooltip.clearSearch')" placement="bottom">
          <button
            v-if="store.searchQuery"
            @click="clearSearch"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <span class="material-symbols-outlined text-lg">close</span>
          </button>
        </Tooltip>
      </div>
    </div>
    <div class="flex items-center gap-6">
      <div class="flex items-center gap-4">
        <Tooltip :text="t('tooltip.notifications')" placement="bottom">
          <button
            @click="showNotifications = !showNotifications"
            class="text-slate-400 hover:text-slate-900 transition-colors relative"
          >
            <span class="material-symbols-outlined">notifications</span>
            <span v-if="unreadCount > 0" class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </Tooltip>
        <Tooltip :text="t('tooltip.help')" placement="bottom">
          <button
            @click="showHelpModal = true"
            class="text-slate-400 hover:text-slate-900 transition-colors"
          >
            <span class="material-symbols-outlined">help</span>
          </button>
        </Tooltip>
      </div>
      <!-- 语言切换 -->
      <LanguageSwitch />
      <div class="h-8 w-px bg-slate-200"></div>
      <Tooltip :text="t('tooltip.feedback')" placement="bottom">
        <button
          @click="showFeedbackModal = true"
          class="text-slate-400 hover:text-slate-900 transition-colors"
        >
          <span class="material-symbols-outlined">feedback</span>
        </button>
      </Tooltip>
    </div>

    <!-- Notifications Dropdown -->
    <div
      v-if="showNotifications"
      class="absolute right-8 top-14 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50"
    >
      <div class="p-4 border-b border-slate-100 flex items-center justify-between">
        <h3 class="font-bold text-on-surface">{{ t('notifications.title') }}</h3>
        <button @click="markAllRead" class="text-xs text-primary font-medium hover:underline">
          {{ t('notifications.markAllRead') }}
        </button>
      </div>
      <div class="max-h-80 overflow-y-auto">
        <div v-if="notifications.length === 0" class="p-8 text-center text-slate-400">
          <span class="material-symbols-outlined text-4xl mb-2 block">notifications_off</span>
          <p class="text-sm">{{ t('notifications.noNotifications') }}</p>
        </div>
        <div v-else>
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="p-4 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-b-0"
            :class="{ 'bg-blue-50/50': !notification.read }"
            @click="handleNotificationClick(notification)"
          >
            <div class="flex items-start gap-3">
              <span
                class="material-symbols-outlined text-lg"
                :class="{
                  'text-emerald-500': notification.type === 'success',
                  'text-amber-500': notification.type === 'warning',
                  'text-red-500': notification.type === 'error',
                  'text-blue-500': notification.type === 'info'
                }"
              >
                {{ getNotificationIcon(notification.type) }}
              </span>
              <div class="flex-1">
                <p class="text-sm font-medium text-on-surface">{{ notification.title }}</p>
                <p class="text-xs text-slate-500 mt-0.5">{{ notification.message }}</p>
                <p class="text-xs text-slate-400 mt-1">{{ notification.time }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Help Modal -->
    <Teleport to="body">
      <div v-if="showHelpModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" @click.self="showHelpModal = false">
        <div class="bg-white rounded-2xl w-full max-w-4xl h-[80vh] overflow-hidden shadow-2xl flex">
          <!-- Left: Document Tree -->
          <div class="w-64 bg-surface-container-low border-r border-slate-100 flex flex-col">
            <div class="p-4 border-b border-slate-200">
              <h3 class="font-bold text-on-surface">{{ t('help.title') }}</h3>
            </div>
            <nav class="flex-1 overflow-y-auto p-2">
              <button
                v-for="sectionId in helpSectionIds"
                :key="sectionId"
                @click="activeSection = sectionId"
                class="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors mb-1"
                :class="activeSection === sectionId ? 'bg-primary/10 text-primary font-medium' : 'text-slate-600 hover:bg-slate-100'"
              >
                <span class="material-symbols-outlined text-sm align-middle mr-2">{{ helpSectionIcons[sectionId] }}</span>
                {{ t(`help.${sectionId}Nav`) }}
              </button>
            </nav>
          </div>

          <!-- Right: Content Area -->
          <div class="flex-1 flex flex-col">
            <div class="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 class="text-xl font-bold text-on-surface">{{ t(`help.${activeSection}Title`) }}</h2>
                <p class="text-sm text-slate-500 mt-1">{{ t(`help.${activeSection}Subtitle`) }}</p>
              </div>
              <button @click="showHelpModal = false" class="p-2 hover:bg-slate-100 rounded-full">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            <div class="flex-1 overflow-y-auto p-6">
              <!-- Introduction -->
              <div v-if="activeSection === 'intro'" class="prose prose-slate max-w-none">
                <p class="text-on-surface-variant leading-relaxed">
                  <strong>Promptly AI</strong> 是一款专为 AI 提示词创作者设计的本地化管理工具。它帮助你高效地组织、搜索和复用你的提示词库，让你的 AI 工作流更加顺畅。
                </p>
                <h3 class="text-lg font-semibold text-on-surface mt-6 mb-3">核心特性</h3>
                <ul class="space-y-2 text-on-surface-variant">
                  <li class="flex items-start gap-2">
                    <span class="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                    <span><strong>本地存储</strong> - 所有数据存储在本地，保护你的隐私和知识产权</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                    <span><strong>智能分类</strong> - 支持按类别、标签、集合多维度组织提示词</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                    <span><strong>快速搜索</strong> - 全文搜索让你瞬间找到需要的提示词</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                    <span><strong>一键复制</strong> - 快速复制提示词到剪贴板，直接粘贴使用</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                    <span><strong>数据导入导出</strong> - 轻松备份和迁移你的提示词库</span>
                  </li>
                </ul>
              </div>

              <!-- Prompt Library -->
              <div v-if="activeSection === 'library'" class="prose prose-slate max-w-none">
                <p class="text-on-surface-variant leading-relaxed">
                  提示词库是你所有提示词的集中管理区域。在这里，你可以浏览、搜索、编辑和删除你的提示词。
                </p>
                <h3 class="text-lg font-semibold text-on-surface mt-6 mb-3">主要功能</h3>
                <div class="space-y-4">
                  <div class="p-4 bg-surface-container-low rounded-xl">
                    <h4 class="font-semibold text-on-surface flex items-center gap-2">
                      <span class="material-symbols-outlined text-primary">search</span>
                      搜索提示词
                    </h4>
                    <p class="text-sm text-slate-500 mt-2">使用顶部搜索栏，输入关键词即可在整个提示词库中搜索。搜索范围包括标题、内容和标签。</p>
                  </div>
                  <div class="p-4 bg-surface-container-low rounded-xl">
                    <h4 class="font-semibold text-on-surface flex items-center gap-2">
                      <span class="material-symbols-outlined text-primary">filter_list</span>
                      筛选分类
                    </h4>
                    <p class="text-sm text-slate-500 mt-2">点击左侧边栏的分类标签，可以快速筛选特定类型的提示词（如 Image Generation、Video Prompt、Coding 等）。</p>
                  </div>
                  <div class="p-4 bg-surface-container-low rounded-xl">
                    <h4 class="font-semibold text-on-surface flex items-center gap-2">
                      <span class="material-symbols-outlined text-primary">grid_view</span>
                      视图切换
                    </h4>
                    <p class="text-sm text-slate-500 mt-2">支持网格视图和列表视图两种显示模式，根据你的偏好自由切换。</p>
                  </div>
                </div>
              </div>

              <!-- Collections -->
              <div v-if="activeSection === 'collections'" class="prose prose-slate max-w-none">
                <p class="text-on-surface-variant leading-relaxed">
                  集合功能允许你将相关的提示词组织在一起，创建项目或主题相关的工作空间。
                </p>
                <h3 class="text-lg font-semibold text-on-surface mt-6 mb-3">使用方法</h3>
                <div class="space-y-4">
                  <div class="p-4 bg-surface-container-low rounded-xl">
                    <h4 class="font-semibold text-on-surface">创建集合</h4>
                    <p class="text-sm text-slate-500 mt-2">在 Collections 页面点击 "New Collection" 按钮，输入名称、描述、选择图标和颜色即可创建。</p>
                  </div>
                  <div class="p-4 bg-surface-container-low rounded-xl">
                    <h4 class="font-semibold text-on-surface">添加提示词</h4>
                    <p class="text-sm text-slate-500 mt-2">进入集合详情页，点击 "Add Prompts" 按钮，在弹出的窗口中选择要添加的提示词。</p>
                  </div>
                  <div class="p-4 bg-surface-container-low rounded-xl">
                    <h4 class="font-semibold text-on-surface">移除提示词</h4>
                    <p class="text-sm text-slate-500 mt-2">在集合详情页，点击提示词卡片上的移除按钮，可以将提示词从集合中移除（不会删除提示词本身）。</p>
                  </div>
                </div>
              </div>

              <!-- Favorites -->
              <div v-if="activeSection === 'favorites'" class="prose prose-slate max-w-none">
                <p class="text-on-surface-variant leading-relaxed">
                  收藏功能帮助你快速访问最常用的提示词，打造你的个人精选库。
                </p>
                <h3 class="text-lg font-semibold text-on-surface mt-6 mb-3">操作方式</h3>
                <div class="space-y-4">
                  <div class="p-4 bg-surface-container-low rounded-xl">
                    <h4 class="font-semibold text-on-surface">添加收藏</h4>
                    <p class="text-sm text-slate-500 mt-2">在任意提示词卡片上点击星标图标，即可将其添加到收藏。</p>
                  </div>
                  <div class="p-4 bg-surface-container-low rounded-xl">
                    <h4 class="font-semibold text-on-surface">取消收藏</h4>
                    <p class="text-sm text-slate-500 mt-2">再次点击星标图标，即可取消收藏。提示词仍会保留在库中。</p>
                  </div>
                </div>
              </div>

              <!-- Shortcuts -->
              <div v-if="activeSection === 'shortcuts'" class="prose prose-slate max-w-none">
                <p class="text-on-surface-variant leading-relaxed">
                  使用快捷键可以大大提高你的工作效率。以下是 Promptly AI 支持的快捷键：
                </p>
                <div class="mt-6 space-y-3">
                  <div class="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
                    <span class="text-on-surface">新建提示词</span>
                    <kbd class="px-2 py-1 bg-slate-200 rounded text-sm font-mono">Ctrl + N</kbd>
                  </div>
                  <div class="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
                    <span class="text-on-surface">搜索</span>
                    <kbd class="px-2 py-1 bg-slate-200 rounded text-sm font-mono">Ctrl + F</kbd>
                  </div>
                  <div class="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
                    <span class="text-on-surface">复制提示词</span>
                    <kbd class="px-2 py-1 bg-slate-200 rounded text-sm font-mono">Ctrl + C</kbd>
                  </div>
                  <div class="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
                    <span class="text-on-surface">保存编辑</span>
                    <kbd class="px-2 py-1 bg-slate-200 rounded text-sm font-mono">Ctrl + S</kbd>
                  </div>
                </div>
              </div>

              <!-- Data Management -->
              <div v-if="activeSection === 'data'" class="prose prose-slate max-w-none">
                <p class="text-on-surface-variant leading-relaxed">
                  在设置页面，你可以管理数据的导入导出、存储路径和清除数据等操作。
                </p>
                <h3 class="text-lg font-semibold text-on-surface mt-6 mb-3">功能说明</h3>
                <div class="space-y-4">
                  <div class="p-4 bg-surface-container-low rounded-xl">
                    <h4 class="font-semibold text-on-surface flex items-center gap-2">
                      <span class="material-symbols-outlined text-primary">ios_share</span>
                      导出数据
                    </h4>
                    <p class="text-sm text-slate-500 mt-2">将所有提示词和集合导出为 JSON 文件，用于备份或迁移到其他设备。</p>
                  </div>
                  <div class="p-4 bg-surface-container-low rounded-xl">
                    <h4 class="font-semibold text-on-surface flex items-center gap-2">
                      <span class="material-symbols-outlined text-primary">file_upload</span>
                      导入数据
                    </h4>
                    <p class="text-sm text-slate-500 mt-2">从 JSON 文件导入提示词和集合，支持与现有数据合并。</p>
                  </div>
                  <div class="p-4 bg-surface-container-low rounded-xl">
                    <h4 class="font-semibold text-on-surface flex items-center gap-2">
                      <span class="material-symbols-outlined text-red-500">delete_forever</span>
                      清除数据
                    </h4>
                    <p class="text-sm text-slate-500 mt-2">永久删除所有提示词和集合。此操作不可撤销，请谨慎使用。</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Feedback Modal -->
    <Teleport to="body">
      <div v-if="showFeedbackModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" @click.self="closeFeedbackModal">
        <div class="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
          <div class="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 class="text-xl font-bold text-on-surface">{{ t('feedback.title') }}</h2>
              <p class="text-sm text-slate-500 mt-1">{{ t('feedback.subtitle') }}</p>
            </div>
            <button @click="closeFeedbackModal" class="p-2 hover:bg-slate-100 rounded-full">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- Feedback Form -->
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-on-surface mb-2">{{ t('feedback.typeLabel') }}</label>
              <div class="flex gap-2">
                <button
                  v-for="type in feedbackTypes"
                  :key="type.value"
                  @click="feedbackType = type.value"
                  class="px-3 py-1.5 rounded-lg text-sm transition-colors"
                  :class="feedbackType === type.value ? 'bg-primary text-white' : 'bg-surface-container-low text-slate-600 hover:bg-surface-container'"
                >
                  {{ type.label }}
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-on-surface mb-2">{{ t('feedback.contentLabel') }}</label>
              <textarea
                v-model="feedbackContent"
                rows="4"
                class="w-full bg-surface-container-low border-none rounded-xl p-3 text-sm focus:ring-1 ring-primary/20 resize-none"
                :placeholder="t('feedback.contentPlaceholder')"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-on-surface mb-2">{{ t('feedback.contactLabel') }}</label>
              <input
                v-model="feedbackContact"
                type="text"
                class="w-full bg-surface-container-low border-none rounded-xl px-3 py-2 text-sm focus:ring-1 ring-primary/20"
                :placeholder="t('feedback.contactPlaceholder')"
              />
            </div>

            <!-- Submit Buttons -->
            <div class="pt-2 space-y-3">
              <button
                @click="sendFeedbackEmail"
                class="flex items-center justify-center gap-2 w-full py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
              >
                <span class="material-symbols-outlined text-sm">email</span>
                <span class="text-sm font-medium">{{ t('feedback.sendViaEmail') }}</span>
              </button>

              <a
                href="https://github.com/OYYH-Apple/Promptly-AI/issues/new"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center justify-center gap-2 w-full py-2.5 bg-surface-container-high text-on-surface rounded-xl hover:bg-surface-container transition-colors"
                @click="closeFeedbackModal"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span class="text-sm font-medium">{{ t('feedback.submitOnGitHub') }}</span>
              </a>
            </div>
          </div>

          <div class="p-4 bg-surface-container-low text-center">
            <p class="text-xs text-slate-500">{{ t('feedback.thankYou') }}</p>
          </div>
        </div>
      </div>
    </Teleport>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { usePromptStore } from '@/stores/prompts'
import { useI18n } from 'vue-i18n'
import Tooltip from './Tooltip.vue'
import LanguageSwitch from './LanguageSwitch.vue'

const store = usePromptStore()
const { t } = useI18n()
const showNotifications = ref(false)
const showHelpModal = ref(false)
const showFeedbackModal = ref(false)
const activeSection = ref('intro')

// Feedback form
const feedbackType = ref('bug')
const feedbackContent = ref('')
const feedbackContact = ref('')

const feedbackTypes = computed(() => [
  { value: 'bug', label: t('feedback.bugReport') },
  { value: 'feature', label: t('feedback.featureRequest') },
  { value: 'other', label: t('feedback.other') }
])

// 发送反馈邮件（通过 SMTP）
async function sendFeedbackEmail() {
  // 表单校验
  if (!feedbackContent.value.trim()) {
    showToast(t('feedback.pleaseEnterContent'), 'warning')
    return
  }

  try {
    const result = await window.api.sendFeedbackEmail({
      type: feedbackType.value,
      content: feedbackContent.value,
      contact: feedbackContact.value
    })

    if (result.success) {
      showToast(t('feedback.sentSuccess'), 'success')
      handleSendFeedback()
    } else {
      showToast(t('feedback.sendFailed') + result.error, 'error')
    }
  } catch (error) {
    showToast(t('feedback.sendFailed'), 'error')
    console.error('Send feedback error:', error)
  }
}

const defaultNotifications = [
  { id: 1, type: 'success', title: 'Data Exported', message: 'Your prompts have been exported successfully', time: 'Just now' },
  { id: 2, type: 'info', title: 'New Features', message: 'Check out the latest updates in v1.0.0', time: '2 hours ago' },
  { id: 3, type: 'warning', title: 'Storage Alert', message: 'You have 50+ prompts in your library', time: '1 day ago' }
]

const notifications = ref(defaultNotifications.map(n => ({ ...n, read: false })))

// 计算未读通知数量
const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.read).length
})

function loadNotificationStates() {
  try {
    const saved = localStorage.getItem('notification-states')
    if (saved) {
      const states = JSON.parse(saved)
      notifications.value.forEach(n => {
        if (states[n.id] !== undefined) {
          n.read = states[n.id]
        }
      })
    }
  } catch (e) {
    console.error('Failed to load notification states:', e)
  }
}

function saveNotificationStates() {
  try {
    const states: Record<number, boolean> = {}
    notifications.value.forEach(n => {
      states[n.id] = n.read
    })
    localStorage.setItem('notification-states', JSON.stringify(states))
  } catch (e) {
    console.error('Failed to save notification states:', e)
  }
}

const helpSectionIds = ['intro', 'library', 'collections', 'favorites', 'shortcuts', 'data']
const helpSectionIcons: Record<string, string> = {
  intro: 'info',
  library: 'folder_special',
  collections: 'folder_copy',
  favorites: 'star',
  shortcuts: 'keyboard',
  data: 'storage'
}

let searchTimeout: ReturnType<typeof setTimeout> | null = null

function handleSearch() {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    store.fetchPrompts()
  }, 300)
}

function clearSearch() {
  store.searchQuery = ''
  store.fetchPrompts()
}

function getNotificationIcon(type: string) {
  const icons: Record<string, string> = {
    success: 'check_circle',
    warning: 'warning',
    error: 'error',
    info: 'info'
  }
  return icons[type] || 'notifications'
}

function handleNotificationClick(notification: any) {
  notification.read = true
  saveNotificationStates()
}

function markAllRead() {
  notifications.value.forEach(n => n.read = true)
  saveNotificationStates()
}

function showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
  window.dispatchEvent(new CustomEvent('show-toast', {
    detail: { message, type, duration: 2000 }
  }))
}

function handleSendFeedback() {
  showFeedbackModal.value = false
  // 延迟清除表单，等待邮件客户端打开
  setTimeout(() => {
    resetFeedbackForm()
  }, 100)
}

function closeFeedbackModal() {
  showFeedbackModal.value = false
  resetFeedbackForm()
}

function resetFeedbackForm() {
  feedbackType.value = 'bug'
  feedbackContent.value = ''
  feedbackContact.value = ''
}

function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.notifications-dropdown') && !target.closest('button')) {
    showNotifications.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  loadNotificationStates()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
