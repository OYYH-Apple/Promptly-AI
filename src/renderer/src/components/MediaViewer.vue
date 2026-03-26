<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="visible"
        ref="containerRef"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm overflow-hidden"
        @click="close"
        @wheel.prevent="handleWheel"
        @mousedown="startDrag"
        @mousemove="onDrag"
        @mouseup="endDrag"
        @mouseleave="endDrag"
      >
        <!-- 图片显示区域 -->
        <div
          v-if="currentMediaType === 'image'"
          class="relative flex items-center justify-center"
          :style="mediaWrapperStyle"
        >
          <img
            ref="imageRef"
            :src="currentMediaUrl"
            :alt="alt"
            class="rounded-lg shadow-2xl select-none"
            :style="imageStyle"
            @click.stop
            @load="onMediaLoad"
            draggable="false"
          />
        </div>

        <!-- 视频显示区域 -->
        <div
          v-else-if="currentMediaType === 'video'"
          class="relative flex items-center justify-center"
          :style="mediaWrapperStyle"
          @click.stop
        >
          <video
            ref="videoRef"
            :src="currentMediaUrl"
            class="rounded-lg shadow-2xl select-none max-w-[90vw] max-h-[90vh]"
            controls
            autoplay
            @loadedmetadata="onMediaLoad"
          ></video>
        </div>

        <!-- 关闭按钮 -->
        <button
          @click.stop="close"
          class="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
        >
          <span class="material-symbols-outlined">close</span>
        </button>

        <!-- 缩放重置按钮（仅图片显示） -->
        <button
          v-if="currentMediaType === 'image'"
          @click.stop="resetZoom"
          class="absolute top-4 left-4 px-3 h-10 flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-full text-white text-sm font-medium transition-colors z-10"
        >
          <span class="material-symbols-outlined text-lg">fit_screen</span>
          {{ Math.round(scale * 100) }}%
        </button>

        <!-- 上一页按钮 -->
        <button
          v-if="showNavigation && currentIndex > 0"
          @click.stop="prev"
          class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
        >
          <span class="material-symbols-outlined">arrow_back_ios_new</span>
        </button>

        <!-- 下一页按钮 -->
        <button
          v-if="showNavigation && currentIndex < totalMediaCount - 1"
          @click.stop="next"
          class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
        >
          <span class="material-symbols-outlined">arrow_forward_ios</span>
        </button>

        <!-- 底部信息栏：页码 + 类型指示器 -->
        <div
          v-if="showNavigation"
          class="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3"
        >
          <!-- 媒体类型标签 -->
          <div class="px-3 py-1.5 bg-black/60 rounded-full text-white text-xs font-medium flex items-center gap-1.5">
            <span class="material-symbols-outlined text-sm">
              {{ currentMediaType === 'image' ? 'image' : 'videocam' }}
            </span>
            {{ currentMediaType === 'image' ? '图片' : '视频' }}
          </div>
          <!-- 页码指示器 -->
          <div class="px-4 py-1.5 bg-black/60 rounded-full text-white text-sm font-medium">
            {{ currentIndex + 1 }} / {{ totalMediaCount }}
          </div>
        </div>

        <!-- 图片缩放控制按钮（仅图片显示） -->
        <div
          v-if="currentMediaType === 'image'"
          class="absolute bottom-4 right-4 flex gap-2 z-10"
        >
          <button
            @click.stop="zoomOut"
            class="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <span class="material-symbols-outlined">remove</span>
          </button>
          <button
            @click.stop="zoomIn"
            class="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <span class="material-symbols-outlined">add</span>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
// ==================== 依赖引入 ====================
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

// ==================== 类型定义 ====================
/**
 * 媒体类型
 */
type MediaType = 'image' | 'video'

/**
 * 媒体项结构
 */
interface MediaItem {
  url: string
  type: MediaType
}

// ==================== Props 定义 ====================
interface Props {
  /** 是否可见 */
  visible: boolean
  /** 图片路径数组（向后兼容） */
  images?: string[]
  /** 视频路径数组 */
  videos?: string[]
  /** 初始索引 */
  initialIndex?: number
  /** 图片 alt 文本 */
  alt?: string
}

const props = withDefaults(defineProps<Props>(), {
  images: () => [],
  videos: () => [],
  initialIndex: 0,
  alt: ''
})

// ==================== Emits 定义 ====================
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'close'): void
}>()

// ==================== 常量定义 ====================
/** 最小缩放比例 */
const MIN_SCALE = 0.5
/** 最大缩放比例 */
const MAX_SCALE = 5
/** 缩放步长 */
const SCALE_STEP = 0.15

// ==================== 响应式状态 ====================
const containerRef = ref<HTMLElement | null>(null)
const imageRef = ref<HTMLImageElement | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)
const currentIndex = ref(props.initialIndex)
const scale = ref(1)
const translateX = ref(0)
const translateY = ref(0)
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)
const dragStartTranslateX = ref(0)
const dragStartTranslateY = ref(0)

// ==================== 计算属性 ====================
/**
 * 所有媒体项列表（图片 + 视频合并）
 */
const allMediaItems = computed<MediaItem[]>(() => {
  const items: MediaItem[] = []
  // 先添加所有图片
  props.images.forEach(url => {
    items.push({ url, type: 'image' })
  })
  // 再添加所有视频
  props.videos.forEach(url => {
    items.push({ url, type: 'video' })
  })
  return items
})

/**
 * 当前媒体项
 */
const currentMediaItem = computed<MediaItem | null>(() => {
  return allMediaItems.value[currentIndex.value] || null
})

/**
 * 当前媒体 URL
 */
const currentMediaUrl = computed(() => {
  return currentMediaItem.value?.url || ''
})

/**
 * 当前媒体类型
 */
const currentMediaType = computed<MediaType>(() => {
  return currentMediaItem.value?.type || 'image'
})

/**
 * 媒体总数
 */
const totalMediaCount = computed(() => allMediaItems.value.length)

/**
 * 是否显示导航按钮
 */
const showNavigation = computed(() => totalMediaCount.value > 1)

/**
 * 图片样式（包含缩放和拖拽变换）
 */
const imageStyle = computed(() => ({
  transform: `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`,
  transition: isDragging.value ? 'none' : 'transform 0.15s ease-out',
  maxWidth: '90vw',
  maxHeight: '90vh',
  cursor: scale.value > 1 ? (isDragging.value ? 'grabbing' : 'grab') : 'default'
}))

/**
 * 媒体容器样式
 */
const mediaWrapperStyle = computed(() => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}))

// ==================== 监听 ====================
/**
 * 监听初始索引变化
 */
watch(() => props.initialIndex, (newValue) => {
  currentIndex.value = Math.min(newValue, totalMediaCount.value - 1)
  resetZoom()
})

/**
 * 监听媒体列表变化，确保当前索引不越界
 */
watch(() => allMediaItems.value, () => {
  currentIndex.value = Math.min(currentIndex.value, Math.max(0, totalMediaCount.value - 1))
}, { immediate: true })

/**
 * 监听可见性变化，打开时重置状态
 */
watch(() => props.visible, (isVisible) => {
  if (isVisible) {
    currentIndex.value = Math.min(props.initialIndex, Math.max(0, totalMediaCount.value - 1))
    resetZoom()
  }
})

// ==================== 方法定义 ====================
/**
 * 关闭查看器
 */
function close(): void {
  emit('update:visible', false)
  emit('close')
}

/**
 * 切换到上一个媒体
 */
function prev(): void {
  if (currentIndex.value > 0) {
    currentIndex.value--
    resetZoom()
  }
}

/**
 * 切换到下一个媒体
 */
function next(): void {
  if (currentIndex.value < totalMediaCount.value - 1) {
    currentIndex.value++
    resetZoom()
  }
}

/**
 * 重置缩放和位置
 */
function resetZoom(): void {
  scale.value = 1
  translateX.value = 0
  translateY.value = 0
}

/**
 * 放大
 */
function zoomIn(): void {
  if (scale.value < MAX_SCALE) {
    scale.value = Math.min(scale.value + SCALE_STEP, MAX_SCALE)
  }
}

/**
 * 缩小
 */
function zoomOut(): void {
  if (scale.value > MIN_SCALE) {
    scale.value = Math.max(scale.value - SCALE_STEP, MIN_SCALE)
    constrainTranslation()
  }
}

/**
 * 处理鼠标滚轮缩放
 */
function handleWheel(event: WheelEvent): void {
  if (!containerRef.value) return

  const rect = containerRef.value.getBoundingClientRect()
  const mouseX = event.clientX - rect.left - rect.width / 2
  const mouseY = event.clientY - rect.top - rect.height / 2

  const delta = event.deltaY > 0 ? -SCALE_STEP : SCALE_STEP
  const newScale = Math.max(MIN_SCALE, Math.min(scale.value + delta, MAX_SCALE))

  if (newScale !== scale.value) {
    const scaleRatio = newScale / scale.value
    translateX.value = mouseX - (mouseX - translateX.value) * scaleRatio
    translateY.value = mouseY - (mouseY - translateY.value) * scaleRatio
    scale.value = newScale
  }

  if (scale.value <= 1) {
    constrainTranslation()
  }
}

/**
 * 限制平移范围
 */
function constrainTranslation(): void {
  if (scale.value <= 1) {
    translateX.value = 0
    translateY.value = 0
  }
}

/**
 * 开始拖拽
 */
function startDrag(event: MouseEvent): void {
  // 仅图片支持拖拽，且需要放大状态
  if (currentMediaType.value !== 'image' || scale.value <= 1) return

  isDragging.value = true
  dragStartX.value = event.clientX
  dragStartY.value = event.clientY
  dragStartTranslateX.value = translateX.value
  dragStartTranslateY.value = translateY.value
}

/**
 * 拖拽中
 */
function onDrag(event: MouseEvent): void {
  if (!isDragging.value || scale.value <= 1) return

  translateX.value = dragStartTranslateX.value + (event.clientX - dragStartX.value)
  translateY.value = dragStartTranslateY.value + (event.clientY - dragStartY.value)
}

/**
 * 结束拖拽
 */
function endDrag(): void {
  isDragging.value = false
}

/**
 * 媒体加载完成回调
 */
function onMediaLoad(): void {
  resetZoom()
}

/**
 * 处理键盘事件
 */
function handleKeydown(event: KeyboardEvent): void {
  if (!props.visible) return

  switch (event.key) {
    case 'Escape':
      close()
      break
    case 'ArrowLeft':
      prev()
      break
    case 'ArrowRight':
      next()
      break
    case '+':
    case '=':
      if (currentMediaType.value === 'image') {
        zoomIn()
      }
      break
    case '-':
      if (currentMediaType.value === 'image') {
        zoomOut()
      }
      break
    case '0':
      if (currentMediaType.value === 'image') {
        resetZoom()
      }
      break
  }
}

// ==================== 生命周期 ====================
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
