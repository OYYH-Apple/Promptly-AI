// ==================== Vue I18n 配置 ====================

import { createI18n } from 'vue-i18n'
import { messages, type Locale } from '../locales'

const SUPPORTED_LOCALES: Locale[] = ['zh-CN', 'en-US']
const DEFAULT_LOCALE: Locale = 'zh-CN'
const STORAGE_KEY = 'app-locale'

/**
 * 获取存储的语言设置
 */
function getStoredLocale(): Locale | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && SUPPORTED_LOCALES.includes(stored as Locale)) {
      return stored as Locale
    }
  } catch {
    // localStorage 不可用
  }
  return null
}

/**
 * 检测系统语言
 */
function detectSystemLocale(): Locale {
  const browserLang = navigator.language.toLowerCase()
  if (browserLang.startsWith('zh')) {
    return 'zh-CN'
  }
  return 'en-US'
}

/**
 * 获取初始语言设置
 */
function getInitialLocale(): Locale {
  return getStoredLocale() || detectSystemLocale()
}

/**
 * 设置语言
 */
export function setLocale(locale: Locale): void {
  if (!SUPPORTED_LOCALES.includes(locale)) {
    console.warn(`Unsupported locale: ${locale}`)
    return
  }

  i18n.global.locale.value = locale

  try {
    localStorage.setItem(STORAGE_KEY, locale)
  } catch {
    // localStorage 不可用
  }

  // 设置 HTML lang 属性
  document.documentElement.setAttribute('lang', locale)
}

/**
 * 获取当前语言
 */
export function getLocale(): Locale {
  return i18n.global.locale.value as Locale
}

/**
 * 切换语言
 */
export function toggleLocale(): Locale {
  const current = getLocale()
  const newLocale = current === 'zh-CN' ? 'en-US' : 'zh-CN'
  setLocale(newLocale)
  return newLocale
}

// 创建 i18n 实例
export const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: 'en-US',
  messages,
  // 禁用警告（开发环境可开启）
  missingWarn: false,
  fallbackWarn: false
})

// 导出常量
export { SUPPORTED_LOCALES, DEFAULT_LOCALE, STORAGE_KEY }
