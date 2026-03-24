<template>
  <div v-if="imageUrl" class="thumb-wrapper" :style="{ transform: `rotate(${rotation}deg)` }">
    <div
      class="thumb-container rounded-sm shadow-lg border-2 border-white overflow-hidden bg-white cursor-zoom-in flex-shrink-0"
      :style="{ height: size === 'large' ? '112px' : '64px', padding: size === 'large' ? '3px' : '0px', minWidth: size === 'large' ? '80px' : '45px' }"
      @click.stop="$emit('click')"
    >
      <img
        :src="imageUrl"
        alt="Thumbnail"
        class="w-full h-full object-contain"
      />
    </div>
    <span
      v-if="count > 1"
      class="absolute bg-primary text-white rounded-full flex items-center justify-center font-medium z-20"
      :class="size === 'large' ? '-top-2 -left-2 w-5 h-5 text-[10px]' : '-top-1 -left-1 w-4 h-4 text-[9px]'"
    >
      {{ count }}
    </span>
    <span
      class="material-symbols-outlined absolute left-1/2 -translate-x-1/2 text-slate-400 z-10 pointer-events-none"
      :class="size === 'large' ? '-top-4' : '-top-3'"
      :style="attachmentStyle"
    >
      attachment
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  imageUrl: string
  count?: number
  rotation?: number
  size?: 'small' | 'large'
}>(), {
  count: 1,
  rotation: 0,
  size: 'small'
})

const attachmentStyle = computed(() => {
  const fontSize = props.size === 'large' ? '28px' : '14px'
  const translateY = props.size === 'large' ? '8px' : '5px'
  return {
    fontVariationSettings: "'wght' 300",
    fontSize,
    transform: `translateX(-50%) translateY(${translateY}) rotate(40deg) scaleX(-1)`
  }
})

defineEmits<{
  (e: 'click'): void
}>()
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
