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
        <div class="relative flex items-center justify-center" :style="imageWrapperStyle">
          <img
            ref="imageRef"
            :src="currentImage"
            :alt="alt"
            class="rounded-lg shadow-2xl select-none"
            :style="imageStyle"
            @click.stop
            @load="onImageLoad"
            draggable="false"
          />
        </div>
        <button
          @click.stop="close"
          class="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
        >
          <span class="material-symbols-outlined">close</span>
        </button>
        <button
          @click.stop="resetZoom"
          class="absolute top-4 left-4 px-3 h-10 flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-full text-white text-sm font-medium transition-colors z-10"
        >
          <span class="material-symbols-outlined text-lg">fit_screen</span>
          {{ Math.round(scale * 100) }}%
        </button>
        <button
          v-if="showNavigation && currentIndex > 0"
          @click.stop="prev"
          class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
        >
          <span class="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <button
          v-if="showNavigation && currentIndex < totalImages - 1"
          @click.stop="next"
          class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
        >
          <span class="material-symbols-outlined">arrow_forward_ios</span>
        </button>
        <div
          v-if="showNavigation && totalImages > 1"
          class="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 rounded-full text-white text-sm font-medium"
        >
          {{ currentIndex + 1 }} / {{ totalImages }}
        </div>
        <div class="absolute bottom-4 right-4 flex gap-2 z-10">
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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  visible: boolean
  images: string[]
  initialIndex?: number
  alt?: string
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'close'): void
}>()

const MIN_SCALE = 0.5
const MAX_SCALE = 5
const SCALE_STEP = 0.15

const containerRef = ref<HTMLElement | null>(null)
const imageRef = ref<HTMLImageElement | null>(null)
const currentIndex = ref(props.initialIndex || 0)
const scale = ref(1)
const translateX = ref(0)
const translateY = ref(0)
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)
const dragStartTranslateX = ref(0)
const dragStartTranslateY = ref(0)

const currentImage = computed(() => props.images[currentIndex.value] || '')
const totalImages = computed(() => props.images.length)
const showNavigation = computed(() => totalImages.value > 1)

const imageStyle = computed(() => ({
  transform: `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`,
  transition: isDragging.value ? 'none' : 'transform 0.15s ease-out',
  maxWidth: '90vw',
  maxHeight: '90vh',
  cursor: scale.value > 1 ? (isDragging.value ? 'grabbing' : 'grab') : 'default'
}))

const imageWrapperStyle = computed(() => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}))

watch(() => props.initialIndex, (val) => {
  if (val !== undefined) {
    currentIndex.value = val
    resetZoom()
  }
})

watch(() => props.visible, (val) => {
  if (val) {
    resetZoom()
  }
})

function close() {
  emit('update:visible', false)
  emit('close')
}

function prev() {
  if (currentIndex.value > 0) {
    currentIndex.value--
    resetZoom()
  }
}

function next() {
  if (currentIndex.value < totalImages.value - 1) {
    currentIndex.value++
    resetZoom()
  }
}

function resetZoom() {
  scale.value = 1
  translateX.value = 0
  translateY.value = 0
}

function zoomIn() {
  if (scale.value < MAX_SCALE) {
    scale.value = Math.min(scale.value + SCALE_STEP, MAX_SCALE)
  }
}

function zoomOut() {
  if (scale.value > MIN_SCALE) {
    scale.value = Math.max(scale.value - SCALE_STEP, MIN_SCALE)
    constrainTranslation()
  }
}

function handleWheel(e: WheelEvent) {
  if (!containerRef.value) return

  const rect = containerRef.value.getBoundingClientRect()
  const mouseX = e.clientX - rect.left - rect.width / 2
  const mouseY = e.clientY - rect.top - rect.height / 2

  const delta = e.deltaY > 0 ? -SCALE_STEP : SCALE_STEP
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

function constrainTranslation() {
  if (scale.value <= 1) {
    translateX.value = 0
    translateY.value = 0
  }
}

function startDrag(e: MouseEvent) {
  if (scale.value <= 1) return

  isDragging.value = true
  dragStartX.value = e.clientX
  dragStartY.value = e.clientY
  dragStartTranslateX.value = translateX.value
  dragStartTranslateY.value = translateY.value
}

function onDrag(e: MouseEvent) {
  if (!isDragging.value || scale.value <= 1) return

  translateX.value = dragStartTranslateX.value + (e.clientX - dragStartX.value)
  translateY.value = dragStartTranslateY.value + (e.clientY - dragStartY.value)
}

function endDrag() {
  isDragging.value = false
}

function onImageLoad() {
  resetZoom()
}

function handleKeydown(e: KeyboardEvent) {
  if (!props.visible) return

  if (e.key === 'Escape') {
    close()
  } else if (e.key === 'ArrowLeft') {
    prev()
  } else if (e.key === 'ArrowRight') {
    next()
  } else if (e.key === '+' || e.key === '=') {
    zoomIn()
  } else if (e.key === '-') {
    zoomOut()
  } else if (e.key === '0') {
    resetZoom()
  }
}

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
