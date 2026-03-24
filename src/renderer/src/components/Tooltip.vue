<template>
  <div
    ref="wrapperRef"
    class="tooltip-wrapper"
    @mouseenter="showTooltip"
    @mouseleave="hideTooltip"
  >
    <slot />
    <Transition name="tooltip">
      <div
        v-if="visible && text"
        ref="tooltipRef"
        class="tooltip"
        :style="tooltipStyle"
      >
        {{ text }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'

interface Props {
  text: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
}

const props = withDefaults(defineProps<Props>(), {
  placement: 'top',
  delay: 200
})

const visible = ref(false)
const wrapperRef = ref<HTMLElement | null>(null)
const tooltipRef = ref<HTMLElement | null>(null)
const pos = ref({ x: 0, y: 0 })

let showTimer: ReturnType<typeof setTimeout> | null = null
let hideTimer: ReturnType<typeof setTimeout> | null = null

const tooltipStyle = computed(() => ({
  left: `${pos.value.x}px`,
  top: `${pos.value.y}px`
}))

function updatePosition() {
  if (!wrapperRef.value || !tooltipRef.value) return

  const targetRect = wrapperRef.value.getBoundingClientRect()
  const tooltipRect = tooltipRef.value.getBoundingClientRect()

  if (tooltipRect.width === 0 && tooltipRect.height === 0) {
    requestAnimationFrame(updatePosition)
    return
  }

  let x = 0
  let y = 0

  switch (props.placement) {
    case 'top':
      x = targetRect.left + (targetRect.width - tooltipRect.width) / 2
      y = targetRect.top - tooltipRect.height - 8
      break
    case 'bottom':
      x = targetRect.left + (targetRect.width - tooltipRect.width) / 2
      y = targetRect.bottom + 8
      break
    case 'left':
      x = targetRect.left - tooltipRect.width - 8
      y = targetRect.top + (targetRect.height - tooltipRect.height) / 2
      break
    case 'right':
      x = targetRect.right + 8
      y = targetRect.top + (targetRect.height - tooltipRect.height) / 2
      break
  }

  pos.value = { x, y }
}

function showTooltip() {
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }

  showTimer = setTimeout(async () => {
    visible.value = true
    await nextTick()
    requestAnimationFrame(updatePosition)
  }, props.delay)
}

function hideTooltip() {
  if (showTimer) {
    clearTimeout(showTimer)
    showTimer = null
  }

  hideTimer = setTimeout(() => {
    visible.value = false
  }, 100)
}

watch(visible, (val) => {
  if (val) {
    requestAnimationFrame(updatePosition)
  }
})

onBeforeUnmount(() => {
  if (showTimer) clearTimeout(showTimer)
  if (hideTimer) clearTimeout(hideTimer)
})
</script>

<style scoped>
.tooltip-wrapper {
  display: inline-flex;
}

.tooltip {
  position: fixed;
  z-index: 9999;
  padding: 6px 12px;
  background-color: #1e293b;
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  border-radius: 8px;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.tooltip-enter-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.tooltip-leave-active {
  transition: opacity 0.1s ease;
}

.tooltip-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.tooltip-leave-to {
  opacity: 0;
}
</style>
