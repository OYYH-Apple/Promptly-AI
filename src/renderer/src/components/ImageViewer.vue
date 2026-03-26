<template>
  <!--
    ImageViewer 组件（向后兼容版本）
    该组件现已作为 MediaViewer 的包装器存在，保持向后兼容
    新代码建议直接使用 MediaViewer 组件以获得更完整的功能
  -->
  <MediaViewer
    v-model:visible="props.visible"
    :images="props.images"
    :videos="[]"
    :initial-index="props.initialIndex"
    :alt="props.alt"
    @close="emit('close')"
  />
</template>

<script setup lang="ts">
// ==================== 依赖引入 ====================
import MediaViewer from './MediaViewer.vue'

// ==================== Props 定义 ====================
interface Props {
  /** 是否可见 */
  visible: boolean
  /** 图片路径数组 */
  images: string[]
  /** 初始索引 */
  initialIndex?: number
  /** 图片 alt 文本 */
  alt?: string
}

const props = defineProps<Props>()

// ==================== Emits 定义 ====================
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'close'): void
}>()
</script>
