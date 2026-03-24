// ==================== 格式化工具函数 ====================

import { useI18n } from 'vue-i18n'

/**
 * 日期格式化组合式函数
 */
export function useDateFormatter() {
  const { t, locale } = useI18n()

  /**
   * 格式化日期为相对时间
   */
  function formatRelativeTime(date?: string): string {
    if (!date) return ''

    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))

    if (hours < 1) return t('time.justNow')
    if (hours < 24) return t('time.hoursAgo', { count: hours })

    const days = Math.floor(hours / 24)
    if (days === 0) return t('time.today')
    if (days === 1) return t('time.yesterday')
    if (days < 7) return t('time.daysAgo', { count: days })

    // 超过一周显示具体日期
    const localeValue = locale.value === 'zh-CN' ? 'zh-CN' : 'en-US'
    return d.toLocaleDateString(localeValue, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  /**
   * 格式化完整日期
   */
  function formatFullDate(date?: string): string {
    if (!date) return ''

    const localeValue = locale.value === 'zh-CN' ? 'zh-CN' : 'en-US'
    return new Date(date).toLocaleDateString(localeValue, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  /**
   * 格式化字节数为可读格式
   */
  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  return {
    formatRelativeTime,
    formatFullDate,
    formatBytes
  }
}
