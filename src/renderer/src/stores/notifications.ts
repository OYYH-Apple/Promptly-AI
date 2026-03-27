// ==================== 依赖引入 ====================
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// ==================== 常量定义 ====================
const NOTIFICATION_STORAGE_KEY = 'promptly-notifications'
const MAX_NOTIFICATIONS_COUNT = 50

// ==================== 类型定义 ====================
export type NotificationType = 'success' | 'warning' | 'error' | 'info'

export interface NotificationAction {
  label: string
  path?: string
  callback?: () => void
}

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  time: string
  read: boolean
  action?: NotificationAction
}

export interface NotificationOptions {
  type?: NotificationType
  title: string
  message?: string
  action?: NotificationAction
}

// ==================== 工具函数 ====================

/**
 * 生成唯一通知ID
 */
function generateNotificationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * 格式化通知时间为相对描述
 */
function formatNotificationTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) {
    return '刚刚'
  } else if (minutes < 60) {
    return `${minutes} 分钟前`
  } else if (hours < 24) {
    return `${hours} 小时前`
  } else if (days < 7) {
    return `${days} 天前`
  } else {
    return new Date(timestamp).toLocaleDateString('zh-CN')
  }
}

// ==================== Store 定义 ====================
export const useNotificationStore = defineStore('notifications', () => {
  // ==================== 状态 ====================
  const notifications = ref<Notification[]>([])

  // ==================== 计算属性 ====================
  const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.read).length
  })

  const hasUnread = computed(() => unreadCount.value > 0)

  const sortedNotifications = computed(() => {
    return [...notifications.value].sort((a, b) => {
      // 未读的通知排在前面
      if (a.read !== b.read) {
        return a.read ? 1 : -1
      }
      // 按时间倒序
      return parseInt(b.id.split('-')[0]) - parseInt(a.id.split('-')[0])
    })
  })

  // ==================== 本地存储操作 ====================

  /**
   * 从 localStorage 加载通知列表
   */
  function loadNotificationsFromStorage(): void {
    try {
      const saved = localStorage.getItem(NOTIFICATION_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as Notification[]
        // 验证数据结构
        if (Array.isArray(parsed)) {
          notifications.value = parsed.filter(n => 
            n && 
            typeof n.id === 'string' && 
            typeof n.title === 'string'
          )
        }
      }
    } catch (error) {
      console.error('加载通知数据失败:', error)
      notifications.value = []
    }
  }

  /**
   * 保存通知列表到 localStorage
   */
  function saveNotificationsToStorage(): void {
    try {
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notifications.value))
    } catch (error) {
      console.error('保存通知数据失败:', error)
    }
  }

  // ==================== 核心业务逻辑 ====================

  /**
   * 添加新通知
   * @param options 通知配置选项
   * @returns 新创建的通知ID
   */
  function addNotification(options: NotificationOptions): string {
    const id = generateNotificationId()
    const timestamp = Date.now()

    const notification: Notification = {
      id,
      type: options.type || 'info',
      title: options.title,
      message: options.message || '',
      time: formatNotificationTime(timestamp),
      read: false,
      action: options.action
    }

    // 添加到列表开头
    notifications.value.unshift(notification)

    // 限制最大数量，保留最新的
    if (notifications.value.length > MAX_NOTIFICATIONS_COUNT) {
      notifications.value = notifications.value.slice(0, MAX_NOTIFICATIONS_COUNT)
    }

    saveNotificationsToStorage()
    return id
  }

  /**
   * 标记指定通知为已读
   * @param id 通知ID
   */
  function markAsRead(id: string): void {
    const notification = notifications.value.find(n => n.id === id)
    if (notification && !notification.read) {
      notification.read = true
      saveNotificationsToStorage()
    }
  }

  /**
   * 标记所有通知为已读
   */
  function markAllRead(): void {
    let hasUnreadNotifications = false
    notifications.value.forEach(n => {
      if (!n.read) {
        n.read = true
        hasUnreadNotifications = true
      }
    })
    if (hasUnreadNotifications) {
      saveNotificationsToStorage()
    }
  }

  /**
   * 删除指定通知
   * @param id 通知ID
   */
  function removeNotification(id: string): void {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
      saveNotificationsToStorage()
    }
  }

  /**
   * 清空所有通知
   */
  function clearAll(): void {
    if (notifications.value.length > 0) {
      notifications.value = []
      saveNotificationsToStorage()
    }
  }

  /**
   * 获取通知图标对应的 Material Symbol 名称
   */
  function getNotificationIcon(type: NotificationType): string {
    const iconMap: Record<NotificationType, string> = {
      success: 'check_circle',
      warning: 'warning',
      error: 'error',
      info: 'info'
    }
    return iconMap[type] || 'notifications'
  }

  // ==================== 便捷方法 ====================

  /**
   * 添加成功类型的通知
   */
  function success(title: string, message?: string, action?: NotificationAction): string {
    return addNotification({ type: 'success', title, message, action })
  }

  /**
   * 添加警告类型的通知
   */
  function warning(title: string, message?: string, action?: NotificationAction): string {
    return addNotification({ type: 'warning', title, message, action })
  }

  /**
   * 添加错误类型的通知
   */
  function error(title: string, message?: string, action?: NotificationAction): string {
    return addNotification({ type: 'error', title, message, action })
  }

  /**
   * 添加信息类型的通知
   */
  function info(title: string, message?: string, action?: NotificationAction): string {
    return addNotification({ type: 'info', title, message, action })
  }

  // ==================== 初始化 ====================
  // 立即加载已保存的通知
  loadNotificationsFromStorage()

  // ==================== 导出内容 ====================
  return {
    // 状态
    notifications,
    // 计算属性
    unreadCount,
    hasUnread,
    sortedNotifications,
    // 核心方法
    addNotification,
    markAsRead,
    markAllRead,
    removeNotification,
    clearAll,
    getNotificationIcon,
    // 便捷方法
    success,
    warning,
    error,
    info,
    // 存储方法（供外部使用）
    loadNotificationsFromStorage,
    saveNotificationsToStorage
  }
})
