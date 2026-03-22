<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-[100] flex items-center justify-center"
      >
        <div
          class="absolute inset-0 bg-black/40 backdrop-blur-sm"
          @click="handleCancel"
        />
        <Transition name="scale">
          <div
            v-if="visible"
            class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
          >
            <div class="p-6">
              <div class="flex items-start gap-4">
                <div
                  class="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                  :class="iconBgClass"
                >
                  <span
                    class="material-symbols-outlined text-2xl"
                    :class="iconClass"
                  >
                    {{ icon }}
                  </span>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-bold text-slate-900 mb-2">
                    {{ title }}
                  </h3>
                  <p class="text-sm text-slate-500 leading-relaxed">
                    {{ message }}
                  </p>
                </div>
              </div>
            </div>
            <div class="flex border-t border-slate-100">
              <button
                @click="handleCancel"
                class="flex-1 py-3.5 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition-colors"
              >
                {{ cancelText }}
              </button>
              <div class="w-px bg-slate-100"></div>
              <button
                @click="handleConfirm"
                class="flex-1 py-3.5 text-sm font-semibold transition-colors"
                :class="confirmBtnClass"
              >
                {{ confirmText }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type DialogType = 'warning' | 'danger' | 'info' | 'success'

const props = withDefaults(
  defineProps<{
    visible: boolean
    title: string
    message: string
    type?: DialogType
    confirmText?: string
    cancelText?: string
  }>(),
  {
    type: 'warning',
    confirmText: 'Confirm',
    cancelText: 'Cancel'
  }
)

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const iconConfig: Record<DialogType, { icon: string; iconClass: string; iconBgClass: string; confirmBtnClass: string }> = {
  warning: {
    icon: 'warning',
    iconClass: 'text-amber-500',
    iconBgClass: 'bg-amber-50',
    confirmBtnClass: 'text-amber-600 hover:bg-amber-50'
  },
  danger: {
    icon: 'delete',
    iconClass: 'text-red-500',
    iconBgClass: 'bg-red-50',
    confirmBtnClass: 'text-red-600 hover:bg-red-50'
  },
  info: {
    icon: 'info',
    iconClass: 'text-blue-500',
    iconBgClass: 'bg-blue-50',
    confirmBtnClass: 'text-blue-600 hover:bg-blue-50'
  },
  success: {
    icon: 'check_circle',
    iconClass: 'text-green-500',
    iconBgClass: 'bg-green-50',
    confirmBtnClass: 'text-green-600 hover:bg-green-50'
  }
}

const icon = computed(() => iconConfig[props.type].icon)
const iconClass = computed(() => iconConfig[props.type].iconClass)
const iconBgClass = computed(() => iconConfig[props.type].iconBgClass)
const confirmBtnClass = computed(() => iconConfig[props.type].confirmBtnClass)

function handleConfirm() {
  emit('confirm')
  emit('update:visible', false)
}

function handleCancel() {
  emit('cancel')
  emit('update:visible', false)
}
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

.scale-enter-active,
.scale-leave-active {
  transition: all 0.2s ease;
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
