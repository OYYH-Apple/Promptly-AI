<!-- ==================== 组件说明 ==================== -->
<!--
  VideoPlayer 组件
  可复用的视频播放组件，统一视频播放逻辑
  支持自定义控制条、封面图、自动播放、循环播放、静音、倍速、全屏等配置
-->

<!-- ==================== 模板结构 ==================== -->
<template>
    <div ref="videoContainerRef" class="video-player-container relative rounded-2xl bg-black overflow-hidden group">
        <!-- 视频元素 -->
        <video ref="videoElementRef" class="w-full h-full object-contain cursor-pointer" :src="src" :poster="poster"
            :controls="controls && !customControls" :autoplay="autoplay" :loop="loop" :muted="isMuted"
            @loadeddata="handleVideoLoaded" @error="handleVideoError" @timeupdate="handleTimeUpdate"
            @play="isPlaying = true" @pause="isPlaying = false" @click="togglePlay" />

        <!-- 自定义控制条 -->
        <div v-if="customControls" class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4
                   opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <!-- 进度条 -->
            <div class="w-full h-1 bg-white/30 rounded-full mb-3 cursor-pointer hover:h-1.5 transition-all"
                @click.stop="seek">
                <div class="h-full bg-primary rounded-full transition-all relative"
                    :style="{ width: `${progressPercentage}%` }">
                    <!-- 进度条滑块 -->
                    <div
                        class="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            </div>

            <!-- 控制按钮行 -->
            <div class="flex items-center justify-between">
                <!-- 左侧控制区：播放/暂停 + 时间 -->
                <div class="flex items-center gap-3">
                    <!-- 播放/暂停按钮 -->
                    <button @click.stop="togglePlay" class="text-white hover:text-primary transition-colors">
                        <span class="material-symbols-outlined text-2xl">
                            {{ isPlaying ? 'pause' : 'play_arrow' }}
                        </span>
                    </button>

                    <!-- 时间显示 -->
                    <span class="text-white text-sm font-medium">
                        {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
                    </span>
                </div>

                <!-- 右侧控制区：音量 + 倍速 + 全屏 -->
                <div class="flex items-center gap-3">
                    <!-- 音量控制 -->
                    <div class="flex items-center gap-1 group/volume">
                        <button @click.stop="toggleMute" class="text-white hover:text-primary transition-colors">
                            <span class="material-symbols-outlined">
                                {{ isMuted ? 'volume_off' : 'volume_up' }}
                            </span>
                        </button>
                        <input type="range" min="0" max="1" step="0.1" :value="volume" @input="setVolume" @click.stop
                            class="w-0 group-hover/volume:w-20 accent-primary transition-all duration-300 overflow-hidden" />
                    </div>

                    <!-- 倍速选择 -->
                    <select :value="playbackRate" @change="setPlaybackRate" @click.stop
                        class="bg-black/50 text-white text-sm border border-white/30 rounded px-2 py-1 hover:border-primary transition-colors cursor-pointer">
                        <option value="0.5" class="bg-gray-800">0.5x</option>
                        <option value="1" class="bg-gray-800">1x</option>
                        <option value="1.5" class="bg-gray-800">1.5x</option>
                        <option value="2" class="bg-gray-800">2x</option>
                    </select>

                    <!-- 全屏按钮 -->
                    <button @click.stop="toggleFullscreen" class="text-white hover:text-primary transition-colors">
                        <span class="material-symbols-outlined">
                            {{ isFullscreen ? 'fullscreen_exit' : 'fullscreen' }}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<!-- ==================== 脚本逻辑 ==================== -->
<script setup lang="ts">
// ==================== 依赖引入 ====================
import { ref, computed, onMounted, onUnmounted } from 'vue'

// ==================== 类型定义 ====================
/**
 * 组件 Props 接口定义
 */
interface VideoPlayerProps {
    /** 视频路径（已带 app-video:// 前缀） */
    src: string
    /** 封面图 URL */
    poster?: string
    /** 是否显示原生控制条，默认 true */
    controls?: boolean
    /** 是否显示自定义控制条，默认 true */
    customControls?: boolean
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
const props = withDefaults(defineProps<VideoPlayerProps>(), {
    poster: undefined,
    controls: true,
    customControls: true,
    autoplay: false,
    loop: false,
    muted: false,
})

// ==================== Emits 定义 ====================
const emit = defineEmits<VideoPlayerEmits>()

// ==================== 响应式数据 ====================
/** 视频容器元素引用 */
const videoContainerRef = ref<HTMLDivElement | null>(null)

/** video 元素引用 */
const videoElementRef = ref<HTMLVideoElement | null>(null)

/** 播放状态 */
const isPlaying = ref(false)

/** 静音状态 */
const isMuted = ref(props.muted)

/** 全屏状态 */
const isFullscreen = ref(false)

/** 当前播放时间（秒） */
const currentTime = ref(0)

/** 视频总时长（秒） */
const duration = ref(0)

/** 音量（0-1） */
const volume = ref(1)

/** 播放倍速 */
const playbackRate = ref(1)

/** 进度百分比 */
const progressPercentage = computed(() => {
    if (!duration.value || duration.value === 0) return 0
    return (currentTime.value / duration.value) * 100
})

// ==================== 事件处理 ====================
/**
 * 视频加载完成回调
 * 当视频元数据加载完成后触发，通知父组件视频已就绪
 */
function handleVideoLoaded(): void {
    // 初始化视频时长
    if (videoElementRef.value) {
        duration.value = videoElementRef.value.duration
    }
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

/**
 * 播放时间更新回调
 * 视频播放过程中持续触发，更新当前播放时间和总时长
 */
function handleTimeUpdate(): void {
    if (videoElementRef.value) {
        currentTime.value = videoElementRef.value.currentTime
        duration.value = videoElementRef.value.duration
    }
}

// ==================== 播放控制 ====================
/**
 * 播放/暂停切换
 * 点击视频或播放按钮时触发
 */
function togglePlay(): void {
    if (!videoElementRef.value) return

    if (isPlaying.value) {
        videoElementRef.value.pause()
    } else {
        videoElementRef.value.play()
    }
}

/**
 * 静音/取消静音切换
 */
function toggleMute(): void {
    isMuted.value = !isMuted.value
    if (videoElementRef.value) {
        videoElementRef.value.muted = isMuted.value
    }
}

/**
 * 设置音量
 * @param event - 输入事件对象
 */
function setVolume(event: Event): void {
    const target = event.target as HTMLInputElement
    const newVolume = parseFloat(target.value)
    volume.value = newVolume

    if (videoElementRef.value) {
        videoElementRef.value.volume = newVolume
        // 如果音量大于0且当前是静音状态，则取消静音
        if (newVolume > 0 && isMuted.value) {
            isMuted.value = false
            videoElementRef.value.muted = false
        }
    }
}

/**
 * 设置播放倍速
 * @param event - 选择事件对象
 */
function setPlaybackRate(event: Event): void {
    const target = event.target as HTMLSelectElement
    const newRate = parseFloat(target.value)
    playbackRate.value = newRate

    if (videoElementRef.value) {
        videoElementRef.value.playbackRate = newRate
    }
}

/**
 * 视频跳转
 * 点击进度条时跳转到对应位置
 * @param event - 鼠标点击事件
 */
function seek(event: MouseEvent): void {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const percent = (event.clientX - rect.left) / rect.width

    if (videoElementRef.value && duration.value) {
        const newTime = percent * duration.value
        videoElementRef.value.currentTime = newTime
        currentTime.value = newTime
    }
}

/**
 * 全屏切换
 */
async function toggleFullscreen(): Promise<void> {
    const container = videoContainerRef.value
    if (!container) return

    try {
        if (document.fullscreenElement) {
            await document.exitFullscreen()
        } else {
            await container.requestFullscreen()
        }
    } catch (error) {
        console.error('全屏切换失败:', error)
    }
}

/**
 * 全屏状态变化监听回调
 */
function handleFullscreenChange(): void {
    isFullscreen.value = !!document.fullscreenElement
}

/**
 * 格式化时间显示
 * 将秒数转换为 mm:ss 格式
 * @param seconds - 秒数
 * @returns 格式化后的时间字符串
 */
function formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '0:00'

    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

// ==================== 生命周期 ====================
onMounted(() => {
    // 监听全屏状态变化
    document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
    // 移除全屏状态监听
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
})

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

/**
 * 设置音量
 * 供父组件通过 ref 调用
 * @param newVolume - 目标音量（0-1）
 */
function setVolumeByValue(newVolume: number): void {
    volume.value = Math.max(0, Math.min(1, newVolume))
    if (videoElementRef.value) {
        videoElementRef.value.volume = volume.value
    }
}

/**
 * 设置播放倍速
 * 供父组件通过 ref 调用
 * @param rate - 目标倍速
 */
function setPlaybackRateByValue(rate: number): void {
    playbackRate.value = rate
    if (videoElementRef.value) {
        videoElementRef.value.playbackRate = rate
    }
}

// 暴露方法供父组件调用
defineExpose({
    play,
    pause,
    getCurrentTime,
    setCurrentTime,
    getDuration,
    setVolume: setVolumeByValue,
    setPlaybackRate: setPlaybackRateByValue,
})
</script>

<!-- ==================== 样式定义 ==================== -->
<style scoped>
.video-player-container {
    /* 确保容器有最小高度，避免视频未加载时塌陷 */
    min-height: 120px;
}
</style>
