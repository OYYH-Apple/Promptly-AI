// ==================== 依赖引入 ====================
import ffmpeg from 'fluent-ffmpeg'
import ffmpegStatic from 'ffmpeg-static'
import { join, dirname, basename, extname } from 'path'
import { existsSync } from 'fs'
import { mkdir, unlink } from 'fs/promises'
import { app } from 'electron'

// ==================== 常量定义 ====================
// 默认截图时间点（视频开始后1秒，避免黑屏帧）
const DEFAULT_THUMBNAIL_TIME = '00:00:01'
// 默认缩略图宽度
const DEFAULT_THUMBNAIL_WIDTH = 320
// 默认缩略图高度（-1 表示保持原始比例）
const DEFAULT_THUMBNAIL_HEIGHT = -1
// 缩略图文件后缀
const THUMBNAIL_SUFFIX = '.thumb.jpg'

// ==================== FFmpeg 路径设置 ====================
/**
 * 获取 ffmpeg 可执行文件路径
 * 开发环境使用 ffmpeg-static，生产环境使用打包后的路径
 */
function getFfmpegPath(): string {
  // 开发环境：使用 ffmpeg-static
  if (ffmpegStatic && existsSync(ffmpegStatic)) {
    return ffmpegStatic
  }
  
  // 生产环境：尝试多种路径
  const possiblePaths = [
    // electron-builder 打包后的路径
    join(process.resourcesPath || '', 'ffmpeg.exe'),
    join(app.getAppPath(), '..', 'ffmpeg.exe'),
    join(dirname(process.execPath), 'ffmpeg.exe'),
    // 环境变量中的 ffmpeg
    'ffmpeg',
  ]
  
  for (const path of possiblePaths) {
    if (path === 'ffmpeg' || existsSync(path)) {
      return path
    }
  }
  
  // 兜底：返回 ffmpeg 命令，依赖系统 PATH
  return 'ffmpeg'
}

// 设置 ffmpeg 可执行文件路径
const ffmpegPath = getFfmpegPath()
console.log('[FFmpeg] 使用路径:', ffmpegPath)
ffmpeg.setFfmpegPath(ffmpegPath)

// ==================== 类型定义 ====================
/**
 * 缩略图生成选项
 */
export interface ThumbnailOptions {
  /** 视频文件路径 */
  videoPath: string
  /** 截图时间点，格式为 HH:MM:SS 或秒数，默认 '00:00:01' */
  time?: string
  /** 缩略图宽度（像素），默认 320 */
  width?: number
  /** 缩略图高度（像素），默认 -1 表示保持原始比例 */
  height?: number
}

// ==================== 核心业务逻辑 ====================
/**
 * 生成视频缩略图
 * @param options - 缩略图生成选项
 * @returns 缩略图文件的绝对路径
 * @throws 当视频文件不存在或 ffmpeg 处理失败时抛出错误
 */
export async function generateThumbnail(options: ThumbnailOptions): Promise<string> {
  const {
    videoPath,
    time = DEFAULT_THUMBNAIL_TIME,
    width = DEFAULT_THUMBNAIL_WIDTH,
    height = DEFAULT_THUMBNAIL_HEIGHT,
  } = options

  // 校验视频文件是否存在
  if (!existsSync(videoPath)) {
    throw new Error(`视频文件不存在: ${videoPath}`)
  }

  // 构建缩略图输出路径
  const videoDir = dirname(videoPath)
  const videoNameWithoutExt = basename(videoPath, extname(videoPath))
  const thumbnailPath = join(videoDir, `${videoNameWithoutExt}${THUMBNAIL_SUFFIX}`)

  // 确保输出目录存在
  if (!existsSync(videoDir)) {
    await mkdir(videoDir, { recursive: true })
  }

  // 使用 ffmpeg 生成缩略图
  return new Promise((resolve, reject) => {
    // 构建尺寸参数：height 为 -1 时使用 '?' 保持比例
    const sizeParam = `${width}x${height > 0 ? height : '?'}`

    ffmpeg(videoPath)
      .screenshots({
        timestamps: [time],
        filename: `${videoNameWithoutExt}${THUMBNAIL_SUFFIX}`,
        folder: videoDir,
        size: sizeParam,
      })
      .on('end', () => {
        resolve(thumbnailPath)
      })
      .on('error', (error: Error) => {
        reject(new Error(`生成缩略图失败: ${error.message}`))
      })
  })
}

/**
 * 获取视频缩略图路径（如果不存在则自动生成）
 * @param videoPath - 视频文件路径
 * @returns 缩略图路径，如果视频不存在或生成失败则返回 null
 */
export async function getOrGenerateThumbnail(videoPath: string): Promise<string | null> {
  // 校验视频文件是否存在
  if (!existsSync(videoPath)) {
    return null
  }

  // 构建缩略图路径
  const videoDir = dirname(videoPath)
  const videoNameWithoutExt = basename(videoPath, extname(videoPath))
  const thumbnailPath = join(videoDir, `${videoNameWithoutExt}${THUMBNAIL_SUFFIX}`)

  // 缩略图已存在，直接返回路径
  if (existsSync(thumbnailPath)) {
    return thumbnailPath
  }

  // 缩略图不存在，尝试生成
  try {
    return await generateThumbnail({ videoPath })
  } catch (error) {
    // 记录错误但不抛出，返回 null 表示获取失败
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`获取缩略图失败 [${videoPath}]:`, errorMessage)
    return null
  }
}

/**
 * 删除视频关联的缩略图文件
 * @param videoPath - 视频文件路径
 * @throws 当删除操作失败时抛出错误
 */
export async function deleteThumbnail(videoPath: string): Promise<void> {
  // 校验视频文件是否存在（用于定位缩略图所在目录）
  if (!existsSync(videoPath)) {
    return
  }

  // 构建缩略图路径
  const videoDir = dirname(videoPath)
  const videoNameWithoutExt = basename(videoPath, extname(videoPath))
  const thumbnailPath = join(videoDir, `${videoNameWithoutExt}${THUMBNAIL_SUFFIX}`)

  // 缩略图存在则删除
  if (existsSync(thumbnailPath)) {
    try {
      await unlink(thumbnailPath)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      throw new Error(`删除缩略图失败 [${thumbnailPath}]: ${errorMessage}`)
    }
  }
}

// ==================== 导出内容 ====================
// 所有功能已通过命名导出提供
