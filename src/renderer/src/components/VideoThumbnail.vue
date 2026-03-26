<template>
    <div class="thumb-wrapper" :style="{ transform: `rotate(${rotation}deg)` }" @mouseenter="startPreview"
        @mouseleave="stopPreview">
        <div class="thumb-container rounded-xl overflow-hidden bg-black cursor-pointer flex-shrink-0 relative"
            :class="sizeClasses[size]" :style="containerStyle" @click.stop="emit('click')">
            <!-- 缩略图/预览视频 -->
            <template v-if="!isPlaying">
                <img v-if="thumbnailUrl" :src="thumbnailUrl" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center">
                    <span class="material-symbols-outlined text-white/70">videocam</span>
                </div>
            </template>

            <!-- Hover 预览视频 -->
            <video v-else ref="videoRef" :src="formattedVideoUrl" class="w-full h-full object-cover" muted loop autoplay
                playsinline />

            <!-- 视频标识角标 -->
            <div
                class="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center z-10">
                <span class="material-symbols-outlined text-white text-xs">videocam</span>
            </div>
        </div>

        <!-- 数量角标 -->
        <span v-if="showBadge && count && count > 1"
            class="absolute bg-primary text-white rounded-full flex items-center justify-center font-medium z-20"
            :class="badgeClasses[size]">
            {{ count }}
        </span>

        <!-- 回形针装饰 -->
        <span
            class="material-symbols-outlined absolute left-1/2 -translate-x-1/2 text-slate-400 z-10 pointer-events-none"
            :class="clipClasses[size]" :style="attachmentStyle">
            attachment
        </span>
    </div>
</template>

<script setup lang="ts">
// ==================== 依赖引入 ====================
import { ref, computed } from 'vue'

// ==================== 类型定义 ====================
interface Props {
    /** 视频路径（已带 app-video:// 前缀或纯路径） */
    videoUrl: string
    /** 缩略图路径（可选，如果没有则显示视频图标） */
    thumbnailUrl?: string
    /** 尺寸：small(40px) | medium(56px) | large(72px) */
    size?: 'small' | 'medium' | 'large'
    /** 旋转角度 */
    rotation?: number
    /** 是否显示角标 */
    showBadge?: boolean
    /** 角标数量 */
    count?: number
}

// ==================== Props 定义 ====================
const props = withDefaults(defineProps<Props>(), {
    size: 'large',
    rotation: 0,
    showBadge: true,
    count: 1,
})

// ==================== Emits 定义 ====================
const emit = defineEmits<{
    (e: 'click'): void
}>()

// ==================== 状态定义 ====================
const isPlaying = ref(false)
const videoRef = ref<HTMLVideoElement | null>(null)

// ==================== 常量定义 ====================
const sizeClasses = {
    small: 'w-10 h-10',
    medium: 'w-14 h-14',
    large: 'w-[72px] h-[72px]',
}

const badgeClasses = {
    small: '-top-1 -left-1 w-4 h-4 text-[9px]',
    medium: '-top-1.5 -left-1.5 w-4.5 h-4.5 text-[10px]',
    large: '-top-2 -left-2 w-5 h-5 text-[10px]',
}

const clipClasses = {
    small: '-top-3',
    medium: '-top-3.5',
    large: '-top-4',
}

// ==================== 计算属性 ====================
const containerStyle = computed(() => {
    // 大尺寸时添加边框和内边距
    if (props.size === 'large') {
        return {
            border: '2px solid white',
            padding: '3px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        }
    }
    return {}
})

const formattedVideoUrl = computed(() => {
    // 如果已经带有 app-video:// 前缀，直接返回
    if (props.videoUrl.startsWith('app-video://')) {
        return props.videoUrl
    }
    // 否则添加前缀并编码路径
    return `app-video://${encodeURIComponent(props.videoUrl)}`
})

const attachmentStyle = computed(() => {
    const fontSize = props.size === 'large' ? '28px' : props.size === 'medium' ? '20px' : '14px'
    const translateY = props.size === 'large' ? '8px' : props.size === 'medium' ? '6px' : '5px'
    return {
        fontVariationSettings: "'wght' 300",
        fontSize,
        transform: `translateX(-50%) translateY(${translateY}) rotate(40deg) scaleX(-1)`,
    }
})

// ==================== 事件处理 ====================
function startPreview() {
    isPlaying.value = true
}

function stopPreview() {
    isPlaying.value = false
    // 重置视频状态
    if (videoRef.value) {
        videoRef.value.pause()
        videoRef.value.currentTime = 0
    }
}
</script>

<style scoped>
.thumb-wrapper {
    position: relative;
    display: inline-block;
    transform-origin: 50% 0%;
    transition:
        transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
        filter 0.4s ease;
    will-change: transform;
}

.thumb-wrapper:hover {
    transform: perspective(800px) rotateX(18deg) rotateY(-20deg) translateY(-2px) !important;
}

.thumb-wrapper:hover .thumb-container {
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
}

.thumb-container {
    transition: box-shadow 0.4s ease;
}
</style>
