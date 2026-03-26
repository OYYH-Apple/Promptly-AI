import { app, BrowserWindow, ipcMain, dialog, protocol } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'fs'
import { randomUUID } from 'crypto'
import { promises as fsPromises } from 'fs'
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
const videosDir = join(userDataPath, 'videos')

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
          reference_videos TEXT DEFAULT '[]',
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Migrate data from old table
      const hasIsPrivate = columns.includes('is_private')
      db.run(`
        INSERT INTO prompts_new (id, title, content_zh, content_en, category, tags, collection_id, is_favorite, is_private, reference_images, reference_videos, created_at, updated_at)
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
          COALESCE(reference_videos, '[]'),
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
        reference_videos TEXT DEFAULT '[]',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)
  }

  // 增量迁移：为已有新 schema 但缺少 reference_videos 列的数据库补充该列
  const columnsAfterMigration = db.exec("PRAGMA table_info(prompts)")
  if (columnsAfterMigration.length > 0) {
    const existingColumnNames = columnsAfterMigration[0].values.map((col: any) => col[1])
    if (!existingColumnNames.includes('reference_videos')) {
      db.run('ALTER TABLE prompts ADD COLUMN reference_videos TEXT DEFAULT "[]"')
      console.log('增量迁移：已添加 reference_videos 列')
    }
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

  // 确保视频存储目录存在
  if (!existsSync(videosDir)) {
    mkdirSync(videosDir, { recursive: true })
  }

  createWindow()

  // ==================== 注册视频自定义协议 ====================
  // 用途：绕过 Electron 安全限制，允许渲染进程播放本地视频文件
  // 注意：Windows 路径需处理中文编码问题
  protocol.registerFileProtocol('app-video', (request, callback) => {
    const url = request.url.replace('app-video://', '')
    // URL 解码处理中文路径
    const decodedPath = decodeURIComponent(url)
    callback({ path: decodedPath })
  })

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

ipcMain.handle('db:getPrompts', (_, { category, search, favorites, collectionId, limit, offset, sortBy, sortOrder }) => {
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

  // 排序：支持按更新时间、创建时间、标题排序（白名单校验防止 SQL 注入）
  const validSortColumns = ['updated_at', 'created_at', 'title']
  const validSortOrders = ['ASC', 'DESC']
  const safeSortBy = validSortColumns.includes(sortBy) ? sortBy : 'updated_at'
  const safeSortOrder = validSortOrders.includes(sortOrder?.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC'
  sql += ` ORDER BY ${safeSortBy} ${safeSortOrder}`

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
    INSERT INTO prompts (title, content_zh, content_en, category, tags, collection_id, is_favorite, is_private, reference_images, reference_videos)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    prompt.title,
    prompt.content_zh || '',
    prompt.content_en || '',
    prompt.category || 'Image Generation',
    JSON.stringify(prompt.tags || []),
    prompt.collection_id || null,
    prompt.is_favorite ? 1 : 0,
    prompt.is_private ? 1 : 0,
    JSON.stringify(prompt.reference_images || []),
    JSON.stringify(prompt.reference_videos || [])
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
  const reference_videos = prompt.reference_videos !== undefined ? JSON.stringify(prompt.reference_videos) : existing.reference_videos ?? '[]'

  runQuery(`
    UPDATE prompts SET title = ?, content_zh = ?, content_en = ?, category = ?, tags = ?,
    collection_id = ?, is_favorite = ?, is_private = ?, reference_images = ?, reference_videos = ?, updated_at = datetime('now')
    WHERE id = ?
  `, [
    title, content_zh, content_en, category, tags,
    collection_id, is_favorite, is_private, reference_images, reference_videos, id
  ])
  return true
})

ipcMain.handle('db:deletePrompt', (_, id) => {
  runQuery('DELETE FROM prompts WHERE id = ?', [id])
  return true
})

// ==================== 批量操作 IPC 处理器 ====================

/**
 * 批量更新多个提示词
 * 使用事务确保数据一致性
 */
ipcMain.handle('db:batchUpdatePrompts', (_, { ids, updates }: { ids: number[]; updates: any }) => {
  if (!db || ids.length === 0) return false

  try {
    // 开始事务
    db.run('BEGIN TRANSACTION')

    for (const id of ids) {
      const existing = queryOne('SELECT * FROM prompts WHERE id = ?', [id])
      if (!existing) continue

      const title = updates.title ?? existing.title
      const content_zh = updates.content_zh ?? existing.content_zh ?? ''
      const content_en = updates.content_en ?? existing.content_en ?? ''
      const category = updates.category ?? existing.category ?? 'Image Generation'
      const tags = updates.tags !== undefined ? JSON.stringify(updates.tags) : existing.tags ?? '[]'
      const collection_id = updates.collection_id !== undefined ? updates.collection_id : existing.collection_id
      const is_favorite = updates.is_favorite !== undefined ? (updates.is_favorite ? 1 : 0) : existing.is_favorite
      const is_private = updates.is_private !== undefined ? (updates.is_private ? 1 : 0) : existing.is_private
      const reference_images = updates.reference_images !== undefined ? JSON.stringify(updates.reference_images) : existing.reference_images ?? '[]'
      const reference_videos = updates.reference_videos !== undefined ? JSON.stringify(updates.reference_videos) : existing.reference_videos ?? '[]'

      db.run(`
        UPDATE prompts SET title = ?, content_zh = ?, content_en = ?, category = ?, tags = ?,
        collection_id = ?, is_favorite = ?, is_private = ?, reference_images = ?, reference_videos = ?, updated_at = datetime('now')
        WHERE id = ?
      `, [
        title, content_zh, content_en, category, tags,
        collection_id, is_favorite, is_private, reference_images, reference_videos, id
      ])
    }

    // 提交事务
    db.run('COMMIT')
    saveDatabase()
    return true
  } catch (error) {
    // 发生错误时回滚事务
    db.run('ROLLBACK')
    console.error('批量更新提示词失败:', error)
    return false
  }
})

/**
 * 批量删除多个提示词
 * 包含关联视频文件的清理
 */
ipcMain.handle('db:batchDeletePrompts', async (_, ids: number[]) => {
  if (!db || ids.length === 0) return false

  try {
    // 先获取所有要删除的提示词，清理关联的视频文件
    const promptsToDelete: any[] = []
    for (const id of ids) {
      const prompt = queryOne('SELECT * FROM prompts WHERE id = ?', [id])
      if (prompt) {
        promptsToDelete.push(prompt)
      }
    }

    // 清理视频文件
    for (const prompt of promptsToDelete) {
      const videoPaths: string[] = (() => {
        try {
          return JSON.parse(prompt.reference_videos || '[]')
        } catch {
          return []
        }
      })()

      for (const videoPath of videoPaths) {
        try {
          const normalizedPath = join(videoPath)
          if (normalizedPath.startsWith(videosDir) && existsSync(normalizedPath)) {
            await fsPromises.unlink(normalizedPath)
          }
        } catch (err) {
          console.error('删除视频文件失败:', videoPath, err)
        }
      }
    }

    // 开始事务删除数据库记录
    db.run('BEGIN TRANSACTION')

    for (const id of ids) {
      db.run('DELETE FROM prompts WHERE id = ?', [id])
    }

    db.run('COMMIT')
    saveDatabase()
    return true
  } catch (error) {
    db.run('ROLLBACK')
    console.error('批量删除提示词失败:', error)
    return false
  }
})

// ==================== 视频文件操作 ====================

ipcMain.handle('file:saveVideo', async (_, { fileName, filePath: sourcePath }: { fileName: string; filePath: string }) => {
  // 使用 UUID 生成唯一文件名，避免同名碰撞
  const fileExtension = fileName.includes('.') ? fileName.substring(fileName.lastIndexOf('.')) : '.mp4'
  const uniqueName = `${randomUUID()}${fileExtension}`
  const destPath = join(videosDir, uniqueName)

  // 直接复制文件，避免将整个视频加载到内存
  await fsPromises.copyFile(sourcePath, destPath)
  return destPath
})

ipcMain.handle('file:deleteVideo', async (_, filePath: string) => {
  try {
    // 安全校验：仅允许删除 videosDir 内的文件，防止路径穿越攻击
    const normalizedPath = join(filePath)
    if (!normalizedPath.startsWith(videosDir)) {
      console.error('视频删除被拒绝：路径不在允许范围内', normalizedPath)
      return false
    }

    if (existsSync(normalizedPath)) {
      await fsPromises.unlink(normalizedPath)
      return true
    }
    return false
  } catch (error) {
    console.error('删除视频文件失败:', error)
    return false
  }
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

// ==================== 设置项读写 ====================

ipcMain.handle('db:getSetting', (_, key: string) => {
  const row = queryOne('SELECT value FROM settings WHERE key = ?', [key])
  return row?.value ?? null
})

ipcMain.handle('db:setSetting', (_, key: string, value: string) => {
  runQuery('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value])
  return true
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

  // 收集并导出视频文件
  const exportDir = join(result.filePath, '..')
  const exportVideosDir = join(exportDir, 'videos')
  let hasVideos = false

  const exportPrompts = prompts.map((p: any) => {
    const videoPathList: string[] = (() => {
      try {
        return JSON.parse(p.reference_videos || '[]')
      } catch {
        return []
      }
    })()

    if (videoPathList.length === 0) return p

    // 确保导出视频目录存在
    if (!hasVideos) {
      if (!existsSync(exportVideosDir)) {
        mkdirSync(exportVideosDir, { recursive: true })
      }
      hasVideos = true
    }

    // 复制视频文件并替换为相对路径
    const exportedVideoPaths = videoPathList.map((videoPath: string) => {
      try {
        if (existsSync(videoPath)) {
          const videoFileName = videoPath.split(/[\\/]/).pop() || ''
          const destPath = join(exportVideosDir, videoFileName)
          copyFileSync(videoPath, destPath)
          return `./videos/${videoFileName}`
        }
      } catch (err) {
        console.error('导出视频文件失败:', videoPath, err)
      }
      return videoPath
    })

    return { ...p, reference_videos: JSON.stringify(exportedVideoPaths) }
  })

  const data = { prompts: exportPrompts, collections, exportedAt: new Date().toISOString() }
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

  // 检查导入文件同目录是否存在 videos 文件夹
  const importDir = join(result.filePaths[0], '..')
  const importVideosDir = join(importDir, 'videos')
  const hasImportVideos = existsSync(importVideosDir)

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

      // 处理视频文件的导入：将相对路径的视频复制到本地 videosDir 并更新路径
      let reference_videos: string
      const rawVideos: string[] = (() => {
        try {
          const parsed = typeof prompt.reference_videos === 'string'
            ? JSON.parse(prompt.reference_videos || '[]')
            : (prompt.reference_videos ?? [])
          return Array.isArray(parsed) ? parsed : []
        } catch {
          return []
        }
      })()

      if (hasImportVideos && rawVideos.length > 0) {
        const restoredPaths = rawVideos.map((videoPath: string) => {
          // 检查是否为相对路径（导出格式）
          if (videoPath.startsWith('./videos/')) {
            const videoFileName = videoPath.replace('./videos/', '')
            const sourcePath = join(importVideosDir, videoFileName)
            if (existsSync(sourcePath)) {
              // 使用 UUID 重命名避免碰撞
              const ext = videoFileName.includes('.') ? videoFileName.substring(videoFileName.lastIndexOf('.')) : '.mp4'
              const newFileName = `${randomUUID()}${ext}`
              const destPath = join(videosDir, newFileName)
              copyFileSync(sourcePath, destPath)
              return destPath
            }
          }
          return videoPath
        })
        reference_videos = JSON.stringify(restoredPaths)
      } else {
        reference_videos = JSON.stringify(rawVideos)
      }

      runQuery(`
        INSERT OR REPLACE INTO prompts (id, title, content_zh, content_en, category, tags, collection_id, is_favorite, is_private, reference_images, reference_videos, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        prompt.id, prompt.title, content_zh, content_en, category,
        tags, prompt.collection_id, prompt.is_favorite ? 1 : 0, is_private,
        reference_images, reference_videos, prompt.created_at, prompt.updated_at
      ])
    }
  }

  return data
})

// ==================== Auto Update ====================

// ==================== 更新状态持久化 ====================

interface UpdatePersistState {
  pendingUpdateVersion: string | null      // 已下载待安装的版本号
  pendingReleaseNotes: string | null       // 待安装版本的更新日志
  lastInstallAttemptFailed: boolean        // 上次安装是否失败
  lastInstallAttemptTime: string | null    // 上次安装尝试时间（ISO 字符串）
  ignoredVersion: string | null            // 用户选择忽略的版本号
}

const UPDATE_STATE_FILE = join(app.getPath('userData'), 'update-state.json')

function readUpdateState(): UpdatePersistState {
  // 默认状态
  const defaultState: UpdatePersistState = {
    pendingUpdateVersion: null,
    pendingReleaseNotes: null,
    lastInstallAttemptFailed: false,
    lastInstallAttemptTime: null,
    ignoredVersion: null
  }
  try {
    if (existsSync(UPDATE_STATE_FILE)) {
      const raw = readFileSync(UPDATE_STATE_FILE, 'utf-8')
      return { ...defaultState, ...JSON.parse(raw) }
    }
  } catch (err) {
    console.error('读取更新状态文件失败:', err)
  }
  return defaultState
}

function writeUpdateState(partialState: Partial<UpdatePersistState>): void {
  try {
    const currentState = readUpdateState()
    const newState = { ...currentState, ...partialState }
    writeFileSync(UPDATE_STATE_FILE, JSON.stringify(newState, null, 2), 'utf-8')
  } catch (err) {
    console.error('写入更新状态文件失败:', err)
  }
}

function clearUpdateState(): void {
  try {
    if (existsSync(UPDATE_STATE_FILE)) {
      writeFileSync(UPDATE_STATE_FILE, JSON.stringify({
        pendingUpdateVersion: null,
        pendingReleaseNotes: null,
        lastInstallAttemptFailed: false,
        lastInstallAttemptTime: null,
        ignoredVersion: null
      }, null, 2), 'utf-8')
    }
  } catch (err) {
    console.error('清理更新状态文件失败:', err)
  }
}

// ==================== 竞态防护 ====================

// 防止检查更新、下载更新、安装更新三个操作并发执行
let isUpdateOperationInProgress = false

// ==================== 更新文件格式配置 ====================

// 定义多种可能的文件名格式，按优先级排序
const POSSIBLE_ARTIFACT_PATTERNS = [
  // 点号格式 (当前使用)
  { setup: 'Promptly.AI.Setup.${version}.exe', portable: 'Promptly.AI.${version}.exe' },
  // 横线格式 (旧版本兼容)
  { setup: 'Promptly-AI-Setup-${version}.exe', portable: 'Promptly-AI-${version}.exe' },
  // 空格格式 (备选)
  { setup: 'Promptly AI Setup ${version}.exe', portable: 'Promptly AI ${version}.exe' },
]

// 当前尝试的文件名格式索引
let currentArtifactIndex = 0
let lastUpdateInfo: any = null

// ==================== 启动恢复检查 ====================

// 启动时检查是否有待恢复的更新
// 返回 true 表示有待恢复的失败更新（已通知渲染进程），调用方应跳过后续自动检查
async function checkPendingUpdateOnStartup(): Promise<boolean> {
  const updateState = readUpdateState()

  // 如果没有待处理的更新版本，直接返回
  if (!updateState.pendingUpdateVersion) return false

  const currentVersion = app.getVersion()

  // 如果当前版本已经 >= 待安装版本，说明更新已成功安装，清理状态
  if (!isNewerVersion(updateState.pendingUpdateVersion, currentVersion)) {
    console.log('更新已成功安装，清理旧的更新状态')
    clearUpdateState()
    return false
  }

  // 如果用户已忽略该版本，跳过
  if (updateState.ignoredVersion === updateState.pendingUpdateVersion) {
    console.log('用户已忽略版本:', updateState.ignoredVersion)
    return false
  }

  // 如果上次安装失败，通知渲染进程显示恢复提示
  if (updateState.lastInstallAttemptFailed) {
    console.log('检测到上次更新安装失败，通知渲染进程:', updateState.pendingUpdateVersion)
    // 等待主窗口加载完成后再发送通知
    const notifyRenderer = () => {
      mainWindow?.webContents.send('update-install-failed-recovery', {
        version: updateState.pendingUpdateVersion,
        releaseNotes: updateState.pendingReleaseNotes,
        lastAttemptTime: updateState.lastInstallAttemptTime
      })
    }
    // 如果窗口已加载则直接通知，否则等待加载完成
    if (mainWindow?.webContents.isLoading()) {
      mainWindow.webContents.once('did-finish-load', notifyRenderer)
    } else {
      // 延迟一下确保渲染进程已完成初始化
      setTimeout(notifyRenderer, 2000)
    }
    // 有待恢复的失败更新，返回 true 跳过后续自动检查，避免重复弹框
    return true
  }

  // 存在已下载但未安装的更新（非失败状态），说明可能用户选择了"稍后"
  // 不做额外处理，让正常的自动检查流程接管
  console.log('存在已下载待安装的更新:', updateState.pendingUpdateVersion)
  return false
}

// ==================== 核心更新逻辑 ====================

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
    // 保存更新信息用于多格式重试
    lastUpdateInfo = info
    currentArtifactIndex = 0 // 重置索引
    mainWindow?.webContents.send('update-available', {
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes
    })
  })

  autoUpdater.on('update-not-available', () => {
    console.log('当前已是最新版本')
  })

  autoUpdater.on('error', (err) => {
    console.error('Update error:', err)
    // 检查是否是下载文件不存在错误
    const errorMessage = err.message || String(err)
    if (errorMessage.includes('404') || errorMessage.includes('Cannot download')) {
      // 尝试下一个文件名格式
      tryNextArtifactFormat(errorMessage)
    } else {
      mainWindow?.webContents.send('update-error', err.message)
    }
  })

  autoUpdater.on('download-progress', (progress) => {
    mainWindow?.webContents.send('download-progress', {
      percent: progress.percent,
      transferred: progress.transferred,
      total: progress.total
    })
  })

  autoUpdater.on('update-downloaded', (info) => {
    // 重置索引
    currentArtifactIndex = 0
    // 记录已下载的更新版本，以便安装失败后重启时恢复
    writeUpdateState({
      pendingUpdateVersion: info.version,
      pendingReleaseNotes: typeof info.releaseNotes === 'string' ? info.releaseNotes : Array.isArray(info.releaseNotes) ? info.releaseNotes.map(n => typeof n === 'string' ? n : n.note).join('\n') : null,
      lastInstallAttemptFailed: false,
      lastInstallAttemptTime: null
    })
    mainWindow?.webContents.send('update-downloaded')
  })

  // 应用启动后延迟检查更新（仅打包后的生产环境）
  if (shouldAutoCheck) {
    setTimeout(async () => {
      // 先检查是否有上次安装失败的待恢复更新
      const hasPendingRecovery = await checkPendingUpdateOnStartup()

      // 有待恢复更新时，不再做普通自动检查，避免重复弹框
      if (hasPendingRecovery) return

      // 执行常规的自动更新检查（带竞态防护）
      if (!isUpdateOperationInProgress) {
        isUpdateOperationInProgress = true
        console.log('执行自动更新检查...')
        autoUpdater.checkForUpdates().catch(err => {
          console.error('自动检查更新失败:', err)
        }).finally(() => {
          isUpdateOperationInProgress = false
        })
      }
    }, 5000) // 延迟5秒，避免启动时网络拥堵
  }
}

// 尝试下一个文件名格式
function tryNextArtifactFormat(errorMessage: string) {
  currentArtifactIndex++
  if (currentArtifactIndex < POSSIBLE_ARTIFACT_PATTERNS.length) {
    console.log(`尝试下一个文件名格式 (${currentArtifactIndex + 1}/${POSSIBLE_ARTIFACT_PATTERNS.length})...`)
    // 重新触发下载，使用新的文件名格式
    if (lastUpdateInfo) {
      downloadUpdateWithFormat(lastUpdateInfo, currentArtifactIndex)
    }
  } else {
    // 所有格式都尝试过，发送错误消息
    console.error('所有文件名格式都尝试失败')
    currentArtifactIndex = 0 // 重置索引
    mainWindow?.webContents.send('update-error', '无法找到更新文件，请检查网络连接或稍后重试')
  }
}

// 使用指定格式下载更新
async function downloadUpdateWithFormat(updateInfo: any, formatIndex: number) {
  try {
    const pattern = POSSIBLE_ARTIFACT_PATTERNS[formatIndex]
    const version = updateInfo.version
    const setupFileName = pattern.setup.replace('${version}', version)

    console.log(`尝试下载: ${setupFileName}`)

    // 使用 generic provider 配合自定义 URL 来支持多格式
    // 定义 feed 配置对象，符合 electron-updater 的 generic provider 格式
    const feedOptions = {
      provider: 'generic' as const,
      url: `https://github.com/OYYH-Apple/Promptly-AI/releases/download/v${version}/`,
      channel: 'latest'
    }
    autoUpdater.setFeedURL(feedOptions)

    // 开始下载
    await autoUpdater.downloadUpdate()
  } catch (err) {
    console.error(`格式 ${formatIndex + 1} 下载失败:`, err)
    tryNextArtifactFormat(String(err))
  }
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

// ==================== IPC Handlers ====================

// 获取应用当前版本号
ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

ipcMain.handle('check-for-updates', async () => {
  // 竞态防护：如果有其他更新操作正在进行，直接返回
  if (isUpdateOperationInProgress) {
    return { available: false, error: '更新操作正在进行中，请稍后重试' }
  }

  isUpdateOperationInProgress = true
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
  } finally {
    isUpdateOperationInProgress = false
  }
})

ipcMain.handle('download-update', async () => {
  // 竞态防护：如果有其他更新操作正在进行，直接返回
  if (isUpdateOperationInProgress) {
    return { success: false, error: '更新操作正在进行中，请稍后重试' }
  }

  isUpdateOperationInProgress = true
  try {
    await autoUpdater.downloadUpdate()
    return { success: true }
  } catch (err) {
    console.error('下载更新失败:', err)
    return { success: false, error: String(err) }
  } finally {
    isUpdateOperationInProgress = false
  }
})

ipcMain.handle('quit-and-install', () => {
  try {
    // 标记安装尝试，便于安装失败后恢复
    // 注意：在调用 quitAndInstall 之前写入，这样即使进程被终止也能检测到失败状态
    // 如果安装成功，下次启动时 checkPendingUpdateOnStartup 会发现版本已更新，自动清理状态
    writeUpdateState({
      lastInstallAttemptFailed: true,
      lastInstallAttemptTime: new Date().toISOString()
    })

    autoUpdater.quitAndInstall(false, true)
  } catch (err) {
    console.error('执行安装更新失败:', err)
    // 通知渲染进程安装失败
    mainWindow?.webContents.send('update-install-failed', {
      error: err instanceof Error ? err.message : String(err)
    })
    return { success: false, error: String(err) }
  }
})

// 清理更新缓存（供用户在更新反复失败时手动使用）
ipcMain.handle('clear-update-cache', () => {
  try {
    clearUpdateState()
    return { success: true }
  } catch (err) {
    console.error('清理更新缓存失败:', err)
    return { success: false, error: String(err) }
  }
})

// 查询当前更新状态（供渲染进程启动时恢复检查）
ipcMain.handle('get-update-state', () => {
  return readUpdateState()
})

// 忽略指定版本的更新
ipcMain.handle('ignore-update-version', (_event, version: string) => {
  writeUpdateState({ ignoredVersion: version })
  return { success: true }
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
