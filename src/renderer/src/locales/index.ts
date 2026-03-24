// ==================== 语言包入口 ====================

import zhCN from './zh-CN'
import enUS from './en-US'

export const messages = {
  'zh-CN': zhCN,
  'en-US': enUS
}

export type Locale = 'zh-CN' | 'en-US'
export type MessageSchema = typeof zhCN
