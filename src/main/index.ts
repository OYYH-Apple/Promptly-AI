import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import type { Database, SqlJsStatic } from 'sql.js'

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
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    show: false
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
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
    sql += ' AND (title LIKE ? OR content LIKE ?)'
    params.push(`%${search}%`, `%${search}%`)
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
  runQuery(`
    UPDATE prompts SET title = ?, content_zh = ?, content_en = ?, category = ?, tags = ?,
    collection_id = ?, is_favorite = ?, is_private = ?, reference_images = ?, updated_at = datetime('now')
    WHERE id = ?
  `, [
    prompt.title,
    prompt.content_zh || '',
    prompt.content_en || '',
    prompt.category,
    JSON.stringify(prompt.tags),
    prompt.collection_id,
    prompt.is_favorite ? 1 : 0,
    prompt.is_private ? 1 : 0,
    JSON.stringify(prompt.reference_images),
    id
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
      runQuery(`
        INSERT OR REPLACE INTO prompts (id, title, content, category, tags, collection_id, is_favorite, reference_images, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        prompt.id, prompt.title, prompt.content, prompt.category,
        prompt.tags, prompt.collection_id, prompt.is_favorite,
        prompt.reference_images, prompt.created_at, prompt.updated_at
      ])
    }
  }

  return data
})
