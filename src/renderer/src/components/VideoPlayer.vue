<!-- ==================== 组件说明 ==================== -->
<!-- 
  VideoPlayer 组件
  可复用的视频播放组件，统一视频播放逻辑
  支持自定义控制条、封面图、自动播放、循环播放、静音等配置
-->

<!-- ==================== 模板结构 ==================== -->
<template>
    <div class="video-player-container rounded-2xl bg-black overflow-hidden">
        <video ref="videoElementRef" class="w-full h-full object-contain" :src="src" :poster="poster"
            :controls="controls" :autoplay="autoplay" :loop="loop" :muted="muted" @loadeddata="handleVideoLoaded"
            @error="handleVideoError" />
    </div>
</template>

<!-- ==================== 脚本逻辑 ==================== -->
<script setup lang="ts">
// ==================== 依赖引入 ====================
import { ref } from 'vue'

// ==================== 类型定义 ====================
/**
 * 组件 Props 接口定义
 */
interface VideoPlayerProps {
    /** 视频路径（已带 app-video:// 前缀） */
    src: string
    /** 封面图 URL */
    poster?: string
    /** 是否显示控制条，默认 true */
    controls?: boolean
    /** 是否自动播放，默认 false */
    autoplay?: boolean
    /** 是否循环，默认 false */
    loop?: boolean
    /** 是否静音，默认 false */
    muted?: boolean
}

/**
 * 组件事件定义
 */
interface VideoPlayerEmits {
    /** 视频加载完成事件 */
    (event: 'loaded'): void
    /** 视频加载错误事件 */
    (event: 'error', error: Event): void
}

// ==================== Props 定义 ====================
// 使用 withDefaults 定义 Props 默认值，不在脚本中显式使用 props 变量
// 模板中通过响应式语法糖直接访问（如 :src="src"）
withDefaults(defineProps<VideoPlayerProps>(), {
    poster: undefined,
    controls: true,
    autoplay: false,
    loop: false,
    muted: false,
})

// ==================== Emits 定义 ====================
const emit = defineEmits<VideoPlayerEmits>()

// ==================== 响应式数据 ====================
/** video 元素引用 */
const videoElementRef = ref<HTMLVideoElement | null>(null)

// ==================== 事件处理 ====================
/**
 * 视频加载完成回调
 * 当视频元数据加载完成后触发，通知父组件视频已就绪
 */
function handleVideoLoaded(): void {
    emit('loaded')
}

/**
 * 视频加载错误回调
 * 当视频加载失败时触发，将错误事件传递给父组件处理
 * @param errorEvent - 错误事件对象
 */
function handleVideoError(errorEvent: Event): void {
    emit('error', errorEvent)
}

// ==================== 暴露方法 ====================
/**
 * 播放视频
 * 供父组件通过 ref 调用
 */
function play(): void {
    videoElementRef.value?.play()
}

/**
 * 暂停视频
 * 供父组件通过 ref 调用
 */
function pause(): void {
    videoElementRef.value?.pause()
}

/**
 * 获取视频当前播放时间
 * @returns 当前播放时间（秒），若视频未加载则返回 0
 */
function getCurrentTime(): number {
    return videoElementRef.value?.currentTime ?? 0
}

/**
 * 设置视频播放时间
 * @param time - 目标播放时间（秒）
 */
function setCurrentTime(time: number): void {
    if (videoElementRef.value) {
        videoElementRef.value.currentTime = time
    }
}

/**
 * 获取视频总时长
 * @returns 视频总时长（秒），若视频未加载则返回 0
 */
function getDuration(): number {
    return videoElementRef.value?.duration ?? 0
}

// 暴露方法供父组件调用
defineExpose({
    play,
    pause,
    getCurrentTime,
    setCurrentTime,
    getDuration,
})
</script>

<!-- ==================== 样式定义 ==================== -->
<style scoped>
.video-player-container {
    /* 确保容器有最小高度，避免视频未加载时塌陷 */
    min-height: 120px;
}
</style>
