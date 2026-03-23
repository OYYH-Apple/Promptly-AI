<template>
  <div class="titlebar flex items-center justify-between bg-white select-none" @dblclick="handleDoubleClick">
    <div class="flex items-center gap-3 px-4 drag-region flex-1">
      <div class="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
        <span class="material-symbols-outlined text-white text-lg">auto_awesome</span>
      </div>
      <span class="text-sm font-semibold text-slate-700">Promptly AI</span>
    </div>
    <div class="flex items-center no-drag">
      <button
        @click="minimize"
        class="w-12 h-10 flex items-center justify-center hover:bg-slate-100 transition-colors group"
      >
        <span class="material-symbols-outlined text-slate-400 group-hover:text-slate-600 text-xl">remove</span>
      </button>
      <button
        @click="maximize"
        class="w-12 h-10 flex items-center justify-center hover:bg-slate-100 transition-colors group"
      >
        <span class="material-symbols-outlined text-slate-400 group-hover:text-slate-600 text-xl">
          {{ isMaximized ? 'filter_none' : 'crop_square' }}
        </span>
      </button>
      <button
        @click="close"
        class="w-12 h-10 flex items-center justify-center hover:bg-red-500 transition-colors group"
      >
        <span class="material-symbols-outlined text-slate-400 group-hover:text-white text-xl">close</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isMaximized = ref(false)

async function checkMaximized() {
  isMaximized.value = await window.api.isMaximized()
}

function minimize() {
  window.api.minimizeWindow()
}

async function maximize() {
  isMaximized.value = await window.api.maximizeWindow()
}

function close() {
  window.api.closeWindow()
}

function handleDoubleClick() {
  maximize()
}

onMounted(() => {
  checkMaximized()
  window.addEventListener('resize', checkMaximized)
})
</script>

<style scoped>
.titlebar {
  height: 40px;
  -webkit-app-region: drag;
}

.no-drag {
  -webkit-app-region: no-drag;
}

.drag-region {
  -webkit-app-region: drag;
}
</style>
