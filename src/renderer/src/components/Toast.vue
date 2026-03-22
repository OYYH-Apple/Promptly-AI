<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border max-w-sm"
          :class="toastClass(toast.type)"
        >
          <span
            class="material-symbols-outlined text-lg shrink-0"
            :class="iconClass(toast.type)"
          >
            {{ icon(toast.type) }}
          </span>
          <span class="text-sm font-medium flex-1">{{ toast.message }}</span>
          <button
            @click="removeToast(toast.id)"
            class="shrink-0 hover:opacity-70 transition-opacity"
          >
            <span class="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
  duration: number
}

const toasts = ref<Toast[]>([])
let toastId = 0

const toastConfig: Record<ToastType, { icon: string; iconClass: string; toastClass: string }> = {
  success: {
    icon: 'check_circle',
    iconClass: 'text-green-500',
    toastClass: 'bg-white border-green-100 text-slate-700'
  },
  error: {
    icon: 'error',
    iconClass: 'text-red-500',
    toastClass: 'bg-white border-red-100 text-slate-700'
  },
  warning: {
    icon: 'warning',
    iconClass: 'text-amber-500',
    toastClass: 'bg-white border-amber-100 text-slate-700'
  },
  info: {
    icon: 'info',
    iconClass: 'text-blue-500',
    toastClass: 'bg-white border-blue-100 text-slate-700'
  }
}

function icon(type: ToastType) {
  return toastConfig[type].icon
}

function iconClass(type: ToastType) {
  return toastConfig[type].iconClass
}

function toastClass(type: ToastType) {
  return toastConfig[type].toastClass
}

function addToast(message: string, type: ToastType = 'info', duration: number = 3000) {
  const id = ++toastId
  toasts.value.push({ id, message, type, duration })
  if (duration > 0) {
    setTimeout(() => removeToast(id), duration)
  }
  return id
}

function removeToast(id: number) {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

function handleToast(event: CustomEvent) {
  const { message, type, duration } = event.detail
  addToast(message, type, duration)
}

onMounted(() => {
  window.addEventListener('show-toast', handleToast as EventListener)
})

onUnmounted(() => {
  window.removeEventListener('show-toast', handleToast as EventListener)
})

defineExpose({ addToast, removeToast })
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
