import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import type { Database, SqlJsStatic } from 'sql.js'
import { autoUpdater } from 'electron-updater'
import nodemailer from 'nodemailer'

// 加载 .env 文件（开发环境自动加载，生产环境需手动放置 .env 文件）
import dotenv from 'dotenv'

// 尝试从多个位置加载 .env 文件
dotenv.config() // 默认加载当前工作目录
dotenv.config({ path: join(process.resourcesPath || '', '.env') }) // 打包后从 resources 目录加载

let mainWindow: BrowserWindow | null = null
let db: Database | null = null

const userDataPath = app.getPath('userData')
const dbPath = join(userDataPath, 'prompts.db')

async function initDatabase() {
	if (!existsSync(userDataPath)) {
		mkdirSync(userDataPath, { recursive: true })
	}

	const initSqlJs = (await import('sql.js')).default
	const SQL: SqlJsStatic = await initSqlJs({
		locateFile: (file: string) => {
			const path = app.isPackaged
				? join(process.resourcesPath, file)
				: join(__dirname, '../../node_modules/sql.js/dist', file)
			return `file://${path}`
		}
	})

  if (existsSync(dbPath)) {
    const buffer = readFileSync(dbPath)
    db = new SQL.Database(buffer)
  } else {
    db = new SQL.Database()
  }

// Migration: check if we need to migrate old schema
  const tableInfo = db.exec("PRAGMA table_info(prompts)")
  if (tableInfo.length > 0) {
    const columns = tableInfo[0].values.map((col: any) => col[1])

    // If 'content' exists, we need to migrate to new schema
    if (columns.includes('content')) {
      // Create new table with correct schema
      db.run(`DROP TABLE IF EXISTS prompts_new`)
      db.run(`
        CREATE TABLE prompts_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          content_zh TEXT DEFAULT '',
          content_en TEXT DEFAULT '',
          category TEXT DEFAULT 'Image Generation',
          tags TEXT DEFAULT '[]',
          collection_id INTEGER,
          is_favorite INTEGER DEFAULT 0,
          is_private INTEGER DEFAULT 1,
          reference_images TEXT DEFAULT '[]',
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Migrate data from old table
      const hasIsPrivate = columns.includes('is_private')
      db.run(`
        INSERT INTO prompts_new (id, title, content_zh, content_en, category, tags, collection_id, is_favorite, is_private, reference_images, created_at, updated_at)
        SELECT 
          id, 
          title, 
          COALESCE(content, ''), 
          '', 
          COALESCE(category, 'Image Generation'), 
          COALESCE(tags, '[]'), 
          collection_id, 
          is_favorite, 
          ${hasIsPrivate ? 'is_private' : '1'}, 
          COALESCE(reference_images, '[]'), 
          created_at, 
          updated_at 
        FROM prompts
      `)

      // Drop old table and rename new one
      db.run(`DROP TABLE prompts`)
      db.run(`ALTER TABLE prompts_new RENAME TO prompts`)
    }
  } else {
    // No prompts table exists, create new one
    db.run(`
      CREATE TABLE IF NOT EXISTS prompts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content_zh TEXT DEFAULT '',
        content_en TEXT DEFAULT '',
        category TEXT DEFAULT 'Image Generation',
        tags TEXT DEFAULT '[]',
        collection_id INTEGER,
        is_favorite INTEGER DEFAULT 0,
        is_private INTEGER DEFAULT 1,
        reference_images TEXT DEFAULT '[]',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS collections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT DEFAULT 'folder',
      color TEXT DEFAULT '#005bc1',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)

db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `)

  saveDatabase()
}

function saveDatabase() {
  if (db) {
    const data = db.export()
    const buffer = Buffer.from(data)
    writeFileSync(dbPath, buffer)
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    show: false
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    // DevTools closed by default, press Ctrl+Shift+I to open
  } else {
    mainWindow.loadFile(join(__dirname, '../../dist/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })
}

app.whenReady().then(async () => {
  await initDatabase()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    saveDatabase()
    app.quit()
  }
})

function queryAll(sql: string, params: any[] = []): any[] {
  if (!db) return []
  const stmt = db.prepare(sql)
  stmt.bind(params)
  const results: any[] = []
  while (stmt.step()) {
    results.push(stmt.getAsObject())
  }
  stmt.free()
  return results
}

function queryOne(sql: string, params: any[] = []): any {
  const results = queryAll(sql, params)
  return results[0] || null
}

function runQuery(sql: string, params: any[] = []) {
  if (!db) return { lastInsertRowid: 0 }
  db.run(sql, params)
  const lastId = queryOne('SELECT last_insert_rowid() as id')
  saveDatabase()
  return { lastInsertRowid: lastId?.id || 0 }
}

ipcMain.handle('db:getPrompts', (_, { category, search, favorites, collectionId, limit, offset }) => {
  let sql = 'SELECT * FROM prompts WHERE 1=1'
  const params: any[] = []

  if (category) {
    sql += ' AND category = ?'
    params.push(category)
  }
  if (search) {
    sql += ' AND (title LIKE ? OR content_zh LIKE ? OR content_en LIKE ?)'
    params.push(`%${search}%`, `%${search}%`, `%${search}%`)
  }
  if (favorites) {
    sql += ' AND is_favorite = 1'
  }
  if (collectionId) {
    sql += ' AND collection_id = ?'
    params.push(collectionId)
  }

  sql += ' ORDER BY updated_at DESC'

  if (limit) {
    sql += ' LIMIT ?'
    params.push(limit)
    if (offset) {
      sql += ' OFFSET ?'
      params.push(offset)
    }
  }

  return queryAll(sql, params)
})

ipcMain.handle('db:getPrompt', (_, id) => {
  return queryOne('SELECT * FROM prompts WHERE id = ?', [id])
})

ipcMain.handle('db:createPrompt', (_, prompt) => {
  return runQuery(`
    INSERT INTO prompts (title, content_zh, content_en, category, tags, collection_id, is_favorite, is_private, reference_images)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    prompt.title,
    prompt.content_zh || '',
    prompt.content_en || '',
    prompt.category || 'Image Generation',
    JSON.stringify(prompt.tags || []),
    prompt.collection_id || null,
    prompt.is_favorite ? 1 : 0,
    prompt.is_private ? 1 : 0,
    JSON.stringify(prompt.reference_images || [])
  ]).lastInsertRowid
})

ipcMain.handle('db:updatePrompt', (_, id, prompt) => {
  const existing = queryOne('SELECT * FROM prompts WHERE id = ?', [id])
  if (!existing) return false

  const title = prompt.title ?? existing.title
  const content_zh = prompt.content_zh ?? existing.content_zh ?? ''
  const content_en = prompt.content_en ?? existing.content_en ?? ''
  const category = prompt.category ?? existing.category ?? 'Image Generation'
  const tags = prompt.tags !== undefined ? JSON.stringify(prompt.tags) : existing.tags ?? '[]'
  const collection_id = prompt.collection_id !== undefined ? prompt.collection_id : existing.collection_id
  const is_favorite = prompt.is_favorite !== undefined ? (prompt.is_favorite ? 1 : 0) : existing.is_favorite
  const is_private = prompt.is_private !== undefined ? (prompt.is_private ? 1 : 0) : existing.is_private
  const reference_images = prompt.reference_images !== undefined ? JSON.stringify(prompt.reference_images) : existing.reference_images ?? '[]'

  runQuery(`
    UPDATE prompts SET title = ?, content_zh = ?, content_en = ?, category = ?, tags = ?,
    collection_id = ?, is_favorite = ?, is_private = ?, reference_images = ?, updated_at = datetime('now')
    WHERE id = ?
  `, [
    title, content_zh, content_en, category, tags,
    collection_id, is_favorite, is_private, reference_images, id
  ])
  return true
})

ipcMain.handle('db:deletePrompt', (_, id) => {
  runQuery('DELETE FROM prompts WHERE id = ?', [id])
  return true
})

ipcMain.handle('db:toggleFavorite', (_, id) => {
  runQuery("UPDATE prompts SET is_favorite = NOT is_favorite, updated_at = datetime('now') WHERE id = ?", [id])
  return true
})

ipcMain.handle('db:getCollections', () => {
  return queryAll('SELECT * FROM collections ORDER BY name')
})

ipcMain.handle('db:createCollection', (_, collection) => {
  return runQuery(
    'INSERT INTO collections (name, description, icon, color) VALUES (?, ?, ?, ?)',
    [collection.name, collection.description, collection.icon || 'folder', collection.color || '#005bc1']
  ).lastInsertRowid
})

ipcMain.handle('db:updateCollection', (_, id, collection) => {
  runQuery(
    'UPDATE collections SET name = ?, description = ?, icon = ?, color = ?, updated_at = datetime(\'now\') WHERE id = ?',
    [collection.name, collection.description, collection.icon, collection.color, id]
  )
  return true
})

ipcMain.handle('db:deleteCollection', (_, id) => {
  runQuery('UPDATE prompts SET collection_id = NULL WHERE collection_id = ?', [id])
  runQuery('DELETE FROM collections WHERE id = ?', [id])
  return true
})

ipcMain.handle('db:getCategories', () => {
  return queryAll('SELECT DISTINCT category FROM prompts ORDER BY category')
})

ipcMain.handle('db:getStats', () => {
  const prompts = queryOne('SELECT COUNT(*) as count FROM prompts')
  const collections = queryOne('SELECT COUNT(*) as count FROM collections')
  const favorites = queryOne('SELECT COUNT(*) as count FROM prompts WHERE is_favorite = 1')
  return {
    prompts: prompts?.count || 0,
    collections: collections?.count || 0,
    favorites: favorites?.count || 0
  }
})

ipcMain.handle('db:getStoragePath', () => {
  return dbPath
})

ipcMain.handle('db:changeStoragePath', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openDirectory']
  })

  if (result.canceled || !result.filePaths[0]) return null

  const newDir = result.filePaths[0]
  const newPath = join(newDir, 'prompts.db')

  if (db) {
    const data = db.export()
    const buffer = Buffer.from(data)
    writeFileSync(newPath, buffer)
  }

  return { oldPath: dbPath, newPath }
})

ipcMain.handle('db:purgeAllData', async () => {
  if (!db) return false

  db.run('DELETE FROM prompts')
  db.run('DELETE FROM collections')
  db.run('DELETE FROM settings')
  saveDatabase()

  return true
})

ipcMain.handle('db:exportData', async () => {
  const result = await dialog.showSaveDialog(mainWindow!, {
    defaultPath: `prompts-export-${new Date().toISOString().split('T')[0]}.json`,
    filters: [{ name: 'JSON', extensions: ['json'] }]
  })

  if (result.canceled || !result.filePath) return null

  const prompts = queryAll('SELECT * FROM prompts')
  const collections = queryAll('SELECT * FROM collections')

  const data = { prompts, collections, exportedAt: new Date().toISOString() }

  writeFileSync(result.filePath, JSON.stringify(data, null, 2))

  return result.filePath
})

ipcMain.handle('db:importData', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    filters: [{ name: 'JSON', extensions: ['json'] }],
    properties: ['openFile']
  })

  if (result.canceled || !result.filePaths[0]) return null

  const content = readFileSync(result.filePaths[0], 'utf-8')
  const data = JSON.parse(content)

  if (data.collections) {
    for (const col of data.collections) {
      runQuery(
        'INSERT OR REPLACE INTO collections (id, name, description, icon, color) VALUES (?, ?, ?, ?, ?)',
        [col.id, col.name, col.description, col.icon, col.color]
      )
    }
  }

  if (data.prompts) {
    for (const prompt of data.prompts) {
      const content_zh = prompt.content_zh ?? prompt.content ?? ''
      const content_en = prompt.content_en ?? ''
      const category = prompt.category ?? 'Image Generation'
      const tags = typeof prompt.tags === 'string' ? prompt.tags : JSON.stringify(prompt.tags ?? [])
      const reference_images = typeof prompt.reference_images === 'string' ? prompt.reference_images : JSON.stringify(prompt.reference_images ?? [])
      const is_private = prompt.is_private ?? 1

      runQuery(`
        INSERT OR REPLACE INTO prompts (id, title, content_zh, content_en, category, tags, collection_id, is_favorite, is_private, reference_images, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        prompt.id, prompt.title, content_zh, content_en, category,
        tags, prompt.collection_id, prompt.is_favorite ? 1 : 0, is_private,
        reference_images, prompt.created_at, prompt.updated_at
      ])
    }
  }

  return data
})

// ==================== Auto Update ====================

function setupAutoUpdater() {
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true

  // 延迟检查更新，避免启动时卡顿
  const shouldAutoCheck = app.isPackaged && !process.env.DISABLE_AUTO_UPDATE

  autoUpdater.on('checking-for-update', () => {
    console.log('正在检查更新...')
  })

  autoUpdater.on('update-available', (info) => {
    console.log('发现新版本:', info.version)
    mainWindow?.webContents.send('update-available', {
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes
    })
  })

  // 应用启动后延迟检查更新（仅打包后的生产环境）
  if (shouldAutoCheck) {
    setTimeout(() => {
      console.log('执行自动更新检查...')
      autoUpdater.checkForUpdates().catch(err => {
        console.error('自动检查更新失败:', err)
      })
    }, 5000) // 延迟5秒，避免启动时网络拥堵
  }

  autoUpdater.on('update-not-available', () => {
    console.log('当前已是最新版本')
  })

  autoUpdater.on('error', (err) => {
    console.error('Update error:', err)
    mainWindow?.webContents.send('update-error', err.message)
  })

  autoUpdater.on('download-progress', (progress) => {
    mainWindow?.webContents.send('download-progress', {
      percent: progress.percent,
      transferred: progress.transferred,
      total: progress.total
    })
  })

  autoUpdater.on('update-downloaded', () => {
    mainWindow?.webContents.send('update-downloaded')
  })
}

// 语义化版本比较函数：如果 latest > current 返回 true
function isNewerVersion(latest: string, current: string): boolean {
  const normalize = (v: string) => v.replace(/^v/, '').split('.').map(Number)
  const latestParts = normalize(latest)
  const currentParts = normalize(current)

  for (let i = 0; i < Math.max(latestParts.length, currentParts.length); i++) {
    const l = latestParts[i] || 0
    const c = currentParts[i] || 0
    if (l > c) return true
    if (l < c) return false
  }
  return false
}

ipcMain.handle('check-for-updates', async () => {
  try {
    const result = await autoUpdater.checkForUpdates()
    if (result && result.updateInfo) {
      const currentVersion = app.getVersion()
      const latestVersion = result.updateInfo.version
      const hasUpdate = isNewerVersion(latestVersion, currentVersion)

      return {
        available: hasUpdate,
        version: latestVersion,
        currentVersion: currentVersion,
        releaseDate: result.updateInfo.releaseDate,
        releaseNotes: result.updateInfo.releaseNotes
      }
    }
    return { available: false }
  } catch (err) {
    console.error('检查更新失败:', err)
    const errorMessage = err instanceof Error ? err.message : String(err)

    // 区分不同类型的错误
    if (errorMessage.includes('404')) {
      return { available: false, error: '未找到更新配置，请检查网络连接' }
    }
    if (errorMessage.includes('401') || errorMessage.includes('403')) {
      return { available: false, error: 'GitHub API 访问受限，请稍后重试' }
    }
    if (errorMessage.includes('network') || errorMessage.includes('ECONNREFUSED')) {
      return { available: false, error: '网络连接失败，请检查网络设置' }
    }

    return { available: false, error: '检查更新失败: ' + errorMessage }
  }
})

ipcMain.handle('download-update', async () => {
  try {
    await autoUpdater.downloadUpdate()
    return { success: true }
  } catch (err) {
    console.error('Download update error:', err)
    return { success: false, error: String(err) }
  }
})

ipcMain.handle('quit-and-install', () => {
  autoUpdater.quitAndInstall(false, true)
})

setupAutoUpdater()

// ==================== Window Controls ====================

ipcMain.handle('window:minimize', () => {
  mainWindow?.minimize()
})

ipcMain.handle('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
  return mainWindow?.isMaximized()
})

ipcMain.handle('window:close', () => {
  mainWindow?.close()
})

ipcMain.handle('window:isMaximized', () => {
  return mainWindow?.isMaximized()
})

// ==================== SMTP 邮件发送 ====================

interface FeedbackData {
  type: string
  content: string
  contact: string
}

ipcMain.handle('send-feedback-email', async (_event, feedback: FeedbackData) => {
  // 从环境变量读取邮件配置，避免硬编码敏感信息
  const emailUser = process.env.EMAIL_USER
  const emailPass = process.env.EMAIL_PASS

  if (!emailUser || !emailPass) {
    console.error('邮件配置缺失：请设置 EMAIL_USER 和 EMAIL_PASS 环境变量')
    return { success: false, error: '邮件服务配置不完整' }
  }

  try {
    // 创建 SMTP 传输器
    // 使用 QQ 邮箱 SMTP 服务 (SSL 465端口)
    const transporter = nodemailer.createTransport({
      host: 'smtp.qq.com',
      port: 465,
      secure: true,
      auth: {
        user: emailUser,
        pass: emailPass
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000
    })

    const body = `[Promptly AI 用户反馈]

反馈类型: ${feedback.type.toUpperCase()}

反馈内容:
----------------------------------------
${feedback.content || '(未填写)'}
----------------------------------------

联系方式: ${feedback.contact || '未提供'}

发送时间: ${new Date().toLocaleString()}

---
此邮件由 Promptly AI 应用自动生成`

    const info = await transporter.sendMail({
      from: '"Promptly AI Feedback" <1666418635@qq.com>',
      to: '1666418635@qq.com',
      subject: `[${feedback.type.toUpperCase()}] Promptly AI Feedback`,
      text: body
    })

    return { success: true, messageId: info.messageId }
  } catch (error: any) {
    console.error('Failed to send feedback email:', error)

    // 友好的错误提示
    let errorMessage = '发送失败，请稍后重试'

    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' ||
        error.message?.includes('socket') || error.message?.includes('network')) {
      errorMessage = '网络连接失败，请检查网络或关闭 VPN 后重试（QQ 邮箱 SMTP 仅限中国大陆访问）'
    } else if (error.code === 'EAUTH') {
      errorMessage = '邮箱认证失败，请检查授权码配置'
    } else if (error.responseCode === 535) {
      errorMessage = '邮箱账号或授权码错误'
    }

    return { success: false, error: errorMessage }
  }
})
